import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Material, Mesh, Object3D } from "three";
import { ArrowUpDown, ArrowUp, Box, DoorOpen, Eye, EyeOff, Loader2, RefreshCcw, Upload } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { PageErrorState } from "@/components/PageFeedback";
import type {
  Apartment,
  ApartmentDetailResponse,
  Building,
  BuildingGraph,
  Floor,
  NavigationNode,
  RentalContract,
  Tenant,
} from "@/types";
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

type NavigationHotspotForm = {
  nodeType: "door" | "elevator" | "stairs" | "junction";
  label: string;
  lng: string;
  lat: string;
  z: string;
  localX: string;
  localY: string;
  localZ: string;
  meshRef: string;
  metadata: string;
};

const DEFAULT_CAMERA_POS: [number, number, number] = [22, 18, 22];
const DEFAULT_FLOOR_CAMERA_POS: [number, number, number] = [0, 18, 18];
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

function getNodeDisplayLabel(node: NavigationNode) {
  if (node.nodeType === "door") {
    return node.apartmentCode ?? node.label ?? "Cửa căn hộ";
  }

  if (node.nodeType === "junction") {
    return node.label ?? "Điểm giao";
  }

  return node.label ?? (node.nodeType === "elevator" ? "Thang máy" : "Cầu thang");
}

