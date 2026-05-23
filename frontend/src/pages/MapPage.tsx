import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import L, { latLngBounds, type LatLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageErrorState } from "@/components/PageFeedback";
import type {
  Building,
  BuildingGeoJsonFeature,
  BuildingGeoJsonFeatureCollection,
  BuildingOccupancyDetail,
  MapSnapshotFeatureCollection,
  NearbyBuildingResult,
  OccupancyHistoryPoint,
} from "@/types";
import { Filter, Loader2, MapPinned, Navigation, RotateCcw, Globe, Building2, MapPin, Coins, Compass, Search, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

function formatRealtimeCurrency(value: string): string {
  if (!value) return "";
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return "";
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")} tỷ VND`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")} triệu VND`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(0)} nghìn VND`;
  }
  return `${num} VND`;
}

type MapFilters = {
  district: string;
  city: string;
  ward: string;
  minPrice: string;
  maxPrice: string;
  search: string;
  occupancyRange: string;
  minFloors: string;
  maxFloors: string;
};

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009];
const DEFAULT_RADIUS_METERS = "3000";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeMonthValue(value: string): string | null {
  const match = value.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function monthToSnapshotDate(month: string): string {
  const normalized = normalizeMonthValue(month);
  if (!normalized) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  const [yearStr, monthStr] = normalized.split("-");
  const year = Number(yearStr);
  const monthNumber = Number(monthStr);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const normalized = normalizeMonthValue(month);
  if (!normalized) return month;

  const [year, monthNumber] = normalized.split("-");
  return `Th${Number(monthNumber)}/${year}`;
}

function formatDateLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function createEmptyFilters(): MapFilters {
  return {
    district: "",
    city: "",
    ward: "",
    minPrice: "",
    maxPrice: "",
    search: "",
    occupancyRange: "",
    minFloors: "",
    maxFloors: "",
  };
}

function buildQueryString(filters: MapFilters, includePrice = true): string {
  const params = new URLSearchParams();

  if (filters.city) params.set("city", filters.city);
  if (filters.district) params.set("district", filters.district);
  if (filters.ward) params.set("ward", filters.ward);

  if (includePrice) {
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  }

  return params.toString();
}

function toOccupancyRate(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function markerColor(occupancyRate: number): string {
  if (occupancyRate >= 80) return "var(--color-chart-5)";
  if (occupancyRate >= 50) return "var(--color-primary)";
  return "var(--color-chart-2)";
}

function markerRadius(occupancyRate: number, isNearby: boolean): number {
  const baseRadius = occupancyRate >= 80 ? 12 : occupancyRate >= 50 ? 10 : 8;
  return isNearby ? baseRadius + 2 : baseRadius;
}

function getFeatureCenter(feature: BuildingGeoJsonFeature): [number, number] {
  if (feature.geometry.type === "Point") {
    const [lng, lat] = feature.geometry.coordinates;
    return [lat, lng];
  }

  if (feature.properties.center) {
    return [feature.properties.center.lat, feature.properties.center.lng];
  }

  const coordinates = feature.geometry.coordinates[0] ?? [];
  if (coordinates.length === 0) {
    return [DEFAULT_CENTER[0], DEFAULT_CENTER[1]];
  }

  const sums = coordinates.reduce(
    (acc, [lng, lat]) => {
      acc.lng += lng;
      acc.lat += lat;
      return acc;
    },
    { lng: 0, lat: 0 },
  );

  return [sums.lat / coordinates.length, sums.lng / coordinates.length];
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

function MapAutoFit({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: 16,
    });
  }, [bounds, map]);

  return null;
}

function MapEventHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function getClusterTolerance(zoom: number): number {
  if (zoom <= 8) return 1.5;
  if (zoom === 9) return 0.5;
  if (zoom === 10) return 0.18;
  if (zoom === 11) return 0.06;
  if (zoom === 12) return 0.018;
  if (zoom === 13) return 0.006;
  if (zoom === 14) return 0.002;
  if (zoom === 15) return 0.0007;
  return 0.0; // zoom >= 16: no clustering
}

interface Cluster {
  id: string;
  center: [number, number];
  features: BuildingGeoJsonFeature[];
}

