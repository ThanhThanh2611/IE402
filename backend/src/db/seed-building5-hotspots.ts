import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./index";
import { apartments, floors, navigationNodes } from "./schema";

const BUILDING_ID = 5;

async function seedBuilding5Hotspots() {
  const buildingFloors = await db
    .select()
    .from(floors)
    .where(eq(floors.buildingId, BUILDING_ID))
    .orderBy(asc(floors.floorNumber));

  if (buildingFloors.length === 0) {
    throw new Error(`Không tìm thấy tầng nào của building ${BUILDING_ID}`);
  }

  const floorIds = buildingFloors.map((floor) => floor.id);
  const nodes = await db
    .select()
    .from(navigationNodes)
    .where(inArray(navigationNodes.floorId, floorIds))
    .orderBy(asc(navigationNodes.id));

  for (const floor of buildingFloors) {
    const floorNodes = nodes.filter((node) => node.floorId === floor.id);
    const doorNodes = floorNodes.filter((node) => node.nodeType === "door");

    const relatedApartments = await db
      .select({
        id: apartments.id,
        code: apartments.code,
        entryNodeId: apartments.entryNodeId,
      })
      .from(apartments)
      .where(and(eq(apartments.floorId, floor.id), isNull(apartments.deletedAt)))
      .orderBy(asc(apartments.code));

    for (const node of floorNodes) {
      let localX: string | null = null;
      let localY: string | null = "0.6";
      let localZ: string | null = null;
      let meshRef: string | null = null;
      let metadata: Record<string, unknown> | null = { source: "seed-building5-hotspots" };

      if (node.nodeType === "elevator") {
        localX = "-4.5";
        localZ = "-7.5";
        meshRef = `HOTSPOT_ELEVATOR_F${floor.floorNumber}`;
      } else if (node.nodeType === "stairs") {
        localX = "4.5";
        localZ = "-7.5";
        meshRef = `HOTSPOT_STAIRS_F${floor.floorNumber}`;
      } else if (node.nodeType === "junction") {
        localX = "0";
        localZ = "-1.5";
        meshRef = `HOTSPOT_JUNCTION_F${floor.floorNumber}`;
      } else if (node.nodeType === "door") {
        const apartmentIndex = relatedApartments.findIndex((apartment) => apartment.entryNodeId === node.id);
        const xSlots = ["-9.0", "0", "9.0", "18.0"];
        localX = xSlots[Math.max(apartmentIndex, 0)] ?? "0";
        localZ = "7.5";
        const matchedApartment = relatedApartments.find((apartment) => apartment.entryNodeId === node.id) ?? null;
        meshRef = matchedApartment
          ? `HOTSPOT_APT_${matchedApartment.code.replace(/[^A-Za-z0-9]/g, "_")}`
          : `HOTSPOT_DOOR_${node.id}`;
        metadata = {
          source: "seed-building5-hotspots",
          apartmentCode: matchedApartment?.code ?? null,
          apartmentOrder: apartmentIndex >= 0 ? apartmentIndex + 1 : null,
        };
      }

      await db
        .update(navigationNodes)
        .set({
          localX,
          localY,
          localZ,
          meshRef,
          metadata,
          updatedAt: new Date(),
        })
        .where(eq(navigationNodes.id, node.id));
    }

    console.log(
      `Seeded hotspot local coords for building ${BUILDING_ID}, floor ${floor.floorNumber}: ${doorNodes.length} door nodes`,
    );
  }
}

seedBuilding5Hotspots()
  .then(() => {
    console.log("Done seeding building 5 hotspots.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed building 5 hotspots failed:", error);
    process.exit(1);
  });
