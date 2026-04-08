import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Material, Mesh, Object3D } from "three";
import { Box, Eye, EyeOff, Loader2, RefreshCcw, Upload } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea,
  Separator,
  Skeleton,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { PageErrorState } from "@/components/PageFeedback";
import type { Apartment, ApartmentDetailResponse, Floor, Building, RentalContract, Tenant } from "@/types";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  available: "Còn trống",
  rented: "Đã thuê",
  maintenance: "Bảo trì",
};
const statusColors: Record<string, string> = {
  available: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  rented: "bg-primary/10 text-primary border border-primary/20",
  maintenance: "bg-muted text-muted-foreground border border-border",
};

type ApartmentPopupData = {
  apartment: Apartment;
  contract: RentalContract | null;
  tenant: Tenant | null;
  canReadContract: boolean;
  canReadTenant: boolean;
};

const DEFAULT_CAMERA_POS: [number, number, number] = [22, 18, 22];
const FLOOR_PATTERNS = [/floor[\s_-]?(\d{1,2})/i, /tang[\s_-]?(\d{1,2})/i, /\bf(\d{1,2})\b/i];

function formatCurrency(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatArea(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value} m²`;
}

function resolveModelUrl(model3dUrl: string | null): string | null {
  if (!model3dUrl) return null;
  if (model3dUrl.startsWith("http://") || model3dUrl.startsWith("https://")) {
    return model3dUrl;
  }

  if (model3dUrl.startsWith("/uploads")) {
    return model3dUrl;
  }

  return model3dUrl;
}

function extractFloorNumberFromText(text: string): number | null {
  for (const pattern of FLOOR_PATTERNS) {
    const matched = text.match(pattern);
    if (matched?.[1]) {
      const floor = Number(matched[1]);
      if (!Number.isNaN(floor)) return floor;
    }
  }
  return null;
}

function normalizeToken(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

function collectObjectTokens(target: Object3D | null): string[] {
  const tokens = new Set<string>();
  let current: Object3D | null = target;
  let depth = 0;

  while (current && depth < 8) {
    if (current.name) tokens.add(normalizeToken(current.name));

    const userDataEntries = Object.entries(current.userData ?? {});
    for (const [, value] of userDataEntries) {
      const normalized = normalizeToken(value);
      if (normalized) tokens.add(normalized);
    }

    current = current.parent;
    depth += 1;
  }

  return Array.from(tokens).filter(Boolean);
}

function findApartmentByObject(object: Object3D, apartments: Apartment[]): Apartment | null {
  const tokens = collectObjectTokens(object);
  if (tokens.length === 0) return null;

  for (const token of tokens) {
    const idCandidate = Number(token);
    if (!Number.isNaN(idCandidate)) {
      const foundById = apartments.find((apartment) => apartment.id === idCandidate);
      if (foundById) return foundById;
    }

    const foundByCode = apartments.find(
      (apartment) => apartment.code.toLowerCase() === token || token.includes(apartment.code.toLowerCase()),
    );
    if (foundByCode) return foundByCode;
  }

  return null;
}

function setObjectOpacity(object: Object3D, opacity: number) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;

    const applyOpacity = (material: Material) => {
      const materialWithOpacity = material as Material & {
        opacity?: number;
        transparent?: boolean;
        depthWrite?: boolean;
      };

      if (typeof materialWithOpacity.opacity === "number") {
        materialWithOpacity.opacity = opacity;
        materialWithOpacity.transparent = opacity < 1;
        materialWithOpacity.depthWrite = opacity >= 0.5;
        materialWithOpacity.needsUpdate = true;
      }
    };

    if (Array.isArray(child.material)) {
      child.material.forEach(applyOpacity);
      return;
    }

    applyOpacity(child.material);
  });
}

type BuildingModelProps = {
  modelUrl: string;
  apartments: Apartment[];
  visibleFloorNumbers: Set<number>;
  onApartmentClick: (apartment: Apartment) => void;
};

function BuildingModel({
  modelUrl,
  apartments,
  visibleFloorNumbers,
  onApartmentClick,
}: BuildingModelProps) {
  const { scene } = useGLTF(modelUrl);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const floorGroups = useMemo(() => {
    const groups = new Map<number, Object3D[]>();

    clonedScene.traverse((object) => {
      const candidates = [object.name, ...Object.values(object.userData ?? {}).map((value) => String(value))];
      for (const candidate of candidates) {
        const floor = extractFloorNumberFromText(candidate);
        if (floor === null) continue;

        if (!groups.has(floor)) {
          groups.set(floor, []);
        }

        groups.get(floor)?.push(object);
      }
    });

    return groups;
  }, [clonedScene]);

  useEffect(() => {
    setObjectOpacity(clonedScene, 1);

    if (floorGroups.size === 0) return;

    floorGroups.forEach((objects, floorNumber) => {
      if (visibleFloorNumbers.has(floorNumber)) return;

      for (const object of objects) {
        setObjectOpacity(object, 0.12);
      }
    });
  }, [clonedScene, floorGroups, visibleFloorNumbers]);

  const handleModelClick = useCallback(
    (event: { stopPropagation: () => void; object: Object3D }) => {
      event.stopPropagation();
      const apartment = findApartmentByObject(event.object, apartments);

      if (!apartment) return;
      onApartmentClick(apartment);
    },
    [apartments, onApartmentClick],
  );

  return <primitive object={clonedScene} onClick={handleModelClick} />;
}

type ModelCanvasProps = {
  modelUrl: string;
  apartments: Apartment[];
  visibleFloorNumbers: Set<number>;
  onApartmentClick: (apartment: Apartment) => void;
  resetTick: number;
};

function ModelCanvas({
  modelUrl,
  apartments,
  visibleFloorNumbers,
  onApartmentClick,
  resetTick,
}: ModelCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.object.position.set(...DEFAULT_CAMERA_POS);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [resetTick]);

  return (
    <Canvas camera={{ position: DEFAULT_CAMERA_POS, fov: 50 }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[14, 24, 10]} intensity={1.1} />
      <directionalLight position={[-12, 8, -8]} intensity={0.35} />

      <Suspense
        fallback={
          <Html center>
            <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
              Đang tải mô hình 3D...
            </div>
          </Html>
        }
      >
        <BuildingModel
          modelUrl={modelUrl}
          apartments={apartments}
          visibleFloorNumbers={visibleFloorNumbers}
          onApartmentClick={onApartmentClick}
        />
      </Suspense>

      <OrbitControls ref={controlsRef} makeDefault enablePan minDistance={4} maxDistance={120} />
      <gridHelper args={[80, 40, "#bcbcbc", "#d9d9d9"]} />
    </Canvas>
  );
}

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const buildingId = Number(id);

  const [building, setBuilding] = useState<Building | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [apartmentsByFloor, setApartmentsByFloor] = useState<Record<number, Apartment[]>>({});
  const [floorVisibility, setFloorVisibility] = useState<Record<number, boolean>>({});
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupData, setPopupData] = useState<ApartmentPopupData | null>(null);
  const [resetTick, setResetTick] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);

  const allApartments = useMemo(
    () => Object.values(apartmentsByFloor).flat(),
    [apartmentsByFloor],
  );

  const visibleFloorNumbers = useMemo(() => {
    const visible = new Set<number>();

    for (const floor of floors) {
      if (floorVisibility[floor.id]) {
        visible.add(floor.floorNumber);
      }
    }

    return visible;
  }, [floors, floorVisibility]);

  const selectedFloorApartments = useMemo(() => {
    if (!selectedFloorId) return [];
    return apartmentsByFloor[selectedFloorId] ?? [];
  }, [apartmentsByFloor, selectedFloorId]);

  const selectedFloor = useMemo(
    () => floors.find((floor) => floor.id === selectedFloorId) ?? null,
    [floors, selectedFloorId],
  );

  const modelUrl = useMemo(() => resolveModelUrl(building?.model3dUrl ?? null), [building?.model3dUrl]);

  const loadBuildingDetail = useCallback(async () => {
    setLoading(true);

    try {
      setPageError(null);
      const [buildingData, floorData] = await Promise.all([
        api.get<Building>(`/buildings/${buildingId}`),
        api.get<Floor[]>(`/floors?buildingId=${buildingId}`),
      ]);

      const sortedFloors = [...floorData].sort((a, b) => b.floorNumber - a.floorNumber);

      setBuilding(buildingData);
      setFloors(sortedFloors);

      const visibilityByFloorId: Record<number, boolean> = {};
      for (const floor of sortedFloors) {
        visibilityByFloorId[floor.id] = true;
      }
      setFloorVisibility(visibilityByFloorId);

      setSelectedFloorId(sortedFloors[0]?.id ?? null);

      const apartmentsOfFloors = await Promise.all(
        sortedFloors.map((floor) => api.get<Apartment[]>(`/apartments?floorId=${floor.id}`)),
      );

      const nextApartmentsMap: Record<number, Apartment[]> = {};
      sortedFloors.forEach((floor, index) => {
        nextApartmentsMap[floor.id] = apartmentsOfFloors[index] ?? [];
      });

      setApartmentsByFloor(nextApartmentsMap);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Không thể tải dữ liệu chi tiết tòa nhà";
      toast.error(message);
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    if (Number.isNaN(buildingId)) {
      toast.error("ID tòa nhà không hợp lệ");
      return;
    }
    void loadBuildingDetail().catch(() => undefined);
  }, [buildingId, loadBuildingDetail]);

  const fetchPopupData = useCallback(
    async (apartmentId: number) => {
      setPopupLoading(true);

      try {
        const detail = await api.get<ApartmentDetailResponse>(`/apartments/${apartmentId}/details`);

        setPopupData({
          apartment: detail.apartment,
          contract: detail.activeContract,
          tenant: detail.tenant,
          canReadContract: detail.canViewContract,
          canReadTenant: detail.canViewTenant,
        });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Không thể tải chi tiết căn hộ";
        toast.error(message);
      } finally {
        setPopupLoading(false);
      }
    },
    [],
  );

  const handleModelApartmentClick = useCallback(
    (apartment: Apartment) => {
      void fetchPopupData(apartment.id);
    },
    [fetchPopupData],
  );

  const handleUploadModel = useCallback(async () => {
    if (!selectedModelFile) {
      toast.error("Vui lòng chọn file .glb hoặc .gltf");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedModelFile);

    setUploadingModel(true);
    try {
      const response = await api.postFormData<{ message: string; data: Building }>(
        `/buildings/${buildingId}/model`,
        formData,
      );

      setBuilding(response.data);
      setSelectedModelFile(null);
      setResetTick((value) => value + 1);
      toast.success(response.message || "Upload mô hình 3D thành công");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Upload mô hình thất bại";
      toast.error(message);
    } finally {
      setUploadingModel(false);
    }
  }, [buildingId, selectedModelFile]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  if (!building) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Không tìm thấy dữ liệu tòa nhà.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pageError && (
        <PageErrorState
          compact
          title="Không thể tải màn hình tòa nhà"
          description={pageError}
          onRetry={() => void loadBuildingDetail()}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <Button variant="outline" size="sm" onClick={() => navigate("/map")}>
            Quay lại bản đồ
          </Button>
          <h1 className="text-2xl font-semibold">{building.name}</h1>
          <p className="text-sm text-muted-foreground">{building.address}</p>
        </div>

        <Button variant="outline" onClick={() => setResetTick((value) => value + 1)}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset góc nhìn
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách tầng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-[220px] pr-4 md:h-[290px]">
              <div className="space-y-2">
                {floors.map((floor) => (
                  <div
                    key={floor.id}
                    className={cn(
                      "rounded-md border p-2",
                      selectedFloorId === floor.id && "border-primary bg-primary/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-sm px-1 py-1 text-left transition hover:text-primary"
                        onClick={() => setSelectedFloorId(floor.id)}
                      >
                        <span className="text-sm font-medium">Tầng {floor.floorNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {apartmentsByFloor[floor.id]?.length ?? 0} căn
                        </span>
                      </button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          return (
                          setFloorVisibility((prev) => ({
                            ...prev,
                            [floor.id]: !prev[floor.id],
                          }))
                          );
                        }}
                      >
                        {floorVisibility[floor.id] ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {floors.length === 0 && (
                  <p className="text-sm text-muted-foreground">Tòa nhà chưa có dữ liệu tầng.</p>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="model-file">Upload mô hình 3D (.glb/.gltf)</Label>
              <Input
                id="model-file"
                type="file"
                accept=".glb,.gltf"
                disabled={!isManager}
                onChange={(event) => setSelectedModelFile(event.target.files?.[0] ?? null)}
              />
              <Button
                className="w-full"
                onClick={() => void handleUploadModel()}
                disabled={!isManager || uploadingModel || !selectedModelFile}
              >
                {uploadingModel ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload model
              </Button>
              {!isManager && (
                <p className="text-xs text-muted-foreground">
                  Tài khoản User chỉ xem được mô hình; upload dành cho luồng quản trị dữ liệu.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mô hình 3D tòa nhà</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="relative h-[420px] overflow-hidden rounded-md border bg-muted/20 md:h-[600px]">
              {modelUrl ? (
                <AppErrorBoundary
                  resetKeys={[modelUrl, resetTick]}
                  fallback={
                    <div className="flex h-full items-center justify-center px-6 text-center text-muted-foreground">
                      <div>
                        <Box className="mx-auto mb-2 h-10 w-10" />
                        <p>Không thể render mô hình 3D cho tòa nhà này.</p>
                        <p className="text-sm">Hãy thử reset góc nhìn hoặc tải lại trang để nạp lại model.</p>
                      </div>
                    </div>
                  }
                >
                  <ModelCanvas
                    modelUrl={modelUrl}
                    apartments={allApartments}
                    visibleFloorNumbers={visibleFloorNumbers}
                    onApartmentClick={handleModelApartmentClick}
                    resetTick={resetTick}
                  />
                </AppErrorBoundary>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-muted-foreground">
                  <div>
                    <Box className="mx-auto mb-2 h-10 w-10" />
                    <p>Tòa nhà chưa có file mô hình 3D.</p>
                    <p className="text-sm">Hãy upload file .glb/.gltf ở panel bên trái để hiển thị.</p>
                  </div>
                </div>
              )}

              {popupLoading && (
                <div className="pointer-events-none absolute right-3 top-3 rounded-md border bg-card px-3 py-2 text-sm shadow">
                  Đang tải thông tin căn hộ...
                </div>
              )}

              {popupData && !popupLoading && (
                <Card className="absolute left-2 right-2 top-2 z-20 border shadow-lg md:left-auto md:right-3 md:top-3 md:w-[340px]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">Căn hộ {popupData.apartment.code}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setPopupData(null)}>
                        Đóng
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Diện tích:</span> {formatArea(popupData.apartment.area)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Giá thuê:</span> {formatCurrency(popupData.apartment.rentalPrice)}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge className={statusColors[popupData.apartment.status]}>
                        {statusLabels[popupData.apartment.status]}
                      </Badge>
                    </div>

                    <Separator />

                    {popupData.canReadContract ? (
                      popupData.contract ? (
                        <div className="space-y-1">
                          <p>
                            <span className="text-muted-foreground">Hợp đồng:</span> #{popupData.contract.id}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Tiền thuê tháng:</span>{" "}
                            {formatCurrency(popupData.contract.monthlyRent)}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Người thuê:</span>{" "}
                            {popupData.canReadTenant
                              ? (popupData.tenant?.fullName ?? "Không có dữ liệu")
                              : "Dữ liệu riêng tư"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Căn hộ chưa có hợp đồng.</p>
                      )
                    ) : (
                      <p className="text-muted-foreground">Tài khoản hiện tại không có quyền xem dữ liệu hợp đồng.</p>
                    )}
                    <Separator />
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/buildings/${buildingId}/apartments/${popupData.apartment.id}`)}
                    >
                      Mở trang chi tiết căn hộ
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Thao tác: kéo chuột trái để xoay, cuộn chuột để zoom, kéo chuột phải để pan. Nhấn mesh căn hộ có
              gắn ID/mã phòng trong model để xem popup.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Căn hộ tầng {selectedFloor?.floorNumber ?? "-"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFloorApartments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu căn hộ cho tầng này.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {selectedFloorApartments.map((apartment) => (
                <button
                  key={apartment.id}
                  type="button"
                  className="rounded-md border p-3 text-left transition hover:border-primary"
                  onClick={() => navigate(`/buildings/${buildingId}/apartments/${apartment.id}`)}
                >
                  <p className="font-medium">{apartment.code}</p>
                  <p className="text-sm text-muted-foreground">{formatArea(apartment.area)}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(apartment.rentalPrice)}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