function clusterFeatures(features: BuildingGeoJsonFeature[], zoom: number): Cluster[] {
  const tolerance = getClusterTolerance(zoom);
  const clusters: Cluster[] = [];

  for (const feature of features) {
    const coords = getFeatureCenter(feature);
    let addedToCluster = false;

    for (const cluster of clusters) {
      const latDiff = Math.abs(cluster.center[0] - coords[0]);
      const lngDiff = Math.abs(cluster.center[1] - coords[1]);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      if (distance < tolerance) {
        cluster.features.push(feature);
        const count = cluster.features.length;
        cluster.center[0] = (cluster.center[0] * (count - 1) + coords[0]) / count;
        cluster.center[1] = (cluster.center[1] * (count - 1) + coords[1]) / count;
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        id: `cluster-${feature.properties.id}-${Date.now()}-${Math.random()}`,
        center: [coords[0], coords[1]],
        features: [feature],
      });
    }
  }

  return clusters;
}

const createClusterIcon = (count: number, averageOccupancy: number, isLarge: boolean) => {
  let color = "#0284C7"; // sky-600 primary
  if (averageOccupancy >= 80) color = "#059669"; // emerald-600 (high occupancy)
  else if (averageOccupancy < 50) color = "#EA580C"; // orange-600 (low occupancy)

  const size = isLarge ? 44 : 34;
  const fontSize = isLarge ? 14 : 12;
  const pulse = isLarge ? `box-shadow: 0 0 0 4px ${color}33, 0 2px 8px rgba(0,0,0,0.3);` : "box-shadow: 0 2px 6px rgba(0,0,0,0.25);";

  return L.divIcon({
    html: `<div title="Cụm ${count} tòa nhà — Click để phóng to" style="background-color: ${color}; color: #ffffff; border: 3px solid #ffffff; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${fontSize}px; cursor: pointer; ${pulse}">${count}</div>`,
    className: "custom-cluster-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component con chứa logic zoom map — phải đặt trong MapContainer để dùng useMap()
function ClusterMarker({ cluster, averageOccupancy, navigate, occupancyMap, nearbyIds }: {
  cluster: Cluster;
  averageOccupancy: number;
  navigate: (path: string) => void;
  occupancyMap: Record<number, BuildingOccupancyDetail>;
  nearbyIds: number[];
}) {
  const map = useMap();
  const count = cluster.features.length;
  const isLarge = count > 5;

  const handleClusterClick = () => {
    if (isLarge) {
      // Zoom vào vùng bao phủ cụm thay vì mở popup
      const points = cluster.features.map((f) => getFeatureCenter(f));
      const bounds = latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }
    // Nếu <= 5, Popup sẽ hiện tự nhiên qua Leaflet
  };

  return (
    <Marker
      key={cluster.id}
      position={cluster.center}
      icon={createClusterIcon(count, averageOccupancy, isLarge)}
      eventHandlers={isLarge ? { click: handleClusterClick } : {}}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        {isLarge
          ? `Cụm ${count} tòa nhà — Click để phóng to`
          : `Cụm ${count} tòa nhà — Click để xem danh sách`}
      </Tooltip>
      {!isLarge && (
        <Popup>
          <div className="min-w-56 max-w-72 max-h-64 overflow-y-auto space-y-2 p-1">
            <p className="font-bold text-xs border-b pb-1.5 mb-2 text-foreground">
              Danh sách tòa nhà ({count})
            </p>
            <div className="space-y-2">
              {cluster.features.map((feat) => {
                const buildingId = feat.properties.id;
                const occ = occupancyMap[buildingId];
                const rate = toOccupancyRate(occ?.occupancyRate);
                const isNearby = nearbyIds.includes(buildingId);
                return (
                  <div key={buildingId} className="flex flex-col gap-1.5 border-b border-border last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className={`font-semibold text-xs line-clamp-1 ${isNearby ? 'text-primary' : ''}`}>
                        {feat.properties.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{feat.properties.address}</p>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Tỷ lệ lấp đầy</span>
                        <span className="font-semibold">{rate.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(rate, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {occ?.rentedApartments ?? 0}/{occ?.totalApartments ?? 0} căn hộ đang thuê
                      </p>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>Quận: {feat.properties.district || "-"}</span>
                      <span>Tầng: {feat.properties.totalFloors}</span>
                    </div>
                    <Button
                      className="text-[10px] h-6 px-2 w-full"
                      onClick={() => navigate(`/buildings/${buildingId}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const [allBuildings, setAllBuildings] = useState<Building[]>([]);
  const [zoom, setZoom] = useState(12);

  const [filters, setFilters] = useState<MapFilters>(() => createEmptyFilters());
  const [appliedFilters, setAppliedFilters] = useState<MapFilters>(() => createEmptyFilters());
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mapFeatures, setMapFeatures] = useState<BuildingGeoJsonFeature[]>([]);
  const [occupancyMap, setOccupancyMap] = useState<Record<number, BuildingOccupancyDetail>>({});
  const [loadingMap, setLoadingMap] = useState(true);
  const [isOpenLocation, setIsOpenLocation] = useState(true);
  const [isOpenPriceSpecs, setIsOpenPriceSpecs] = useState(true);
  const [isOpenNearby, setIsOpenNearby] = useState(false);

  const priceError = useMemo(() => {
    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      if (Number.isNaN(min) || min < 0) return "Giá tối thiểu không hợp lệ";
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      if (Number.isNaN(max) || max < 0) return "Giá tối đa không hợp lệ";
    }
    if (filters.minPrice && filters.maxPrice) {
      const min = Number(filters.minPrice);
      const max = Number(filters.maxPrice);
      if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
        return "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa";
      }
    }
    return null;
  }, [filters.minPrice, filters.maxPrice]);

  const floorsError = useMemo(() => {
    if (filters.minFloors) {
      const min = Number(filters.minFloors);
      if (Number.isNaN(min) || min < 0) return "Số tầng tối thiểu không hợp lệ";
    }
    if (filters.maxFloors) {
      const max = Number(filters.maxFloors);
      if (Number.isNaN(max) || max < 0) return "Số tầng tối đa không hợp lệ";
    }
    if (filters.minFloors && filters.maxFloors) {
      const min = Number(filters.minFloors);
      const max = Number(filters.maxFloors);
      if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
        return "Số tầng tối thiểu phải nhỏ hơn hoặc bằng số tầng tối đa";
      }
    }
    return null;
  }, [filters.minFloors, filters.maxFloors]);

  // Debounce search input for responsive immediate filtering without lagging the Leaflet canvas
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Debounce minPrice and maxPrice input for responsive immediate server-side filtering
  useEffect(() => {
    const minPriceNum = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPriceNum = filters.maxPrice ? Number(filters.maxPrice) : null;

    // Validate values: only trigger fetch when they are valid or empty
    if (filters.minPrice && (minPriceNum === null || Number.isNaN(minPriceNum) || minPriceNum < 0)) return;
    if (filters.maxPrice && (maxPriceNum === null || Number.isNaN(maxPriceNum) || maxPriceNum < 0)) return;
    if (minPriceNum !== null && maxPriceNum !== null && minPriceNum > maxPriceNum) return;

    const handler = setTimeout(() => {
      setAppliedFilters((prev) => ({
        ...prev,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      }));
    }, 500);

    return () => clearTimeout(handler);
  }, [filters.minPrice, filters.maxPrice]);

  const filteredMapFeatures = useMemo(() => {
    return mapFeatures.filter((feature) => {
      // 1. Tìm kiếm theo tên hoặc địa chỉ (lọc tức thì với debounce)
      if (debouncedSearch) {
        const keyword = debouncedSearch.toLowerCase().trim();
        if (keyword) {
          const nameMatch = feature.properties.name.toLowerCase().includes(keyword);
          const addressMatch = feature.properties.address.toLowerCase().includes(keyword);
          if (!nameMatch && !addressMatch) return false;
        }
      }

      // 2. Lọc theo tỷ lệ lấp đầy (lọc tức thì)
      if (filters.occupancyRange && filters.occupancyRange !== "__all__") {
        const occupancy = occupancyMap[feature.properties.id];
        const rate = toOccupancyRate(occupancy?.occupancyRate);
        if (filters.occupancyRange === "under_50" && rate >= 50) return false;
        if (filters.occupancyRange === "50_80" && (rate < 50 || rate >= 80)) return false;
        if (filters.occupancyRange === "over_80" && rate < 80) return false;
      }

      // 3. Lọc theo số tầng (chỉ lọc khi không có lỗi khoảng tầng)
      if (!floorsError) {
        if (filters.minFloors) {
          const minF = Number(filters.minFloors);
          if (!Number.isNaN(minF) && feature.properties.totalFloors < minF) return false;
        }
        if (filters.maxFloors) {
          const maxF = Number(filters.maxFloors);
          if (!Number.isNaN(maxF) && feature.properties.totalFloors > maxF) return false;
        }
      }

      return true;
    });
  }, [mapFeatures, occupancyMap, debouncedSearch, filters.occupancyRange, filters.minFloors, filters.maxFloors, floorsError]);

  const clusters = useMemo(() => {
    return clusterFeatures(filteredMapFeatures, zoom);
  }, [filteredMapFeatures, zoom]);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [timelineMonths, setTimelineMonths] = useState<string[]>([]);
  const [selectedTimelineMonth, setSelectedTimelineMonth] = useState("");
  const [debouncedTimelineMonth, setDebouncedTimelineMonth] = useState("");
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
  const [searchingNearby, setSearchingNearby] = useState(false);
  const [nearbyBuildings, setNearbyBuildings] = useState<NearbyBuildingResult[]>([]);
  const [nearbyIds, setNearbyIds] = useState<number[]>([]);

  const cityOptions = useMemo(() => {
    return Array.from(
      new Set(
        allBuildings
          .map((building) => building.city)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [allBuildings]);

  const districtOptions = useMemo(() => {
    const candidates = allBuildings.filter((building) => {
      if (filters.city && building.city !== filters.city) return false;
      return true;
    });

    return Array.from(
      new Set(
        candidates
          .map((building) => building.district)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [allBuildings, filters.city]);

  const wardOptions = useMemo(() => {
    const candidates = allBuildings.filter((building) => {
      if (filters.city && building.city !== filters.city) return false;
      if (filters.district && building.district !== filters.district) return false;
      return true;
    });

    return Array.from(
      new Set(
        candidates
          .map((building) => building.ward)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [allBuildings, filters.city, filters.district]);

  const mapBounds = useMemo(() => {
    if (filteredMapFeatures.length === 0) return null;

    const points = filteredMapFeatures.map((feature) => getFeatureCenter(feature));

    return latLngBounds(points);
  }, [filteredMapFeatures]);

  const visibleFeatureIds = useMemo(() => {
    return new Set(filteredMapFeatures.map((feature) => feature.properties.id));
  }, [filteredMapFeatures]);

  const hasActiveFilter = useMemo(() => {
    return Boolean(
      filters.city ||
      filters.district ||
      filters.ward ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.search ||
      filters.occupancyRange ||
      filters.minFloors ||
      filters.maxFloors
    );
  }, [filters]);

  const selectedTimelineIndex = useMemo(() => {
    if (timelineMonths.length === 0 || !selectedTimelineMonth) return 0;
    const foundIndex = timelineMonths.indexOf(selectedTimelineMonth);
    return foundIndex >= 0 ? foundIndex : Math.max(timelineMonths.length - 1, 0);
  }, [timelineMonths, selectedTimelineMonth]);

  const snapshotDate = useMemo(() => {
    if (!debouncedTimelineMonth) return "";
    return monthToSnapshotDate(debouncedTimelineMonth);
  }, [debouncedTimelineMonth]);

  useEffect(() => {
    let cancelled = false;

    const loadFilterSource = async () => {
      try {
        const buildings = await api.get<Building[]>("/buildings");
        if (!cancelled) {
          setAllBuildings(buildings);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Không thể tải dữ liệu tòa nhà";
        toast.error(message);
        setPageError(message);
      }
    };

    void loadFilterSource();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTimelineMonths = async () => {
      setLoadingTimeline(true);
      setTimelineError(null);
      try {
        const history = await api.get<OccupancyHistoryPoint[]>("/dashboard/occupancy-history");
        if (cancelled) return;

        const monthSet = new Set<string>([currentMonth]);
        for (const point of history) {
          const normalized = normalizeMonthValue(point.month);
          if (normalized) monthSet.add(normalized);
        }

        const months = Array.from(monthSet).sort((a, b) => a.localeCompare(b));
        const fallbackMonth = months[months.length - 1] || currentMonth;

        setTimelineMonths(months);
        setSelectedTimelineMonth((prev) => (prev && months.includes(prev) ? prev : fallbackMonth));
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof ApiError ? err.message : "Không thể tải dữ liệu timeline";
        toast.error(message);
        setTimelineError(message);

        setTimelineMonths([currentMonth]);
        setSelectedTimelineMonth(currentMonth);
      } finally {
        if (!cancelled) {
          setLoadingTimeline(false);
        }
      }
    };

    void loadTimelineMonths();

    return () => {
      cancelled = true;
    };
  }, [currentMonth]);

  useEffect(() => {
    let cancelled = false;

    const loadMapData = async () => {
      setLoadingMap(true);
      setPageError(null);

      try {
        const geoQuery = buildQueryString(appliedFilters, false);
        const geoEndpoint = geoQuery ? `/buildings/geojson?${geoQuery}` : "/buildings/geojson";
        const needsPriceFilter = Boolean(appliedFilters.minPrice || appliedFilters.maxPrice);

        const buildingsQuery = buildQueryString(appliedFilters, true);
        const buildingsEndpoint = buildingsQuery ? `/buildings?${buildingsQuery}` : "/buildings";

        const [geoJson, buildingsForPrice] = await Promise.all([
          api.get<BuildingGeoJsonFeatureCollection>(geoEndpoint),
          needsPriceFilter ? api.get<Building[]>(buildingsEndpoint) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const validIds = buildingsForPrice
          ? new Set(buildingsForPrice.map((building) => building.id))
          : null;

        const filteredFeatures = validIds
          ? geoJson.features.filter((feature) => validIds.has(feature.properties.id))
          : geoJson.features;

        setMapFeatures(filteredFeatures);
        setNearbyBuildings([]);
        setNearbyIds([]);

        if (filteredFeatures.length === 0) {
          setOccupancyMap({});
        }
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof ApiError ? err.message : "Không thể tải dữ liệu bản đồ";
        toast.error(message);
        setPageError(message);
      } finally {
        if (!cancelled) {
          setLoadingMap(false);
        }
      }
    };

    void loadMapData();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters]);

  useEffect(() => {
    if (!selectedTimelineMonth) return;

    const timeout = window.setTimeout(() => {
      setDebouncedTimelineMonth(selectedTimelineMonth);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [selectedTimelineMonth]);

  useEffect(() => {
    if (!debouncedTimelineMonth) return;

    let cancelled = false;

    const loadMapSnapshot = async () => {
      setLoadingSnapshot(true);
      try {
        const date = monthToSnapshotDate(debouncedTimelineMonth);
        const snapshot = await api.get<MapSnapshotFeatureCollection>(`/dashboard/map-snapshot?date=${date}`);

        if (cancelled) return;

        const nextOccupancyMap: Record<number, BuildingOccupancyDetail> = {};
        for (const feature of snapshot.features) {
          // Backend trả về decimal (0-1), chuyển sang percentage (0-100)
          nextOccupancyMap[feature.properties.id] = {
            totalApartments: feature.properties.totalApartments,
            rentedApartments: feature.properties.rentedApartments,
            occupancyRate: Number(feature.properties.occupancyRate ?? 0) * 100,
          };
        }

        setOccupancyMap(nextOccupancyMap);
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof ApiError ? err.message : "Không thể tải snapshot bản đồ";
        toast.error(message);
        setTimelineError(message);
      } finally {
        if (!cancelled) {
          setLoadingSnapshot(false);
        }
      }
    };

    void loadMapSnapshot();

    return () => {
      cancelled = true;
    };
  }, [debouncedTimelineMonth]);

  const resetFilters = () => {
    const empty = createEmptyFilters();
    setFilters(empty);
    setDebouncedSearch("");
    setAppliedFilters({ ...empty });
  };

  const findNearbyBuildings = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }

    const radius = Number(radiusMeters);
    if (Number.isNaN(radius) || radius <= 0) {
      toast.error("Bán kính tìm kiếm phải là số dương");
      return;
    }

    setSearchingNearby(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        void (async () => {
          try {
            const result = await api.get<NearbyBuildingResult[]>(
              `/buildings/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
            );

            setNearbyBuildings(result);
            setNearbyIds(result.map((item) => item.building.id));

            if (result.length === 0) {
              toast.info("Không tìm thấy tòa nhà trong bán kính đã chọn");
            }
          } catch (err) {
            const message = err instanceof ApiError ? err.message : "Không thể tìm tòa nhà lân cận";
            toast.error(message);
          } finally {
            setSearchingNearby(false);
          }
        })();
      },
      (error) => {
        setSearchingNearby(false);
        if (error.code === 1) {
          toast.error("Bạn cần cấp quyền vị trí để tìm tòa nhà lân cận");
          return;
        }
        toast.error("Không thể lấy vị trí hiện tại");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleTimelineChange = (value: number) => {
    const month = timelineMonths[value];
    if (!month) return;
    setSelectedTimelineMonth(month);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Bản đồ GIS</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi vị trí tòa nhà, tỷ lệ lấp đầy và tìm nhanh các tòa nhà gần vị trí hiện tại.
        </p>
      </div>

      {pageError && (
        <PageErrorState
          compact
          title="Bản đồ đang tải lỗi"
          description={pageError}
          onRetry={() => setAppliedFilters((current) => ({ ...current }))}
        />
      )}

      {timelineError && (
        <PageErrorState
          compact
          title="Timeline occupancy chưa sẵn sàng"
          description={timelineError}
        />
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:h-[calc(100vh-140px)]">
        <Card className="h-fit xl:h-full xl:flex xl:flex-col xl:overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Bộ lọc bản đồ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 xl:flex-1 xl:overflow-y-auto p-4 select-none">
            {/* Nhóm 1: Địa điểm & Tìm kiếm */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
              <button
                type="button"
                className="flex w-full items-center justify-between font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => setIsOpenLocation(!isOpenLocation)}
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Địa điểm & Tìm kiếm
                </span>
                {isOpenLocation ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isOpenLocation && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  {/* Tìm kiếm nhanh */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Search className="h-3.5 w-3.5" />
                      Tìm kiếm tòa nhà
                    </Label>
                    <Input
                      value={filters.search}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: event.target.value,
                        }))
                      }
                      placeholder="Nhập tên hoặc địa chỉ..."
                      className="rounded-md h-9"
                    />
                  </div>

                  {/* Thành phố */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      Thành phố
                    </Label>
                    <Select
                      value={filters.city || undefined}
                      onValueChange={(value) => {
                        const nextCity = !value || value === "__all__" ? "" : value;
                        setFilters((prev) => {
                          const next = {
                            ...prev,
                            city: nextCity,
                            district: "",
                            ward: "",
                          };
                          setAppliedFilters(next);
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger className="rounded-md h-9">
                        <SelectValue placeholder="Tất cả thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tất cả thành phố</SelectItem>
                        {cityOptions.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quận/Huyện */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      Quận / Huyện
                    </Label>
                    <Select
                      value={filters.district || undefined}
                      disabled={!filters.city}
                      onValueChange={(value) => {
                        const nextDistrict = !value || value === "__all__" ? "" : value;
                        setFilters((prev) => {
                          const next = {
                            ...prev,
                            district: nextDistrict,
                            ward: "",
                          };
                          setAppliedFilters(next);
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger className="rounded-md h-9">
                        <SelectValue placeholder={filters.city ? "Tất cả quận/huyện" : "Chọn thành phố trước"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tất cả quận/huyện</SelectItem>
                        {districtOptions.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phường/Xã */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Phường / Xã
                    </Label>
                    <Select
                      value={filters.ward || undefined}
                      disabled={!filters.district}
                      onValueChange={(value) => {
                        const nextWard = !value || value === "__all__" ? "" : value;
                        setFilters((prev) => {
                          const next = {
                            ...prev,
                            ward: nextWard,
                          };
                          setAppliedFilters(next);
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger className="rounded-md h-9">
                        <SelectValue placeholder={filters.district ? "Tất cả phường/xã" : "Chọn quận/huyện trước"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tất cả phường/xã</SelectItem>
                        {wardOptions.map((ward) => (
                          <SelectItem key={ward} value={ward}>
                            {ward}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Nhóm 2: Giá thuê & Thông số */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
              <button
                type="button"
                className="flex w-full items-center justify-between font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => setIsOpenPriceSpecs(!isOpenPriceSpecs)}
              >
                <span className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  Giá thuê & Thông số
                </span>
                {isOpenPriceSpecs ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isOpenPriceSpecs && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  {/* Tỷ lệ lấp đầy */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      Tỷ lệ lấp đầy
                    </Label>
                    <Select
                      value={filters.occupancyRange || undefined}
                      onValueChange={(value) => {
                        const nextOcc = !value || value === "__all__" ? "" : value;
                        setFilters((prev) => ({
                          ...prev,
                          occupancyRange: nextOcc,
                        }));
                      }}
                    >
                      <SelectTrigger className="rounded-md h-9">
                        <SelectValue placeholder="Tất cả tỷ lệ lấp đầy">
                          {({ under_50: "Dưới 50%", "50_80": "50% - 79%", over_80: "Từ 80% trở lên" } as Record<string, string>)[filters.occupancyRange] ?? "Tất cả tỷ lệ lấp đầy"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tất cả tỷ lệ lấp đầy</SelectItem>
                        <SelectItem value="under_50">Dưới 50%</SelectItem>
                        <SelectItem value="50_80">50% - 79%</SelectItem>
                        <SelectItem value="over_80">Từ 80% trở lên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Số tầng tòa nhà */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      Số tầng tòa nhà
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">Tầng từ</span>
                        <Input
                          type="number"
                          min={0}
                          value={filters.minFloors}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              minFloors: event.target.value,
                            }))
                          }
                          placeholder="Tối thiểu"
                          className="rounded-md h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">Tầng đến</span>
                        <Input
                          type="number"
                          min={0}
                          value={filters.maxFloors}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxFloors: event.target.value,
                            }))
                          }
                          placeholder="Tối đa"
                          className="rounded-md h-9"
                        />
                      </div>
                    </div>
                    {floorsError && (
                      <p className="text-[11px] text-destructive font-medium block mt-1">
                        {floorsError}
                      </p>
                    )}
                  </div>

                  {/* Giá thuê */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Coins className="h-3.5 w-3.5" />
                      Giá thuê trung bình (VND)
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">Giá từ</span>
                        <Input
                          type="number"
                          min={0}
                          value={filters.minPrice}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              minPrice: event.target.value,
                            }))
                          }
                          placeholder="Tối thiểu"
                          className="rounded-md h-9"
                        />
                        {filters.minPrice && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                            {formatRealtimeCurrency(filters.minPrice)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">Giá đến</span>
                        <Input
                          type="number"
                          min={0}
                          value={filters.maxPrice}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxPrice: event.target.value,
                            }))
                          }
                          placeholder="Tối đa"
                          className="rounded-md h-9"
                        />
                        {filters.maxPrice && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                            {formatRealtimeCurrency(filters.maxPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    {priceError && (
                      <p className="text-[11px] text-destructive font-medium block mt-1">
                        {priceError}
                      </p>
                    )}

                    {/* Lọc giá nhanh */}
                    <div className="space-y-1.5 mt-2">
                      <span className="text-[10px] text-muted-foreground block font-medium">Lọc nhanh theo giá:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 px-1.5"
                          type="button"
                          onClick={() => {
                            const next = { ...filters, minPrice: "", maxPrice: "5000000" };
                            setFilters(next);
                            setAppliedFilters(next);
                          }}
                        >
                          &lt; 5 triệu
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 px-1.5"
                          type="button"
                          onClick={() => {
                            const next = { ...filters, minPrice: "5000000", maxPrice: "10000000" };
                            setFilters(next);
                            setAppliedFilters(next);
                          }}
                        >
                          5 - 10 triệu
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 px-1.5"
                          type="button"
                          onClick={() => {
                            const next = { ...filters, minPrice: "10000000", maxPrice: "20000000" };
                            setFilters(next);
                            setAppliedFilters(next);
                          }}
                        >
                          10 - 20 triệu
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 px-1.5"
                          type="button"
                          onClick={() => {
                            const next = { ...filters, minPrice: "20000000", maxPrice: "" };
                            setFilters(next);
                            setAppliedFilters(next);
                          }}
                        >
                          &gt; 20 triệu
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Đặt lại bộ lọc */}
                  <div className="pt-2 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      disabled={loadingMap}
                      className="w-full rounded-md h-9 flex items-center justify-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors text-xs cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Đặt lại bộ lọc
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Nhóm 3: Tìm kiếm lân cận */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
              <button
                type="button"
                className="flex w-full items-center justify-between font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => setIsOpenNearby(!isOpenNearby)}
              >
                <span className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  Tìm kiếm lân cận
                </span>
                {isOpenNearby ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isOpenNearby && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Compass className="h-3.5 w-3.5" />
                      Bán kính tìm lân cận (m)
                    </Label>
                    <Input
                      type="number"
                      min={100}
                      step={100}
                      value={radiusMeters}
                      onChange={(event) => setRadiusMeters(event.target.value)}
                      className="rounded-md h-9"
                    />
                  </div>
                  <Button
                    className="w-full rounded-md h-9 text-xs cursor-pointer"
                    variant="secondary"
                    onClick={findNearbyBuildings}
                    disabled={searchingNearby}
                  >
                    {searchingNearby ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tìm...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" />
                        Tìm tòa nhà gần tôi
                      </>
                    )}
                  </Button>

                  {nearbyBuildings.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold text-muted-foreground">Kết quả lân cận ({nearbyBuildings.length})</p>
                      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                        {nearbyBuildings.map((item) => {
                          const isVisibleOnMap = visibleFeatureIds.has(item.building.id);

                          return (
                            <button
                              key={item.building.id}
                              type="button"
                              className={cn(
                                "w-full rounded-lg border border-border bg-background p-2.5 text-left transition-colors hover:border-primary/50 cursor-pointer",
                                isVisibleOnMap && "border-primary/70 bg-primary/5",
                              )}
                              onClick={() => navigate(`/buildings/${item.building.id}`)}
                            >
                              <div className="mb-1 flex items-center justify-between gap-1.5">
                                <p className="line-clamp-1 text-xs font-semibold">{item.building.name}</p>
                                <Badge variant="outline" className="text-[10px] px-1 h-5">{formatDistance(item.distance)}</Badge>
                              </div>
                              <p className="line-clamp-1 text-[10px] text-muted-foreground">{item.building.address}</p>
                              {!isVisibleOnMap && (
                                <p className="mt-1 text-[9px] text-destructive font-medium">Nằm ngoài bộ lọc hiện tại</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden xl:h-full xl:flex xl:flex-col">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinned className="h-4 w-4" />
                Vị trí tòa nhà ({filteredMapFeatures.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilter && <Badge variant="secondary">Đang lọc dữ liệu</Badge>}
                {selectedTimelineMonth && (
                  <Badge variant="outline">Mốc dữ liệu: {formatMonthLabel(selectedTimelineMonth)}</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: markerColor(25) }}
                />
                Lấp đầy dưới 50%
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: markerColor(65) }}
                />
                Lấp đầy 50% - 79%
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: markerColor(90) }}
                />
                Lấp đầy từ 80%
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {loadingMap ? (
              <Skeleton className="h-[50vh] xl:flex-1 min-h-80 w-full rounded-none" />
            ) : filteredMapFeatures.length === 0 ? (
              <div className="flex h-[50vh] xl:flex-1 min-h-80 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Không có tòa nhà phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="h-[calc(100vh-140px)] xl:flex-1 min-h-80 w-full relative">
                <MapContainer
                  key="main-map"
                  center={DEFAULT_CENTER}
                  zoom={12}
                  scrollWheelZoom
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapAutoFit bounds={mapBounds} />
                  <MapEventHandler onZoomChange={setZoom} />

                  {clusters.map((cluster) => {
                    if (cluster.features.length === 1) {
                      const feature = cluster.features[0];
                      const [lat, lng] = getFeatureCenter(feature);
                      const buildingId = feature.properties.id;
                      const occupancy = occupancyMap[buildingId];
                      const occupancyRate = toOccupancyRate(occupancy?.occupancyRate);
                      const isNearby = nearbyIds.includes(buildingId);

                      return (
                        <CircleMarker
                          key={buildingId}
                          center={[lat, lng]}
                          radius={markerRadius(occupancyRate, isNearby)}
                          pathOptions={{
                            color: "var(--color-background)",
                            weight: isNearby ? 3 : 2,
                            fillColor: markerColor(occupancyRate),
                            fillOpacity: isNearby ? 0.95 : 0.85,
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -6]}>
                            {feature.properties.name} - {occupancyRate.toFixed(1)}%
                          </Tooltip>
                          <Popup>
                            <div className="min-w-60 space-y-3">
                              <div>
                                <p className="font-semibold text-sm">{feature.properties.name}</p>
                                <p className="text-xs text-muted-foreground">{feature.properties.address}</p>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Tỷ lệ lấp đầy</span>
                                  <span className="font-semibold">{occupancyRate.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {occupancy?.rentedApartments ?? 0}/{occupancy?.totalApartments ?? 0} căn hộ đang thuê
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <span>Quận: {feature.properties.district || "-"}</span>
                                <span>Tầng: {feature.properties.totalFloors}</span>
                              </div>

                              <Button size="sm" className="w-full" onClick={() => navigate(`/buildings/${buildingId}`)}>
                                Xem chi tiết
                              </Button>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    } else {
                      const averageOccupancy =
                        cluster.features.reduce((sum, feat) => {
                          const occ = occupancyMap[feat.properties.id];
                          return sum + toOccupancyRate(occ?.occupancyRate);
                        }, 0) / cluster.features.length;

                      return (
                        <ClusterMarker
                          key={cluster.id}
                          cluster={cluster}
                          averageOccupancy={averageOccupancy}
                          navigate={navigate}
                          occupancyMap={occupancyMap}
                          nearbyIds={nearbyIds}
                        />
                      );
                    }
                  })}
                </MapContainer>
              </div>
            )}

            <div className="space-y-3 border-t border-border bg-muted/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Timeline tỷ lệ lấp đầy</p>
                  <p className="text-xs text-muted-foreground">
                    Kéo thanh để xem trạng thái lấp đầy của từng mốc thời gian.
                  </p>
                </div>
                <div className="text-right">
                  {selectedTimelineMonth && (
                    <Badge variant="secondary">{formatMonthLabel(selectedTimelineMonth)}</Badge>
                  )}
                  {snapshotDate && (
                    <p className="mt-1 text-xs text-muted-foreground">Snapshot: {formatDateLabel(snapshotDate)}</p>
                  )}
                </div>
              </div>

              {loadingTimeline ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(timelineMonths.length - 1, 0)}
                    step={1}
                    value={selectedTimelineIndex}
                    onChange={(event) => handleTimelineChange(Number(event.target.value))}
                    className="h-2 w-full cursor-pointer accent-primary"
                    disabled={timelineMonths.length <= 1}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatMonthLabel(timelineMonths[0] || currentMonth)}</span>
                    <span>{formatMonthLabel(timelineMonths[timelineMonths.length - 1] || currentMonth)}</span>
                  </div>
                </>
              )}

              {loadingSnapshot && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang cập nhật bản đồ theo timeline...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
