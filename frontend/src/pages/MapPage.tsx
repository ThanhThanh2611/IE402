import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { latLngBounds, type LatLngBounds, type LatLngExpression } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
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
import type {
  Building,
  BuildingGeoJsonFeature,
  BuildingGeoJsonFeatureCollection,
  BuildingOccupancyDetail,
  NearbyBuildingResult,
} from "@/types";
import { Filter, Loader2, MapPinned, Navigation, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type MapFilters = {
  district: string;
  city: string;
  ward: string;
  minPrice: string;
  maxPrice: string;
};

const DEFAULT_CENTER: LatLngExpression = [10.7769, 106.7009];
const DEFAULT_RADIUS_METERS = "3000";

function createEmptyFilters(): MapFilters {
  return {
    district: "",
    city: "",
    ward: "",
    minPrice: "",
    maxPrice: "",
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

export default function MapPage() {
  const navigate = useNavigate();

  const [allBuildings, setAllBuildings] = useState<Building[]>([]);
  const [filters, setFilters] = useState<MapFilters>(() => createEmptyFilters());
  const [appliedFilters, setAppliedFilters] = useState<MapFilters>(() => createEmptyFilters());
  const [mapFeatures, setMapFeatures] = useState<BuildingGeoJsonFeature[]>([]);
  const [occupancyMap, setOccupancyMap] = useState<Record<number, BuildingOccupancyDetail>>({});
  const [loadingMap, setLoadingMap] = useState(true);

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
    if (mapFeatures.length === 0) return null;

    const points = mapFeatures.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      return [lat, lng] as [number, number];
    });

    return latLngBounds(points);
  }, [mapFeatures]);

  const visibleFeatureIds = useMemo(() => {
    return new Set(mapFeatures.map((feature) => feature.properties.id));
  }, [mapFeatures]);

  const hasActiveFilter = useMemo(() => {
    return Boolean(
      appliedFilters.city ||
      appliedFilters.district ||
      appliedFilters.ward ||
      appliedFilters.minPrice ||
      appliedFilters.maxPrice,
    );
  }, [appliedFilters]);

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
      }
    };

    void loadFilterSource();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMapData = async () => {
      setLoadingMap(true);

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
          return;
        }

        const occupancyResults = await Promise.all(
          filteredFeatures.map(async (feature) => {
            try {
              const occupancy = await api.get<BuildingOccupancyDetail>(
                `/buildings/${feature.properties.id}/occupancy`,
              );
              return {
                id: feature.properties.id,
                occupancy,
              };
            } catch {
              return null;
            }
          }),
        );

        if (cancelled) return;

        const nextOccupancyMap: Record<number, BuildingOccupancyDetail> = {};
        for (const item of occupancyResults) {
          if (!item) continue;
          nextOccupancyMap[item.id] = item.occupancy;
        }

        setOccupancyMap(nextOccupancyMap);
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof ApiError ? err.message : "Không thể tải dữ liệu bản đồ";
        toast.error(message);
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

  const applyFilters = () => {
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;

    if (filters.minPrice && (minPrice === null || Number.isNaN(minPrice) || minPrice < 0)) {
      toast.error("Giá tối thiểu không hợp lệ");
      return;
    }

    if (filters.maxPrice && (maxPrice === null || Number.isNaN(maxPrice) || maxPrice < 0)) {
      toast.error("Giá tối đa không hợp lệ");
      return;
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      toast.error("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa");
      return;
    }

    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    const empty = createEmptyFilters();
    setFilters(empty);
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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Bản đồ GIS</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi vị trí tòa nhà, tỷ lệ lấp đầy và tìm nhanh các tòa nhà gần vị trí hiện tại.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Bộ lọc bản đồ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thành phố</Label>
              <Select
                value={filters.city || "all"}
                onValueChange={(value) => {
                  const nextCity = !value || value === "all" ? "" : value;
                  setFilters((prev) => ({
                    ...prev,
                    city: nextCity,
                    district: "",
                    ward: "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thành phố</SelectItem>
                  {cityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quận/Huyện</Label>
              <Select
                value={filters.district || "all"}
                onValueChange={(value) => {
                  const nextDistrict = !value || value === "all" ? "" : value;
                  setFilters((prev) => ({
                    ...prev,
                    district: nextDistrict,
                    ward: "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả quận/huyện</SelectItem>
                  {districtOptions.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Phường/Xã</Label>
              <Select
                value={filters.ward || "all"}
                onValueChange={(value) => {
                  const nextWard = !value || value === "all" ? "" : value;
                  setFilters((prev) => ({
                    ...prev,
                    ward: nextWard,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phường/xã</SelectItem>
                  {wardOptions.map((ward) => (
                    <SelectItem key={ward} value={ward}>
                      {ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Giá từ (VND)</Label>
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
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Giá đến (VND)</Label>
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
                  placeholder="50000000"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={applyFilters} disabled={loadingMap}>
                Áp dụng
              </Button>
              <Button variant="outline" onClick={resetFilters} disabled={loadingMap}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
              <Label>Bán kính tìm lân cận (m)</Label>
              <Input
                type="number"
                min={100}
                step={100}
                value={radiusMeters}
                onChange={(event) => setRadiusMeters(event.target.value)}
              />
              <Button
                className="w-full"
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
            </div>

            {nearbyBuildings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Kết quả lân cận ({nearbyBuildings.length})</p>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {nearbyBuildings.map((item) => {
                    const isVisibleOnMap = visibleFeatureIds.has(item.building.id);

                    return (
                      <button
                        key={item.building.id}
                        type="button"
                        className={cn(
                          "w-full rounded-lg border border-border bg-background p-3 text-left transition-colors",
                          isVisibleOnMap && "border-primary/70",
                        )}
                        onClick={() => navigate(`/buildings/${item.building.id}`)}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="line-clamp-1 text-sm font-medium">{item.building.name}</p>
                          <Badge variant="outline">{formatDistance(item.distance)}</Badge>
                        </div>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{item.building.address}</p>
                        {!isVisibleOnMap && (
                          <p className="mt-1 text-xs text-muted-foreground">Nằm ngoài bộ lọc bản đồ hiện tại</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinned className="h-4 w-4" />
                Vị trí tòa nhà ({mapFeatures.length})
              </CardTitle>
              {hasActiveFilter && <Badge variant="secondary">Đang lọc dữ liệu</Badge>}
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

          <CardContent className="p-0">
            {loadingMap ? (
              <Skeleton className="h-[70vh] min-h-[420px] w-full rounded-none" />
            ) : mapFeatures.length === 0 ? (
              <div className="flex h-[70vh] min-h-[420px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Không có tòa nhà phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="h-[70vh] min-h-[420px] w-full">
                <MapContainer
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

                  {mapFeatures.map((feature) => {
                    const [lng, lat] = feature.geometry.coordinates;
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
                          <div className="min-w-[240px] space-y-3">
                            <div>
                              <p className="font-semibold">{feature.properties.name}</p>
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
                  })}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
