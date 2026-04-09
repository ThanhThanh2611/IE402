import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState, PageErrorState } from "@/components/PageFeedback";
import { ApiError, api } from "@/lib/api";
import { formatDate, formatVND } from "@/lib/hooks";
import {
  apartmentAccessGrantSchema,
  apartmentSpaceSchema,
  furnitureCatalogSchema,
  furnitureItemSchema,
  furnitureLayoutSchema,
  validateForm,
  type ApartmentAccessGrantInput,
  type ApartmentSpaceInput,
  type FurnitureCatalogInput,
  type FurnitureItemInput,
  type FurnitureLayoutInput,
} from "@/lib/validators";
import type {
  ApartmentAccessGrant,
  ApartmentDetailResponse,
  ApartmentSpace,
  FurnitureCatalogItem,
  FurnitureItem,
  FurnitureLayout,
  User,
} from "@/types";
import { Pencil, Plus, Trash2 } from "lucide-react";

const apartmentStatusLabels = {
  available: "Còn trống",
  rented: "Đã thuê",
  maintenance: "Bảo trì",
} as const;

const apartmentStatusColors = {
  available: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  rented: "bg-primary/10 text-primary border border-primary/20",
  maintenance: "bg-muted text-muted-foreground border border-border",
} as const;

const roomTypeLabels: Record<string, string> = {
  living_room: "Phòng khách",
  bedroom: "Phòng ngủ",
  kitchen: "Bếp",
  bathroom: "Phòng tắm",
  balcony: "Ban công",
  corridor: "Hành lang",
  storage: "Kho",
  other: "Khác",
};

const spaceTypeLabels: Record<string, string> = {
  unit: "Toàn bộ căn hộ",
  room: "Phòng",
  zone: "Vùng con",
};

const layoutStatusLabels: Record<string, string> = {
  draft: "Bản nháp",
  published: "Đã công bố",
  archived: "Lưu trữ",
};

const furnitureCategoryLabels: Record<string, string> = {
  sofa: "Sofa",
  table: "Bàn",
  chair: "Ghế",
  bed: "Giường",
  cabinet: "Tủ / Kệ",
  appliance: "Thiết bị",
  decor: "Trang trí",
  other: "Khác",
};

const emptySpaceForm: ApartmentSpaceInput = {
  name: "",
  spaceType: "room",
  roomType: null,
  parentSpaceId: null,
  model3dUrl: "",
  boundary: "",
  metadata: "",
};

const emptyLayoutForm: FurnitureLayoutInput = {
  name: "",
  status: "draft",
  version: 1,
};

const emptyItemForm: FurnitureItemInput = {
  catalogId: 0,
  spaceId: null,
  label: "",
  position: "POINT Z (0 0 0)",
  rotationX: "0",
  rotationY: "0",
  rotationZ: "0",
  scaleX: "1",
  scaleY: "1",
  scaleZ: "1",
  isLocked: false,
  metadata: "",
};

const emptyCatalogForm: FurnitureCatalogInput = {
  code: "",
  name: "",
  category: "other",
  model3dUrl: "",
  defaultWidth: "",
  defaultDepth: "",
  defaultHeight: "",
  metadata: "",
  isActive: true,
};

const emptyGrantForm: ApartmentAccessGrantInput = {
  userId: 0,
  canViewTenant: true,
  canViewContract: false,
  expiresAt: "",
  note: "",
};

