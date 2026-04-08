import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";
import * as turf from "@turf/turf";
import type { Feature, MultiPolygon, Polygon } from "geojson";

import { db } from "./index";
import { buildings } from "./schema";

type GeoFeature = {
  id?: string;
  properties?: Record<string, unknown>;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
};

type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

function toStringValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function toFloorCount(value: unknown): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(parsed);
  }
  return 10;
}

function buildAddress(props: Record<string, unknown>): string {
  const rawAddress = [
    toStringValue(props["addr:housenumber"]),
    toStringValue(props["addr:street"]),
    toStringValue(props["addr:subdistrict"]),
    toStringValue(props["addr:district"]),
    toStringValue(props["addr:city"]),
    toStringValue(props["addr:province"]),
  ].filter((part): part is string => Boolean(part));

  if (rawAddress.length > 0) {
    return rawAddress.join(", ");
  }

  return "Chưa có địa chỉ chi tiết";
}

function getName(props: Record<string, unknown>, fallbackId: string): string {
  return (
    toStringValue(props["name:vi"]) ||
    toStringValue(props.name) ||
    toStringValue(props["@id"]) ||
    fallbackId
  );
}

function toCentroid(feature: GeoFeature): { lng: number; lat: number } | null {
  if (!feature.geometry?.type || !feature.geometry.coordinates) {
    return null;
  }

  if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
    return null;
  }

  try {
    const polygonFeature: Feature<Polygon | MultiPolygon> =
      feature.geometry.type === "Polygon"
        ? {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: feature.geometry.coordinates as number[][][],
            },
          }
        : {
            type: "Feature",
            properties: {},
            geometry: {
              type: "MultiPolygon",
              coordinates: feature.geometry.coordinates as number[][][][],
            },
          };

    const centroid = turf.centroid(polygonFeature);

    const [lng, lat] = centroid.geometry.coordinates;

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return { lng, lat };
  } catch {
    return null;
  }
}

async function run(): Promise<void> {
  const argPath = process.argv[2] ?? "./src/db/geojson/apartments_r10km_cleaned.geojson";
  const filePath = path.isAbsolute(argPath)
    ? argPath
    : path.resolve(process.cwd(), argPath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy file GeoJSON: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as GeoFeatureCollection;

  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error("File không đúng định dạng GeoJSON FeatureCollection");
  }

  const existing = await db.select({ id: buildings.id, description: buildings.description }).from(buildings);
  const importedSourceIds = new Set<string>();

  for (const row of existing) {
    const description = row.description ?? "";
    const marker = description.match(/OSM_ID:\s*([^\n]+)/);
    if (marker?.[1]) {
      importedSourceIds.add(marker[1].trim());
    }
  }

  const rowsToInsert: Array<{
    name: string;
    address: string;
    ward: string | null;
    district: string | null;
    city: string | null;
    totalFloors: number;
    description: string;
    lng: number;
    lat: number;
  }> = [];

  let skippedNoGeometry = 0;
  let skippedAlreadyImported = 0;

  parsed.features.forEach((feature, index) => {
    const centroid = toCentroid(feature);
    if (!centroid) {
      skippedNoGeometry += 1;
      return;
    }

    const props = feature.properties ?? {};
    const sourceId =
      toStringValue(props.id) ||
      toStringValue(props["@id"]) ||
      feature.id ||
      `feature-${index + 1}`;

    if (importedSourceIds.has(sourceId)) {
      skippedAlreadyImported += 1;
      return;
    }

    rowsToInsert.push({
      name: getName(props, sourceId),
      address: buildAddress(props),
      ward: toStringValue(props["addr:subdistrict"]),
      district: toStringValue(props["addr:district"]),
      city: toStringValue(props["addr:city"]) || toStringValue(props["addr:province"]),
      totalFloors: toFloorCount(props["building:levels"]),
      description: `Imported from GeoJSON\nOSM_ID: ${sourceId}`,
      lng: centroid.lng,
      lat: centroid.lat,
    });
  });

  if (rowsToInsert.length === 0) {
    console.log("Không có bản ghi mới để import.");
    console.log(`Bỏ qua do thiếu geometry: ${skippedNoGeometry}`);
    console.log(`Bỏ qua do đã import trước đó: ${skippedAlreadyImported}`);
    return;
  }

  const chunkSize = 200;
  for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
    const chunk = rowsToInsert.slice(i, i + chunkSize);
    await db.insert(buildings).values(
      chunk.map((item) => ({
        name: item.name,
        address: item.address,
        ward: item.ward,
        district: item.district,
        city: item.city,
        totalFloors: item.totalFloors,
        description: item.description,
        location: sql`ST_SetSRID(ST_MakePoint(${item.lng}, ${item.lat}, 0), 4326)`,
      })),
    );
  }

  console.log(`Import thành công ${rowsToInsert.length} tòa nhà từ file: ${filePath}`);
  console.log(`Bỏ qua do thiếu geometry: ${skippedNoGeometry}`);
  console.log(`Bỏ qua do đã import trước đó: ${skippedAlreadyImported}`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Import thất bại:", error);
    process.exit(1);
  });