function stringifyHotspotMetadata(value: Record<string, unknown> | null | undefined) {
  return value ? JSON.stringify(value, null, 2) : "";
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseRequiredNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
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

function FloorModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return <primitive object={clonedScene} />;
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

type FloorHotspotSceneProps = {
  modelUrl: string | null;
  nodes: NavigationNode[];
  activeNodeId?: number | null;
  onNodeClick: (node: NavigationNode) => void;
  resetTick: number;
};

function FloorHotspotScene({
  modelUrl,
  nodes,
  activeNodeId,
  onNodeClick,
  resetTick,
}: FloorHotspotSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.object.position.set(...DEFAULT_FLOOR_CAMERA_POS);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [resetTick]);

  const renderableNodes = useMemo(
    () => nodes.filter((node) => node.localX !== null && node.localY !== null && node.localZ !== null),
    [nodes],
  );

  return (
    <Canvas camera={{ position: DEFAULT_FLOOR_CAMERA_POS, fov: 45 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[12, 18, 8]} intensity={1} />
      <directionalLight position={[-8, 8, -6]} intensity={0.35} />

      {modelUrl ? (
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
                Đang tải mặt sàn 3D...
              </div>
            </Html>
          }
        >
          <FloorModel modelUrl={modelUrl} />
        </Suspense>
      ) : (
        <Html center>
          <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Đang dùng chế độ hotspot thử nghiệm, chưa có model 3D riêng cho tầng.
          </div>
        </Html>
      )}

      {renderableNodes.map((node) => {
        const markerLabel = getNodeDisplayLabel(node);
        const isActive = activeNodeId === node.id;
        const markerIcon =
          node.nodeType === "door" ? (
            <DoorOpen className="h-4 w-4" />
          ) : node.nodeType === "elevator" ? (
            <ArrowUpDown className="h-4 w-4" />
          ) : node.nodeType === "junction" ? (
            <Box className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          );

        return (
          <Html
            key={node.id}
            position={[node.localX ?? 0, node.localY ?? 0, node.localZ ?? 0]}
            center
            occlude={false}
          >
            <button
              type="button"
              onClick={() => onNodeClick(node)}
              className={cn(
                "min-w-24 rounded-full border bg-card/95 px-3 py-2 text-[11px] shadow-lg backdrop-blur transition hover:border-primary hover:text-primary",
                isActive && "border-primary bg-primary/10 text-primary",
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {markerIcon}
                <span>{markerLabel}</span>
              </span>
            </button>
          </Html>
        );
      })}

      <OrbitControls ref={controlsRef} makeDefault enablePan minDistance={3} maxDistance={80} />
      <gridHelper args={[60, 30, "#bcbcbc", "#d9d9d9"]} />
    </Canvas>
  );
}

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const buildingId = Number(id);
  const buildingModelInputRef = useRef<HTMLInputElement | null>(null);
  const floorModelInputRef = useRef<HTMLInputElement | null>(null);

  const [building, setBuilding] = useState<Building | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [apartmentsByFloor, setApartmentsByFloor] = useState<Record<number, Apartment[]>>({});
  const [floorVisibility, setFloorVisibility] = useState<Record<number, boolean>>({});
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "floor">("overview");
  const [graph, setGraph] = useState<BuildingGraph | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [uploadingFloorModel, setUploadingFloorModel] = useState(false);
  const [selectedFloorModelFile, setSelectedFloorModelFile] = useState<File | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupData, setPopupData] = useState<ApartmentPopupData | null>(null);
  const [connectorNode, setConnectorNode] = useState<NavigationNode | null>(null);
  const [resetTick, setResetTick] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [hotspotDialogOpen, setHotspotDialogOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<NavigationNode | null>(null);
  const [hotspotForm, setHotspotForm] = useState<NavigationHotspotForm>({
    nodeType: "door",
    label: "",
    lng: "",
    lat: "",
    z: "",
    localX: "",
    localY: "",
    localZ: "",
    meshRef: "",
    metadata: "",
  });
  const [savingHotspot, setSavingHotspot] = useState(false);

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
  const selectedFloorModelUrl = useMemo(
    () => resolveModelUrl(selectedFloor?.model3dUrl ?? null),
    [selectedFloor?.model3dUrl],
  );
  const selectedFloorNodes = useMemo(
    () => graph?.nodes.filter((node) => node.floorId === selectedFloorId) ?? [],
    [graph?.nodes, selectedFloorId],
  );
  const selectedFloorHotspots = useMemo(
    () =>
      selectedFloorNodes.filter(
        (node) => node.localX !== null && node.localY !== null && node.localZ !== null,
      ),
    [selectedFloorNodes],
  );
  const connectorDestinations = useMemo(() => {
    if (!connectorNode || !graph) return [];

    const connectorEdgeType = connectorNode.nodeType === "elevator" ? "elevator" : "stairs";
    const visitedNodeIds = new Set<number>([connectorNode.id]);
    const queue = [connectorNode.id];
    const destinationFloorIds = new Set<number>();

    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (!currentNodeId) continue;

      for (const edge of graph.edges) {
        if (edge.edgeType !== connectorEdgeType) continue;

        const isStart = edge.startNodeId === currentNodeId;
        const isEnd = edge.endNodeId === currentNodeId;
        if (!isStart && !isEnd) continue;

        const targetNodeId = isStart ? edge.endNodeId : edge.startNodeId;
        if (visitedNodeIds.has(targetNodeId)) continue;

        const targetNode = graph.nodes.find((node) => node.id === targetNodeId);
        if (!targetNode || targetNode.nodeType !== connectorNode.nodeType) continue;

        visitedNodeIds.add(targetNodeId);
        queue.push(targetNodeId);

        if (targetNode.floorId !== connectorNode.floorId) {
          destinationFloorIds.add(targetNode.floorId);
        }
      }
    }

    return floors
      .filter((floor) => destinationFloorIds.has(floor.id))
      .sort((left, right) => left.floorNumber - right.floorNumber);
  }, [connectorNode, floors, graph]);

  const loadBuildingDetail = useCallback(async () => {
    setLoading(true);

    try {
      setPageError(null);
      setGraphError(null);
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

      try {
        const graphData = await api.get<BuildingGraph>(`/navigation/graph/${buildingId}`);
        setGraph(graphData);
      } catch (error) {
        setGraph(null);
        const message =
          error instanceof ApiError ? error.message : "Không thể tải hotspot indoor của tòa nhà";
        setGraphError(message);
      }
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

  useEffect(() => {
    setSelectedFloorModelFile(null);
    if (floorModelInputRef.current) {
      floorModelInputRef.current.value = "";
    }
  }, [selectedFloorId]);

  const fetchPopupData = useCallback(
    async (apartmentId: number) => {
      setPopupLoading(true);
      setConnectorNode(null);

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
      setViewMode("overview");
      void fetchPopupData(apartment.id);
    },
    [fetchPopupData],
  );

  const handleFloorNodeClick = useCallback(
    (node: NavigationNode) => {
      if (node.nodeType === "door" && node.apartmentId) {
        void fetchPopupData(node.apartmentId);
        return;
      }

      if (node.nodeType === "elevator" || node.nodeType === "stairs") {
        setPopupData(null);
        setConnectorNode(node);
        return;
      }

      toast.info("Node này chưa có hành động tương tác riêng.");
    },
    [fetchPopupData],
  );

  const openEditHotspot = useCallback((node: NavigationNode) => {
    setEditingHotspot(node);
    setHotspotForm({
      nodeType: node.nodeType,
      label: node.label ?? "",
      lng: String(node.lng),
      lat: String(node.lat),
      z: String(node.z ?? 0),
      localX: node.localX !== null ? String(node.localX) : "",
      localY: node.localY !== null ? String(node.localY) : "",
      localZ: node.localZ !== null ? String(node.localZ) : "",
      meshRef: node.meshRef ?? "",
      metadata: stringifyHotspotMetadata(node.metadata),
    });
    setHotspotDialogOpen(true);
  }, []);

  const openCreateHotspot = useCallback(() => {
    if (!selectedFloor) {
      toast.error("Vui lòng chọn tầng trước khi thêm hotspot");
      return;
    }

    setEditingHotspot(null);
    setHotspotForm({
      nodeType: "door",
      label: "",
      lng: building?.lng !== undefined ? String(building.lng) : "",
      lat: building?.lat !== undefined ? String(building.lat) : "",
      z: selectedFloor.elevation ? String(selectedFloor.elevation) : "0",
      localX: "",
      localY: "",
      localZ: "",
      meshRef: "",
      metadata: "",
    });
    setHotspotDialogOpen(true);
  }, [building?.lat, building?.lng, selectedFloor]);

  const handleSaveHotspot = useCallback(async () => {
    if (!selectedFloor) return;

    const localX = parseOptionalNumber(hotspotForm.localX);
    const localY = parseOptionalNumber(hotspotForm.localY);
    const localZ = parseOptionalNumber(hotspotForm.localZ);
    const lng = parseRequiredNumber(hotspotForm.lng);
    const lat = parseRequiredNumber(hotspotForm.lat);
    const z = parseRequiredNumber(hotspotForm.z);

    if ([localX, localY, localZ].some((value) => Number.isNaN(value))) {
      toast.error("Tọa độ local phải là số hợp lệ");
      return;
    }

    if ([lng, lat, z].some((value) => Number.isNaN(value))) {
      toast.error("Lng, lat, z phải là số hợp lệ");
      return;
    }

    let metadata: Record<string, unknown> | null = null;
    if (hotspotForm.metadata.trim()) {
      try {
        metadata = JSON.parse(hotspotForm.metadata) as Record<string, unknown>;
      } catch {
        toast.error("Metadata phải là JSON hợp lệ");
        return;
      }
    }

    setSavingHotspot(true);
    try {
      const payload = {
        floorId: selectedFloor.id,
        nodeType: hotspotForm.nodeType,
        label: hotspotForm.label.trim() || null,
        lng,
        lat,
        z,
        localX,
        localY,
        localZ,
        meshRef: hotspotForm.meshRef.trim() || null,
        metadata,
      };

      const savedNode = editingHotspot
        ? await api.put<NavigationNode>(`/navigation/nodes/${editingHotspot.id}`, payload)
        : await api.post<NavigationNode>("/navigation/nodes", payload);

      setGraph((current) => {
        if (!current) {
          return {
            nodes: [savedNode],
            edges: [],
          };
        }

        return editingHotspot
          ? {
              ...current,
              nodes: current.nodes.map((node) => (node.id === savedNode.id ? savedNode : node)),
            }
          : {
              ...current,
              nodes: [...current.nodes, savedNode],
            };
      });
      setHotspotDialogOpen(false);
      setEditingHotspot(savedNode);
      toast.success(editingHotspot ? "Đã cập nhật hotspot local" : "Đã tạo hotspot mới");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể lưu hotspot");
    } finally {
      setSavingHotspot(false);
    }
  }, [editingHotspot, hotspotForm, selectedFloor]);

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
      if (buildingModelInputRef.current) {
        buildingModelInputRef.current.value = "";
      }
      setResetTick((value) => value + 1);
      toast.success(response.message || "Upload mô hình 3D thành công");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Upload mô hình thất bại";
      toast.error(message);
    } finally {
      setUploadingModel(false);
    }
  }, [buildingId, selectedModelFile]);

  const handleUploadFloorModel = useCallback(async () => {
    if (!selectedFloor) {
      toast.error("Vui lòng chọn tầng trước khi upload model");
      return;
    }

    if (!selectedFloorModelFile) {
      toast.error("Vui lòng chọn file .glb hoặc .gltf cho tầng");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFloorModelFile);

    setUploadingFloorModel(true);
    try {
      const response = await api.postFormData<{ message: string; data: Floor }>(
        `/floors/${selectedFloor.id}/model`,
        formData,
      );

      setFloors((current) =>
        current.map((floor) => (floor.id === response.data.id ? response.data : floor)),
      );
      setSelectedFloorModelFile(null);
      if (floorModelInputRef.current) {
        floorModelInputRef.current.value = "";
      }
      setResetTick((value) => value + 1);
      toast.success(response.message || `Đã upload model 3D cho tầng ${selectedFloor.floorNumber}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Upload model tầng thất bại";
      toast.error(message);
    } finally {
      setUploadingFloorModel(false);
    }
  }, [selectedFloor, selectedFloorModelFile]);

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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={viewMode === "overview" ? "default" : "outline"}
            onClick={() => {
              setViewMode("overview");
              setConnectorNode(null);
            }}
          >
            3D tổng quan
          </Button>
          <Button
            variant={viewMode === "floor" ? "default" : "outline"}
            onClick={() => {
              setViewMode("floor");
              setPopupData(null);
            }}
            disabled={!selectedFloor}
          >
            Mặt sàn theo tầng
          </Button>
          <Button variant="outline" onClick={() => setResetTick((value) => value + 1)}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset góc nhìn
          </Button>
        </div>
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
                        onClick={() => {
                          setSelectedFloorId(floor.id);
                          setViewMode("floor");
                          setConnectorNode(null);
                        }}
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Hotspot tầng đang chọn</p>
                {isManager && (
                  <Button size="sm" variant="outline" onClick={openCreateHotspot} disabled={!selectedFloor}>
                    Thêm hotspot
                  </Button>
                )}
              </div>
              {graphError && (
                <p className="text-xs text-muted-foreground">
                  Dữ liệu hotspot indoor hiện chưa tải được: {graphError}
                </p>
              )}
              {selectedFloorHotspots.length > 0 ? (
                <div className="space-y-2">
                  {selectedFloorHotspots.map((node) => (
                    <div
                      key={node.id}
                      className={cn(
                        "rounded-md border px-3 py-2",
                        connectorNode?.id === node.id && "border-primary bg-primary/5",
                      )}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left text-sm transition hover:text-primary"
                        onClick={() => {
                          setViewMode("floor");
                          handleFloorNodeClick(node);
                        }}
                      >
                        <span>{getNodeDisplayLabel(node)}</span>
                        <span className="text-xs text-muted-foreground">
                          {node.nodeType === "door"
                            ? "Cửa phòng"
                            : node.nodeType === "elevator"
                              ? "Thang máy"
                              : node.nodeType === "stairs"
                                ? "Cầu thang"
                                : "Điểm giao"}
                        </span>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          local: {node.localX ?? "-"}, {node.localY ?? "-"}, {node.localZ ?? "-"}
                        </span>
                        {isManager && (
                          <Button variant="outline" size="sm" onClick={() => openEditHotspot(node)}>
                            Sửa hotspot
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Tầng này chưa có hotspot local để bấm trong mô hình 3D.
                  </p>
                  {isManager && (
                    <Button size="sm" variant="secondary" onClick={openCreateHotspot} disabled={!selectedFloor}>
                      Tạo hotspot đầu tiên
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="model-file">Upload mô hình 3D tổng quan tòa nhà (.glb/.gltf)</Label>
              <Input
                ref={buildingModelInputRef}
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
              <p className="text-xs text-muted-foreground">
                File này chỉ dùng cho chế độ <span className="font-medium">3D tổng quan</span>.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="floor-model-file">
                Upload model 3D riêng cho {selectedFloor ? `tầng ${selectedFloor.floorNumber}` : "tầng đang chọn"} (.glb/.gltf)
              </Label>
              <Input
                ref={floorModelInputRef}
                id="floor-model-file"
                type="file"
                accept=".glb,.gltf"
                disabled={!isManager || !selectedFloor}
                onChange={(event) => setSelectedFloorModelFile(event.target.files?.[0] ?? null)}
              />
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => void handleUploadFloorModel()}
                disabled={!isManager || !selectedFloor || uploadingFloorModel || !selectedFloorModelFile}
              >
                {uploadingFloorModel ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload model tầng
              </Button>
              <p className="text-xs text-muted-foreground">
                Floor mode chỉ render khi `floors.model3dUrl` có dữ liệu. Giới hạn upload: 70MB.
              </p>
              {selectedFloor?.model3dUrl && (
                <p className="text-xs text-muted-foreground">
                  Model tầng hiện tại: <span className="font-medium">{selectedFloor.model3dUrl}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {viewMode === "overview"
                ? "Mô hình 3D tổng quan tòa nhà"
                : `Mặt sàn 3D tầng ${selectedFloor?.floorNumber ?? "-"}`}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="relative h-[420px] overflow-hidden rounded-md border bg-muted/20 md:h-[600px]">
              {viewMode === "overview" ? (
                modelUrl ? (
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
                )
              ) : selectedFloorModelUrl || selectedFloorHotspots.length > 0 ? (
                <AppErrorBoundary
                  resetKeys={[selectedFloorModelUrl, selectedFloorId, resetTick, selectedFloorHotspots.length]}
                  fallback={
                    <div className="flex h-full items-center justify-center px-6 text-center text-muted-foreground">
                      <div>
                        <Box className="mx-auto mb-2 h-10 w-10" />
                        <p>Không thể render mặt sàn 3D cho tầng này.</p>
                        <p className="text-sm">Hãy thử chọn tầng khác hoặc kiểm tra lại file model của tầng.</p>
                      </div>
                    </div>
                  }
                >
                  <FloorHotspotScene
                    modelUrl={selectedFloorModelUrl}
                    nodes={selectedFloorHotspots}
                    activeNodeId={connectorNode?.id ?? null}
                    onNodeClick={handleFloorNodeClick}
                    resetTick={resetTick}
                  />
                </AppErrorBoundary>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-muted-foreground">
                  <div>
                    <Box className="mx-auto mb-2 h-10 w-10" />
                    <p>Tầng này chưa có file model 3D riêng.</p>
                    <p className="text-sm">Bạn vẫn có thể xem 3D tổng quan của cả tòa nhà hoặc gán `floors.model3dUrl` để bật floor mode.</p>
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

              {connectorNode && connectorDestinations.length > 0 && (
                <Card className="absolute left-2 right-2 bottom-2 z-20 border shadow-lg md:left-auto md:right-3 md:bottom-3 md:w-[320px]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{getNodeDisplayLabel(connectorNode)}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setConnectorNode(null)}>
                        Đóng
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Chọn tầng đích để chuyển nhanh qua {connectorNode.nodeType === "elevator" ? "thang máy" : "cầu thang"}.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {connectorDestinations.map((floor) => (
                        <Button
                          key={floor.id}
                          variant="outline"
                          onClick={() => {
                            setSelectedFloorId(floor.id);
                            setViewMode("floor");
                            setConnectorNode(null);
                            setPopupData(null);
                          }}
                        >
                          Tầng {floor.floorNumber}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              {viewMode === "overview"
                ? "Thao tác: kéo chuột trái để xoay, cuộn chuột để zoom, kéo chuột phải để pan. Nhấn mesh căn hộ có gắn ID/mã phòng trong model để xem popup."
                : "Trong chế độ tầng, các hotspot cửa phòng, thang máy và cầu thang sẽ nổi trực tiếp trên mặt sàn. Bấm cửa để mở thông tin căn hộ, bấm thang máy hoặc cầu thang để đổi tầng."}
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

      <Dialog open={hotspotDialogOpen} onOpenChange={setHotspotDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingHotspot ? "Chỉnh hotspot local" : "Thêm hotspot mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Loại node</Label>
              <Select
                value={hotspotForm.nodeType}
                onValueChange={(value) =>
                  setHotspotForm((current) => ({
                    ...current,
                    nodeType: value as NavigationHotspotForm["nodeType"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại node" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="door">Cửa phòng</SelectItem>
                  <SelectItem value="elevator">Thang máy</SelectItem>
                  <SelectItem value="stairs">Cầu thang</SelectItem>
                  <SelectItem value="junction">Điểm giao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nhãn hotspot</Label>
              <Input
                value={hotspotForm.label}
                onChange={(event) =>
                  setHotspotForm((current) => ({ ...current, label: event.target.value }))
                }
                placeholder="Ví dụ: Thang máy tầng 2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Lng</Label>
                <Input
                  value={hotspotForm.lng}
                  onChange={(event) =>
                    setHotspotForm((current) => ({ ...current, lng: event.target.value }))
                  }
                  placeholder="106.7001"
                />
              </div>
              <div className="space-y-2">
                <Label>Lat</Label>
                <Input
                  value={hotspotForm.lat}
                  onChange={(event) =>
                    setHotspotForm((current) => ({ ...current, lat: event.target.value }))
                  }
                  placeholder="10.7381"
                />
              </div>
              <div className="space-y-2">
                <Label>Z</Label>
                <Input
                  value={hotspotForm.z}
                  onChange={(event) =>
                    setHotspotForm((current) => ({ ...current, z: event.target.value }))
                  }
                  placeholder="15"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Local X</Label>
                <Input
                  value={hotspotForm.localX}
                  onChange={(event) =>
                    setHotspotForm((current) => ({ ...current, localX: event.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Local Y</Label>
                <Input
                  value={hotspotForm.localY}
                  onChange={(event) =>
                    setHotspotForm((current) => ({ ...current, localY: event.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Local Z</Label>
                <Input
                  value={hotspotForm.localZ}
                  onChange={(event) =>
                    setHotspotForm((current) => ({ ...current, localZ: event.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mesh ref</Label>
              <Input
                value={hotspotForm.meshRef}
                onChange={(event) =>
                  setHotspotForm((current) => ({ ...current, meshRef: event.target.value }))
                }
                placeholder="Ví dụ: HOTSPOT_ELEVATOR_F2_A"
              />
            </div>
            <div className="space-y-2">
              <Label>Metadata (JSON)</Label>
              <Textarea
                rows={4}
                value={hotspotForm.metadata}
                onChange={(event) =>
                  setHotspotForm((current) => ({ ...current, metadata: event.target.value }))
                }
                placeholder='{"source":"manual"}'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHotspotDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void handleSaveHotspot()} disabled={savingHotspot}>
              {savingHotspot ? "Đang lưu..." : "Lưu hotspot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