function parseJsonField(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

function stringifyMetadata(value: Record<string, unknown> | null | undefined) {
  return value ? JSON.stringify(value, null, 2) : "";
}

function getSpaceLabel(space: ApartmentSpace) {
  return space.name;
}

function getCatalogLabel(item: FurnitureCatalogItem) {
  return item.name;
}

function getGrantUserLabel(user: User) {
  return `${user.fullName} (@${user.username})`;
}

function parsePointZ(value: string): { x: number; y: number; z: number } {
  const matched = value.match(/POINT\s+Z\s*\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!matched) return { x: 0, y: 0, z: 0 };
  return {
    x: Number(matched[1]) || 0,
    y: Number(matched[2]) || 0,
    z: Number(matched[3]) || 0,
  };
}

function formatPointZ(value: string): string {
  const matched = value.match(/POINT\s+Z?\s*\(\s*([-\d.]+)\s+([-\d.]+)(?:\s+([-\d.]+))?\s*\)/i);
  if (!matched) return value;

  const x = Number(matched[1]);
  const y = Number(matched[2]);
  const z = Number(matched[3] ?? 0);

  return `X: ${x}, Y: ${y}, Z: ${z}`;
}

type WorkspacePolygonPoint = {
  x: number;
  y: number;
};

type RenderableWorkspaceSpace = {
  id: number;
  name: string;
  spaceType: ApartmentSpace["spaceType"];
  roomType: ApartmentSpace["roomType"];
  points: WorkspacePolygonPoint[];
  labelPoint: WorkspacePolygonPoint;
  area: number;
};

function parsePolygonZWkt(boundary?: string | null): WorkspacePolygonPoint[] {
  if (!boundary) return [];

  const matched = boundary.match(/POLYGON\s+Z?\s*\(\(\s*(.+?)\s*\)\)/i);
  if (!matched) return [];

  return matched[1]
    .split(",")
    .map((segment) => segment.trim())
    .map((segment) => {
      const [x, y] = segment.split(/\s+/).map((value) => Number(value));
      return {
        x,
        y,
      };
    })
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function getPolygonArea(points: WorkspacePolygonPoint[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area / 2);
}

function getPolygonCentroid(points: WorkspacePolygonPoint[]): WorkspacePolygonPoint {
  if (points.length === 0) {
    return { x: 50, y: 50 };
  }

  const areaFactor = points.reduce((accumulator, current, index) => {
    const next = points[(index + 1) % points.length];
    return accumulator + (current.x * next.y - next.x * current.y);
  }, 0);

  if (Math.abs(areaFactor) < 1e-6) {
    const total = points.reduce(
      (accumulator, point) => ({
        x: accumulator.x + point.x,
        y: accumulator.y + point.y,
      }),
      { x: 0, y: 0 },
    );

    return {
      x: total.x / points.length,
      y: total.y / points.length,
    };
  }

  let centroidX = 0;
  let centroidY = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const factor = current.x * next.y - next.x * current.y;
    centroidX += (current.x + next.x) * factor;
    centroidY += (current.y + next.y) * factor;
  }

  const scale = 1 / (3 * areaFactor);
  return {
    x: centroidX * scale,
    y: centroidY * scale,
  };
}

function isPointInsidePolygon(point: WorkspacePolygonPoint, polygon: WorkspacePolygonPoint[]) {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const current = polygon[i];
    const previous = polygon[j];
    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) / ((previous.y - current.y) || 1e-9) +
          current.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function replaceLayoutInDetail(
  detail: ApartmentDetailResponse,
  layoutId: number,
  updater: (layout: FurnitureLayout) => FurnitureLayout,
): ApartmentDetailResponse {
  return {
    ...detail,
    layouts: detail.layouts.map((layout) =>
      layout.id === layoutId ? updater(layout) : layout,
    ),
  };
}

export default function ApartmentDetailPage() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { id, apartmentId } = useParams();
  const buildingId = Number(id);
  const resolvedApartmentId = Number(apartmentId);

  const [detail, setDetail] = useState<ApartmentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);

  const [spaceDialogOpen, setSpaceDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<ApartmentSpace | null>(null);
  const [spaceForm, setSpaceForm] = useState<ApartmentSpaceInput>(emptySpaceForm);
  const [spaceErrors, setSpaceErrors] = useState<Record<string, string>>({});

  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<FurnitureLayout | null>(null);
  const [layoutForm, setLayoutForm] = useState<FurnitureLayoutInput>(emptyLayoutForm);
  const [layoutErrors, setLayoutErrors] = useState<Record<string, string>>({});

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);
  const [itemForm, setItemForm] = useState<FurnitureItemInput>(emptyItemForm);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<FurnitureCatalogItem | null>(null);
  const [catalogForm, setCatalogForm] = useState<FurnitureCatalogInput>(emptyCatalogForm);
  const [catalogErrors, setCatalogErrors] = useState<Record<string, string>>({});

  const [accessGrants, setAccessGrants] = useState<ApartmentAccessGrant[]>([]);
  const [grantableUsers, setGrantableUsers] = useState<User[]>([]);
  const [loadingAccessGrants, setLoadingAccessGrants] = useState(false);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [editingGrant, setEditingGrant] = useState<ApartmentAccessGrant | null>(null);
  const [grantForm, setGrantForm] = useState<ApartmentAccessGrantInput>(emptyGrantForm);
  const [grantErrors, setGrantErrors] = useState<Record<string, string>>({});

  const [deleteState, setDeleteState] = useState<{
    type: "space" | "layout" | "item" | "catalog" | "grant";
    id: number;
  } | null>(null);

  const loadDetail = useCallback(async () => {
    if (Number.isNaN(resolvedApartmentId)) {
      toast.error("ID căn hộ không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      setPageError(null);
      const result = await api.get<ApartmentDetailResponse>(
        `/apartments/${resolvedApartmentId}/details`,
      );
      setDetail(result);
      setSelectedLayoutId((current) => {
        if (current && result.layouts.some((layout) => layout.id === current)) {
          return current;
        }
        return result.layouts[0]?.id ?? null;
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Không thể tải chi tiết căn hộ";
      toast.error(message);
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, [resolvedApartmentId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const loadAccessGrants = useCallback(async () => {
    if (!isManager || Number.isNaN(resolvedApartmentId)) return;

    setLoadingAccessGrants(true);
    try {
      const [grants, usersResult] = await Promise.all([
        api.get<ApartmentAccessGrant[]>(`/apartments/${resolvedApartmentId}/access-grants`),
        api.get<User[]>("/users"),
      ]);
      setAccessGrants(grants);
      setGrantableUsers(usersResult.filter((user) => user.role === "user" && user.isActive));
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể tải dữ liệu phân quyền căn hộ",
      );
    } finally {
      setLoadingAccessGrants(false);
    }
  }, [isManager, resolvedApartmentId]);

  useEffect(() => {
    if (!isManager) {
      setAccessGrants([]);
      setGrantableUsers([]);
      return;
    }

    void loadAccessGrants();
  }, [isManager, loadAccessGrants]);

  const spaces = detail?.spaces ?? [];
  const catalog = detail?.furnitureCatalog ?? [];
  const selectedLayout = useMemo(
    () => detail?.layouts.find((layout) => layout.id === selectedLayoutId) ?? null,
    [detail?.layouts, selectedLayoutId],
  );
  const selectedGrantUserIds = useMemo(
    () => new Set(accessGrants.map((grant) => grant.userId)),
    [accessGrants],
  );
  const workspaceSpaces = useMemo<RenderableWorkspaceSpace[]>(
    () =>
      spaces
        .map((space) => {
          const points = parsePolygonZWkt(space.boundary).map((point) => ({
            x: clamp(point.x, 0, 100),
            y: clamp(point.y, 0, 100),
          }));

          if (points.length < 3) return null;

          return {
            id: space.id,
            name: space.name,
            spaceType: space.spaceType,
            roomType: space.roomType,
            points,
            labelPoint: getPolygonCentroid(points),
            area: getPolygonArea(points),
          };
        })
        .filter((space): space is RenderableWorkspaceSpace => space !== null)
        .sort((left, right) => right.area - left.area),
    [spaces],
  );
  const availableGrantUsers = useMemo(
    () =>
      editingGrant
        ? grantableUsers
        : grantableUsers.filter((user) => !selectedGrantUserIds.has(user.id)),
    [editingGrant, grantableUsers, selectedGrantUserIds],
  );

  const openCreateSpace = () => {
    setEditingSpace(null);
    setSpaceForm(emptySpaceForm);
    setSpaceErrors({});
    setSpaceDialogOpen(true);
  };

  const openEditSpace = (space: ApartmentSpace) => {
    setEditingSpace(space);
    setSpaceForm({
      name: space.name,
      spaceType: space.spaceType,
      roomType: space.roomType,
      parentSpaceId: space.parentSpaceId,
      model3dUrl: space.model3dUrl ?? "",
      boundary: space.boundary ?? "",
      metadata: stringifyMetadata(space.metadata),
    });
    setSpaceErrors({});
    setSpaceDialogOpen(true);
  };

  const openCreateLayout = () => {
    setEditingLayout(null);
    setLayoutForm({
      ...emptyLayoutForm,
      version: (detail?.layouts[0]?.version ?? 0) + 1,
    });
    setLayoutErrors({});
    setLayoutDialogOpen(true);
  };

  const openEditLayout = (layout: FurnitureLayout) => {
    setEditingLayout(layout);
    setLayoutForm({
      name: layout.name,
      status: layout.status,
      version: layout.version,
    });
    setLayoutErrors({});
    setLayoutDialogOpen(true);
  };

  const openCreateItem = () => {
    if (!selectedLayout) {
      toast.error("Vui lòng chọn layout trước");
      return;
    }

    setEditingItem(null);
    setItemForm(emptyItemForm);
    setItemErrors({});
    setItemDialogOpen(true);
  };

  const openEditItem = (item: FurnitureItem) => {
    setEditingItem(item);
    setItemForm({
      catalogId: item.catalogId,
      spaceId: item.spaceId,
      label: item.label ?? "",
      position: item.position,
      rotationX: item.rotationX,
      rotationY: item.rotationY,
      rotationZ: item.rotationZ,
      scaleX: item.scaleX,
      scaleY: item.scaleY,
      scaleZ: item.scaleZ,
      isLocked: item.isLocked,
      metadata: stringifyMetadata(item.metadata),
    });
    setItemErrors({});
    setItemDialogOpen(true);
  };

  const openCreateCatalog = () => {
    setEditingCatalog(null);
    setCatalogForm(emptyCatalogForm);
    setCatalogErrors({});
    setCatalogDialogOpen(true);
  };

  const openEditCatalog = (item: FurnitureCatalogItem) => {
    setEditingCatalog(item);
    setCatalogForm({
      code: item.code,
      name: item.name,
      category: item.category,
      model3dUrl: item.model3dUrl,
      defaultWidth: item.defaultWidth ?? "",
      defaultDepth: item.defaultDepth ?? "",
      defaultHeight: item.defaultHeight ?? "",
      metadata: stringifyMetadata(item.metadata),
      isActive: item.isActive,
    });
    setCatalogErrors({});
    setCatalogDialogOpen(true);
  };

  const openCreateGrant = () => {
    setEditingGrant(null);
    setGrantForm(emptyGrantForm);
    setGrantErrors({});
    setGrantDialogOpen(true);
  };

  const openEditGrant = (grant: ApartmentAccessGrant) => {
    setEditingGrant(grant);
    setGrantForm({
      userId: grant.userId,
      canViewTenant: grant.canViewTenant,
      canViewContract: grant.canViewContract,
      expiresAt: toDateTimeInputValue(grant.expiresAt),
      note: grant.note ?? "",
    });
    setGrantErrors({});
    setGrantDialogOpen(true);
  };

  const handleSaveSpace = async () => {
    if (!detail) return;

    const validation = validateForm(apartmentSpaceSchema, spaceForm);
    if (!validation.success) {
      setSpaceErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...validation.data,
        roomType: validation.data.roomType || null,
        parentSpaceId: validation.data.parentSpaceId || null,
        model3dUrl: validation.data.model3dUrl?.trim() || null,
        boundary: validation.data.boundary?.trim() || null,
        metadata: parseJsonField(validation.data.metadata),
      };

      if (editingSpace) {
        await api.put(`/apartments/${detail.apartment.id}/spaces/${editingSpace.id}`, payload);
        toast.success("Cập nhật không gian thành công");
      } else {
        await api.post(`/apartments/${detail.apartment.id}/spaces`, payload);
        toast.success("Thêm không gian thành công");
      }

      setSpaceDialogOpen(false);
      await loadDetail();
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? "Metadata phải là JSON hợp lệ"
          : error instanceof ApiError
            ? error.message
            : "Không thể lưu không gian",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLayout = async () => {
    if (!detail) return;

    const validation = validateForm(furnitureLayoutSchema, layoutForm);
    if (!validation.success) {
      setLayoutErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      if (editingLayout) {
        await api.put(`/apartments/${detail.apartment.id}/layouts/${editingLayout.id}`, validation.data);
        toast.success("Cập nhật layout thành công");
      } else {
        await api.post(`/apartments/${detail.apartment.id}/layouts`, validation.data);
        toast.success("Tạo layout thành công");
      }

      setLayoutDialogOpen(false);
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể lưu layout");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async () => {
    if (!detail || !selectedLayout) return;

    const validation = validateForm(furnitureItemSchema, itemForm);
    if (!validation.success) {
      setItemErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...validation.data,
        spaceId: validation.data.spaceId || null,
        label: validation.data.label?.trim() || null,
        metadata: parseJsonField(validation.data.metadata),
      };

      if (editingItem) {
        await api.put(
          `/apartments/${detail.apartment.id}/layouts/${selectedLayout.id}/items/${editingItem.id}`,
          payload,
        );
        toast.success("Cập nhật item thành công");
      } else {
        await api.post(
          `/apartments/${detail.apartment.id}/layouts/${selectedLayout.id}/items`,
          payload,
        );
        toast.success("Thêm item thành công");
      }

      setItemDialogOpen(false);
      await loadDetail();
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? "Metadata phải là JSON hợp lệ"
          : error instanceof ApiError
            ? error.message
            : "Không thể lưu item nội thất",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!detail || !deleteState) return;

    try {
      setSaving(true);
      if (deleteState.type === "space") {
        await api.delete(`/apartments/${detail.apartment.id}/spaces/${deleteState.id}`);
      }
      if (deleteState.type === "layout") {
        await api.delete(`/apartments/${detail.apartment.id}/layouts/${deleteState.id}`);
      }
      if (deleteState.type === "item" && selectedLayout) {
        await api.delete(
          `/apartments/${detail.apartment.id}/layouts/${selectedLayout.id}/items/${deleteState.id}`,
        );
      }
      if (deleteState.type === "catalog") {
        await api.delete(`/furniture-catalog/${deleteState.id}`);
      }
      if (deleteState.type === "grant") {
        await api.delete(`/apartments/${detail.apartment.id}/access-grants/${deleteState.id}`);
      }

      toast.success("Xóa dữ liệu thành công");
      setDeleteState(null);
      if (deleteState.type === "grant") {
        await loadAccessGrants();
        await loadDetail();
        return;
      }
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể xóa dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCatalog = async () => {
    const validation = validateForm(furnitureCatalogSchema, catalogForm);
    if (!validation.success) {
      setCatalogErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...validation.data,
        defaultWidth: validation.data.defaultWidth?.trim() || null,
        defaultDepth: validation.data.defaultDepth?.trim() || null,
        defaultHeight: validation.data.defaultHeight?.trim() || null,
        metadata: parseJsonField(validation.data.metadata),
      };

      if (editingCatalog) {
        await api.put(`/furniture-catalog/${editingCatalog.id}`, payload);
        toast.success("Cập nhật mẫu nội thất thành công");
      } else {
        await api.post("/furniture-catalog", payload);
        toast.success("Thêm mẫu nội thất thành công");
      }

      setCatalogDialogOpen(false);
      await loadDetail();
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? "Metadata phải là JSON hợp lệ"
          : error instanceof ApiError
            ? error.message
            : "Không thể lưu mẫu nội thất",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGrant = async () => {
    if (!detail) return;

    const validation = validateForm(apartmentAccessGrantSchema, grantForm);
    if (!validation.success) {
      setGrantErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...validation.data,
        expiresAt: validation.data.expiresAt?.trim() || null,
        note: validation.data.note?.trim() || null,
      };

      if (editingGrant) {
        await api.put(`/apartments/${detail.apartment.id}/access-grants/${editingGrant.id}`, payload);
        toast.success("Cập nhật quyền truy cập thành công");
      } else {
        await api.post(`/apartments/${detail.apartment.id}/access-grants`, payload);
        toast.success("Cấp quyền truy cập thành công");
      }

      setGrantDialogOpen(false);
      await loadAccessGrants();
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể lưu quyền truy cập");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  if (!detail) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Không tìm thấy dữ liệu căn hộ.
        </CardContent>
      </Card>
    );
  }

  const currentCatalogName = (catalogId: number) =>
    catalog.find((item) => item.id === catalogId)?.name ?? `#${catalogId}`;

  const resolveDropSpaceId = (x: number, y: number) => {
    const containingSpaces = workspaceSpaces
      .filter((space) => isPointInsidePolygon({ x, y }, space.points))
      .sort((left, right) => left.area - right.area);

    return containingSpaces[0]?.id ?? null;
  };

  const handleWorkspaceDrop = async (
    event: DragEvent<HTMLDivElement>,
  ) => {
    if (!detail || !selectedLayout) return;

    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp(Math.round(((event.clientX - rect.left) / rect.width) * 100), 0, 100);
    const y = clamp(Math.round(((event.clientY - rect.top) / rect.height) * 100), 0, 100);

    try {
      const payload = JSON.parse(raw) as
        | { type: "catalog"; catalogId: number }
        | { type: "item"; itemId: number };

      if (payload.type === "catalog") {
        const nextPosition = `POINT Z (${x} ${y} 0)`;
        const resolvedSpaceId = resolveDropSpaceId(x, y);
        const createdItem = await api.post<FurnitureItem>(
          `/apartments/${detail.apartment.id}/layouts/${selectedLayout.id}/items`,
          {
            catalogId: payload.catalogId,
            spaceId: resolvedSpaceId,
            label: currentCatalogName(payload.catalogId),
            position: nextPosition,
            rotationX: "0",
            rotationY: "0",
            rotationZ: "0",
            scaleX: "1",
            scaleY: "1",
            scaleZ: "1",
            isLocked: false,
            metadata: { source: "drag-drop-workspace" },
          },
        );

        setDetail((current) => {
          if (!current) return current;

          return replaceLayoutInDetail(current, selectedLayout.id, (layout) => ({
            ...layout,
            items: [
              ...layout.items,
              {
                ...createdItem,
                position: nextPosition,
                spaceId: resolvedSpaceId,
              },
            ],
          }));
        });
        toast.success(
          resolvedSpaceId
            ? "Đã thêm nội thất vào layout và gắn vào không gian phù hợp"
            : "Đã thêm nội thất vào layout",
        );
      }

      if (payload.type === "item") {
        const item = selectedLayout.items.find((entry) => entry.id === payload.itemId);
        if (!item) return;

        const nextPosition = `POINT Z (${x} ${y} ${parsePointZ(item.position).z})`;
        const resolvedSpaceId = resolveDropSpaceId(x, y);
        await api.put(
          `/apartments/${detail.apartment.id}/layouts/${selectedLayout.id}/items/${item.id}`,
          {
            catalogId: item.catalogId,
            spaceId: resolvedSpaceId,
            label: item.label,
            position: nextPosition,
            rotationX: item.rotationX,
            rotationY: item.rotationY,
            rotationZ: item.rotationZ,
            scaleX: item.scaleX,
            scaleY: item.scaleY,
            scaleZ: item.scaleZ,
            isLocked: item.isLocked,
            metadata: item.metadata,
          },
        );

        setDetail((current) => {
          if (!current) return current;

          return replaceLayoutInDetail(current, selectedLayout.id, (layout) => ({
            ...layout,
            items: layout.items.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    position: nextPosition,
                    spaceId: resolvedSpaceId,
                  }
                : entry,
            ),
          }));
        });
        toast.success(
          resolvedSpaceId
            ? "Đã cập nhật vị trí nội thất và gắn lại không gian"
            : "Đã cập nhật vị trí nội thất",
        );
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể xử lý thao tác kéo thả");
    }
  };

  return (
    <div className="space-y-6">
      {pageError && (
        <PageErrorState
          compact
          title="Trang căn hộ đang tải lỗi"
          description={pageError}
          onRetry={() => void loadDetail()}
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Button variant="outline" size="sm" onClick={() => navigate(`/buildings/${buildingId}`)}>
            Quay lại tòa nhà
          </Button>
          <h1 className="text-2xl font-semibold">Chi tiết căn hộ {detail.apartment.code}</h1>
          <p className="text-sm text-muted-foreground">
            {detail.building?.name ?? "Không rõ tòa nhà"} · Tầng {detail.floor?.floorNumber ?? "-"}
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadDetail()}>
          Tải lại dữ liệu
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tổng quan căn hộ</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Diện tích</p>
              <p className="font-medium">{detail.apartment.area} m²</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giá thuê</p>
              <p className="font-medium">{formatVND(detail.apartment.rentalPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phòng ngủ / phòng tắm</p>
              <p className="font-medium">
                {detail.apartment.numBedrooms ?? "-"} / {detail.apartment.numBathrooms ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Indoor LoD</p>
              <p className="font-medium">{detail.apartment.indoorLodLevel ?? "lod4"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <Badge className={apartmentStatusColors[detail.apartment.status]}>
                {apartmentStatusLabels[detail.apartment.status]}
              </Badge>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Mô tả</p>
              <p className="font-medium">{detail.apartment.description || "Chưa có mô tả"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {detail.canViewContract ? "Hợp đồng hiện tại" : "Thông tin người thuê công khai"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.canViewContract && detail.activeContract ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Mã hợp đồng</p>
                  <p className="font-medium">#{detail.activeContract.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiền thuê tháng</p>
                  <p className="font-medium">{formatVND(detail.activeContract.monthlyRent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khách thuê</p>
                  <p className="font-medium">{detail.tenant?.fullName ?? "Không có dữ liệu"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời hạn</p>
                  <p className="font-medium">
                    {formatDate(detail.activeContract.startDate)} - {formatDate(detail.activeContract.endDate)}
                  </p>
                </div>
              </>
            ) : detail.tenant ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Người thuê</p>
                  <p className="font-medium">{detail.tenant.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quyền xem hợp đồng</p>
                  <p className="font-medium">Tài khoản hiện tại chỉ xem được thông tin công khai</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {detail.canViewContract
                  ? "Căn hộ chưa có hợp đồng đang áp dụng."
                  : "Căn hộ chưa có thông tin người thuê công khai."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {isManager && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Phân quyền xem tenant và hợp đồng</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Manager có thể cấp quyền theo từng căn hộ để user xem thông tin người thuê hoặc hợp đồng.
              </p>
            </div>
            <Button onClick={openCreateGrant} disabled={availableGrantUsers.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Cấp quyền
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng grant</p>
                <p className="mt-1 text-2xl font-semibold">{accessGrants.length}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Có quyền xem tenant</p>
                <p className="mt-1 text-2xl font-semibold">
                  {accessGrants.filter((grant) => grant.canViewTenant).length}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Có quyền xem contract</p>
                <p className="mt-1 text-2xl font-semibold">
                  {accessGrants.filter((grant) => grant.canViewContract).length}
                </p>
              </div>
            </div>

            {loadingAccessGrants ? (
              <Skeleton className="h-40 w-full" />
            ) : accessGrants.length === 0 ? (
              <EmptyState
                title="Chưa có access grant nào"
                description="Hiện chưa có user nào được cấp quyền riêng cho căn hộ này ngoài các quyền mặc định mà backend đang áp dụng."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Quyền xem tenant</TableHead>
                      <TableHead>Quyền xem contract</TableHead>
                      <TableHead>Hiệu lực đến</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessGrants.map((grant) => (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{grant.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              @{grant.username}
                              {grant.email ? ` · ${grant.email}` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={grant.canViewTenant ? "default" : "outline"}>
                            {grant.canViewTenant ? "Được xem" : "Không"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={grant.canViewContract ? "default" : "outline"}>
                            {grant.canViewContract ? "Được xem" : "Không"}
                          </Badge>
                        </TableCell>
                        <TableCell>{grant.expiresAt ? formatDate(grant.expiresAt) : "Không giới hạn"}</TableCell>
                        <TableCell className="max-w-64 truncate text-sm text-muted-foreground">
                          {grant.note || "Không có"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditGrant(grant)}>
                              <Pencil className="mr-1 h-4 w-4" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteState({ type: "grant", id: grant.id })}
                            >
                              <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                              Thu hồi
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {availableGrantUsers.length === 0 && !editingGrant && (
              <p className="text-xs text-muted-foreground">
                Tất cả user đang hoạt động đã có grant cho căn hộ này, bạn chỉ còn thao tác sửa hoặc thu hồi.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Không gian LoD4</CardTitle>
            {isManager && (
              <Button onClick={openCreateSpace}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm không gian
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Room type</TableHead>
                    <TableHead>Cha</TableHead>
                    {isManager && <TableHead className="text-right">Hành động</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spaces.map((space) => (
                    <TableRow key={space.id}>
                      <TableCell className="font-medium">{space.name}</TableCell>
                      <TableCell>{spaceTypeLabels[space.spaceType]}</TableCell>
                      <TableCell>{space.roomType ? roomTypeLabels[space.roomType] : "-"}</TableCell>
                      <TableCell>
                        {space.parentSpaceId
                          ? spaces.find((item) => item.id === space.parentSpaceId)?.name ?? `#${space.parentSpaceId}`
                          : "-"}
                      </TableCell>
                      {isManager && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditSpace(space)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDeleteState({ type: "space", id: space.id })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {spaces.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isManager ? 5 : 4} className="py-8 text-center text-muted-foreground">
                        Chưa có dữ liệu không gian indoor.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Layouts nội thất</CardTitle>
            <Button onClick={openCreateLayout}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo layout
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.layouts.map((layout) => (
              <button
                key={layout.id}
                type="button"
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedLayoutId === layout.id ? "border-primary bg-primary/5" : "hover:border-primary/60"
                }`}
                onClick={() => setSelectedLayoutId(layout.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{layout.name}</p>
                  <Badge variant="outline">{layoutStatusLabels[layout.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Version {layout.version}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditLayout(layout);
                    }}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteState({ type: "layout", id: layout.id });
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                    Xóa
                  </Button>
                </div>
              </button>
            ))}
            {detail.layouts.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có layout nội thất nào.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{selectedLayout ? `Items của ${selectedLayout.name}` : "Items nội thất"}</CardTitle>
          <Button onClick={openCreateItem} disabled={!selectedLayout}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm item
          </Button>
        </CardHeader>
        <CardContent>
          {selectedLayout ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhãn</TableHead>
                    <TableHead>Mẫu</TableHead>
                    <TableHead>Không gian</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Khóa</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedLayout.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.label || `Item #${item.id}`}</TableCell>
                      <TableCell>{currentCatalogName(item.catalogId)}</TableCell>
                      <TableCell>
                        {item.spaceId
                          ? spaces.find((space) => space.id === item.spaceId)?.name ?? `#${item.spaceId}`
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate">{formatPointZ(item.position)}</TableCell>
                      <TableCell>{item.isLocked ? "Có" : "Không"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditItem(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteState({ type: "item", id: item.id })}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedLayout.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Layout này chưa có item nội thất nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chọn một layout để xem danh sách item.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace kéo thả nội thất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspaceSpaces.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {workspaceSpaces.map((space) => (
                <Badge key={space.id} variant="outline" className="bg-background/80">
                  {spaceTypeLabels[space.spaceType]}
                  {" · "}
                  {space.name}
                </Badge>
              ))}
            </div>
          )}
          <div
            className="relative h-[360px] overflow-hidden rounded-xl border border-dashed bg-muted/30"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => void handleWorkspaceDrop(event)}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.12)_1px,transparent_1px)] bg-[size:32px_32px]" />
            {workspaceSpaces.length > 0 && (
              <svg
                className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {workspaceSpaces.map((space) => {
                  const polygonPoints = space.points.map((point) => `${point.x},${point.y}`).join(" ");
                  const polygonStyle =
                    space.spaceType === "unit"
                      ? { fill: "rgb(59 130 246 / 0.08)", stroke: "rgb(59 130 246 / 0.4)" }
                      : space.spaceType === "room"
                        ? { fill: "rgb(14 165 233 / 0.12)", stroke: "rgb(14 165 233 / 0.55)" }
                        : { fill: "rgb(245 158 11 / 0.12)", stroke: "rgb(245 158 11 / 0.55)" };

                  return (
                    <g key={space.id}>
                      <polygon
                        points={polygonPoints}
                        style={polygonStyle}
                        strokeWidth={0.6}
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={clamp(space.labelPoint.x, 4, 96)}
                        y={clamp(space.labelPoint.y, 6, 96)}
                        textAnchor="middle"
                        style={{ fill: "rgb(15 23 42 / 0.9)", fontSize: "4px", fontWeight: 600 }}
                      >
                        {space.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
            {selectedLayout ? (
              selectedLayout.items.map((item) => {
                const point = parsePointZ(item.position);
                const assignedSpace = item.spaceId
                  ? spaces.find((space) => space.id === item.spaceId) ?? null
                  : null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ type: "item", itemId: item.id }),
                      )
                    }
                    className="absolute z-10 min-w-20 rounded-md border bg-card px-3 py-2 text-xs shadow-sm"
                    style={{
                      left: `${clamp(point.x, 0, 100)}%`,
                      top: `${clamp(point.y, 0, 100)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span className="block">{item.label || currentCatalogName(item.catalogId)}</span>
                    {assignedSpace && (
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        {assignedSpace.name}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Chọn một layout để kéo thả nội thất.
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Kéo item từ thư viện nội thất phía dưới vào workspace để thêm mới. Kéo item đang có trong workspace để đổi vị trí. Nếu item rơi vào boundary của một không gian LoD4, hệ thống sẽ tự gắn item vào đúng không gian đó.
          </p>
          {workspaceSpaces.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Workspace đang chưa có sơ đồ phòng vì chưa có `boundary` hợp lệ ở các không gian LoD4.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thư viện nội thất</CardTitle>
          {isManager && (
            <Button onClick={openCreateCatalog}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mẫu nội thất
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {catalog.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div
                  draggable={!!selectedLayout}
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ type: "catalog", catalogId: item.id }),
                    )
                  }
                  className="cursor-grab"
                >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.code}</p>
                  </div>
                  <Badge variant="outline">{furnitureCategoryLabels[item.category]}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="truncate">Model: {item.model3dUrl}</p>
                  <p>
                    Kích thước: {item.defaultWidth ?? "-"} x {item.defaultDepth ?? "-"} x {item.defaultHeight ?? "-"}
                  </p>
                  <p>Trạng thái: {item.isActive ? "Đang dùng" : "Ngưng dùng"}</p>
                </div>
                </div>
                {isManager && (
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditCatalog(item)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteState({ type: "catalog", id: item.id })}>
                      <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {catalog.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu thư viện nội thất.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={spaceDialogOpen} onOpenChange={setSpaceDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSpace ? "Cập nhật không gian" : "Thêm không gian mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên không gian *</Label>
              <Input value={spaceForm.name} onChange={(e) => setSpaceForm((prev) => ({ ...prev, name: e.target.value }))} />
              {spaceErrors.name && <p className="text-sm text-destructive">{spaceErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Loại không gian *</Label>
              <Select value={spaceForm.spaceType} onValueChange={(value) => setSpaceForm((prev) => ({ ...prev, spaceType: value as ApartmentSpaceInput["spaceType"] }))}>
                <SelectTrigger className="w-full"><SelectValue>{spaceTypeLabels[spaceForm.spaceType]}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit" label="Toàn bộ căn hộ">Toàn bộ căn hộ</SelectItem>
                  <SelectItem value="room" label="Phòng">Phòng</SelectItem>
                  <SelectItem value="zone" label="Vùng con">Vùng con</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room type</Label>
              <Select value={spaceForm.roomType ?? "__none__"} onValueChange={(value) => setSpaceForm((prev) => ({ ...prev, roomType: value === "__none__" ? null : (value as ApartmentSpaceInput["roomType"]) }))}>
                <SelectTrigger className="w-full"><SelectValue>{spaceForm.roomType ? roomTypeLabels[spaceForm.roomType] : "Không chọn"}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" label="Không chọn">Không chọn</SelectItem>
                  {Object.entries(roomTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} label={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Không gian cha</Label>
              <Select value={spaceForm.parentSpaceId ? String(spaceForm.parentSpaceId) : "__none__"} onValueChange={(value) => setSpaceForm((prev) => ({ ...prev, parentSpaceId: value === "__none__" ? null : Number(value) }))}>
                <SelectTrigger className="w-full"><SelectValue>{spaceForm.parentSpaceId ? spaces.find((space) => space.id === spaceForm.parentSpaceId)?.name : "Không có"}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" label="Không có">Không có</SelectItem>
                  {spaces.filter((space) => !editingSpace || space.id !== editingSpace.id).map((space) => (
                    <SelectItem key={space.id} value={String(space.id)} label={getSpaceLabel(space)}>{space.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Model 3D URL</Label>
              <Input value={spaceForm.model3dUrl ?? ""} onChange={(e) => setSpaceForm((prev) => ({ ...prev, model3dUrl: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Boundary (WKT PolygonZ)</Label>
              <Textarea value={spaceForm.boundary ?? ""} onChange={(e) => setSpaceForm((prev) => ({ ...prev, boundary: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Metadata (JSON)</Label>
              <Textarea rows={4} value={spaceForm.metadata ?? ""} onChange={(e) => setSpaceForm((prev) => ({ ...prev, metadata: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpaceDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => void handleSaveSpace()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={layoutDialogOpen} onOpenChange={setLayoutDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLayout ? "Cập nhật layout" : "Tạo layout mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên layout *</Label>
              <Input value={layoutForm.name} onChange={(e) => setLayoutForm((prev) => ({ ...prev, name: e.target.value }))} />
              {layoutErrors.name && <p className="text-sm text-destructive">{layoutErrors.name}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={layoutForm.status} onValueChange={(value) => setLayoutForm((prev) => ({ ...prev, status: value as FurnitureLayoutInput["status"] }))}>
                  <SelectTrigger className="w-full"><SelectValue>{layoutStatusLabels[layoutForm.status]}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" label="Bản nháp">Bản nháp</SelectItem>
                    <SelectItem value="published" label="Đã công bố">Đã công bố</SelectItem>
                    <SelectItem value="archived" label="Lưu trữ">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input type="number" min={1} value={layoutForm.version} onChange={(e) => setLayoutForm((prev) => ({ ...prev, version: Number(e.target.value || 1) }))} />
                {layoutErrors.version && <p className="text-sm text-destructive">{layoutErrors.version}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLayoutDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => void handleSaveLayout()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Cập nhật item nội thất" : "Thêm item nội thất"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mẫu nội thất *</Label>
              <Select value={itemForm.catalogId ? String(itemForm.catalogId) : ""} onValueChange={(value) => setItemForm((prev) => ({ ...prev, catalogId: Number(value) }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn mẫu nội thất">{itemForm.catalogId ? catalog.find((item) => item.id === itemForm.catalogId)?.name : undefined}</SelectValue></SelectTrigger>
                <SelectContent>
                  {catalog.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)} label={getCatalogLabel(item)}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {itemErrors.catalogId && <p className="text-sm text-destructive">{itemErrors.catalogId}</p>}
            </div>
            <div className="space-y-2">
              <Label>Không gian chứa</Label>
              <Select value={itemForm.spaceId ? String(itemForm.spaceId) : "__none__"} onValueChange={(value) => setItemForm((prev) => ({ ...prev, spaceId: value === "__none__" ? null : Number(value) }))}>
                <SelectTrigger className="w-full"><SelectValue>{itemForm.spaceId ? spaces.find((space) => space.id === itemForm.spaceId)?.name : "Không gắn không gian"}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" label="Không gắn không gian">Không gắn không gian</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={String(space.id)} label={getSpaceLabel(space)}>{space.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nhãn</Label>
              <Input value={itemForm.label ?? ""} onChange={(e) => setItemForm((prev) => ({ ...prev, label: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Vị trí (WKT PointZ) *</Label>
              <Input value={itemForm.position} onChange={(e) => setItemForm((prev) => ({ ...prev, position: e.target.value }))} />
              {itemErrors.position && <p className="text-sm text-destructive">{itemErrors.position}</p>}
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
              <div className="space-y-2"><Label>Rotation X</Label><Input value={itemForm.rotationX} onChange={(e) => setItemForm((prev) => ({ ...prev, rotationX: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Rotation Y</Label><Input value={itemForm.rotationY} onChange={(e) => setItemForm((prev) => ({ ...prev, rotationY: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Rotation Z</Label><Input value={itemForm.rotationZ} onChange={(e) => setItemForm((prev) => ({ ...prev, rotationZ: e.target.value }))} /></div>
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
              <div className="space-y-2"><Label>Scale X</Label><Input value={itemForm.scaleX} onChange={(e) => setItemForm((prev) => ({ ...prev, scaleX: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Scale Y</Label><Input value={itemForm.scaleY} onChange={(e) => setItemForm((prev) => ({ ...prev, scaleY: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Scale Z</Label><Input value={itemForm.scaleZ} onChange={(e) => setItemForm((prev) => ({ ...prev, scaleZ: e.target.value }))} /></div>
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-md border px-3 py-2">
              <div><p className="font-medium">Khóa item</p><p className="text-sm text-muted-foreground">Ngăn chỉnh sửa ngoài ý muốn</p></div>
              <Switch checked={itemForm.isLocked} onCheckedChange={(checked) => setItemForm((prev) => ({ ...prev, isLocked: checked }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Metadata (JSON)</Label>
              <Textarea rows={4} value={itemForm.metadata ?? ""} onChange={(e) => setItemForm((prev) => ({ ...prev, metadata: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => void handleSaveItem()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCatalog ? "Cập nhật mẫu nội thất" : "Thêm mẫu nội thất"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mã *</Label>
              <Input value={catalogForm.code} onChange={(e) => setCatalogForm((prev) => ({ ...prev, code: e.target.value }))} />
              {catalogErrors.code && <p className="text-sm text-destructive">{catalogErrors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tên *</Label>
              <Input value={catalogForm.name} onChange={(e) => setCatalogForm((prev) => ({ ...prev, name: e.target.value }))} />
              {catalogErrors.name && <p className="text-sm text-destructive">{catalogErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Loại nội thất</Label>
              <Select value={catalogForm.category} onValueChange={(value) => setCatalogForm((prev) => ({ ...prev, category: value as FurnitureCatalogInput["category"] }))}>
                <SelectTrigger className="w-full"><SelectValue>{furnitureCategoryLabels[catalogForm.category]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {Object.entries(furnitureCategoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} label={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model URL *</Label>
              <Input value={catalogForm.model3dUrl} onChange={(e) => setCatalogForm((prev) => ({ ...prev, model3dUrl: e.target.value }))} />
              {catalogErrors.model3dUrl && <p className="text-sm text-destructive">{catalogErrors.model3dUrl}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rộng</Label>
              <Input value={catalogForm.defaultWidth ?? ""} onChange={(e) => setCatalogForm((prev) => ({ ...prev, defaultWidth: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Sâu</Label>
              <Input value={catalogForm.defaultDepth ?? ""} onChange={(e) => setCatalogForm((prev) => ({ ...prev, defaultDepth: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cao</Label>
              <Input value={catalogForm.defaultHeight ?? ""} onChange={(e) => setCatalogForm((prev) => ({ ...prev, defaultHeight: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="font-medium">Kích hoạt mẫu</p>
                <p className="text-sm text-muted-foreground">Cho phép mẫu xuất hiện trong thư viện kéo thả</p>
              </div>
              <Switch checked={catalogForm.isActive} onCheckedChange={(checked) => setCatalogForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Metadata (JSON)</Label>
              <Textarea rows={4} value={catalogForm.metadata ?? ""} onChange={(e) => setCatalogForm((prev) => ({ ...prev, metadata: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatalogDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => void handleSaveCatalog()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingGrant ? "Cập nhật access grant" : "Cấp access grant mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Người dùng *</Label>
              <Select
                value={grantForm.userId ? String(grantForm.userId) : ""}
                onValueChange={(value) => setGrantForm((prev) => ({ ...prev, userId: Number(value) }))}
                disabled={!!editingGrant}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn user cần cấp quyền">
                    {grantForm.userId
                      ? (editingGrant ? grantableUsers : availableGrantUsers).find((user) => user.id === grantForm.userId)
                        ? getGrantUserLabel(((editingGrant ? grantableUsers : availableGrantUsers).find((user) => user.id === grantForm.userId))!)
                        : undefined
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(editingGrant ? grantableUsers : availableGrantUsers).map((user) => (
                    <SelectItem key={user.id} value={String(user.id)} label={getGrantUserLabel(user)}>
                      {user.fullName} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {grantErrors.userId && <p className="text-sm text-destructive">{grantErrors.userId}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border px-3 py-3">
                <div>
                  <p className="font-medium">Xem tenant</p>
                  <p className="text-sm text-muted-foreground">Cho phép xem thông tin người thuê</p>
                </div>
                <Switch
                  checked={grantForm.canViewTenant}
                  onCheckedChange={(checked) => setGrantForm((prev) => ({ ...prev, canViewTenant: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-3">
                <div>
                  <p className="font-medium">Xem contract</p>
                  <p className="text-sm text-muted-foreground">Cho phép xem hợp đồng hiện hành</p>
                </div>
                <Switch
                  checked={grantForm.canViewContract}
                  onCheckedChange={(checked) => setGrantForm((prev) => ({ ...prev, canViewContract: checked }))}
                />
              </div>
            </div>
            {grantErrors.canViewTenant && (
              <p className="text-sm text-destructive">{grantErrors.canViewTenant}</p>
            )}

            <div className="space-y-2">
              <Label>Hiệu lực đến</Label>
              <Input
                type="datetime-local"
                value={grantForm.expiresAt ?? ""}
                onChange={(event) => setGrantForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                rows={4}
                value={grantForm.note ?? ""}
                onChange={(event) => setGrantForm((prev) => ({ ...prev, note: event.target.value }))}
                placeholder="Ví dụ: cấp quyền hỗ trợ CSKH đến hết quý này"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => void handleSaveGrant()} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu grant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteState} onOpenChange={(open) => !open && setDeleteState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa dữ liệu này? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={saving}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
