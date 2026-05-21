import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatVND } from "@/lib/hooks";
import { apartmentSchema, validateForm, type ApartmentInput } from "@/lib/validators";
import { EmptyState, PageErrorState } from "@/components/PageFeedback";
import type { Apartment, Building, Floor } from "@/types";
import { toast } from "sonner";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Skeleton,
} from "@/components/ui";
import { Plus, Pencil, Trash2, LayoutGrid, List, Search, ChevronDown, ChevronUp, Bed, Bath, Maximize } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui";

const statusLabels = {
  available: "Còn trống",
  rented: "Đã thuê",
  maintenance: "Bảo trì",
};
const statusColors = {
  available: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  rented: "bg-primary/10 text-primary border border-primary/20",
  maintenance: "bg-muted text-muted-foreground border border-border",
};

const emptyForm: ApartmentInput = {
  floorId: 0,
  code: "",
  area: "",
  numBedrooms: null,
  numBathrooms: null,
  rentalPrice: "",
  description: "",
};

export default function ApartmentsPage() {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ApartmentInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Filters & UI States
  const [filterBuildingId, setFilterBuildingId] = useState<string>("");
  const [filterFloorId, setFilterFloorId] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchMinArea, setSearchMinArea] = useState<string>("");
  const [searchMaxArea, setSearchMaxArea] = useState<string>("");
  const [searchMinPrice, setSearchMinPrice] = useState<string>("");
  const [searchMaxPrice, setSearchMaxPrice] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12; // Grid view 12 items (3 columns x 4 rows) is very clean

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setPageError(null);
      const [apts, blds, flrs] = await Promise.all([
        api.get<Apartment[]>("/apartments"),
        api.get<Building[]>("/buildings"),
        api.get<Floor[]>("/floors"),
      ]);
      setApartments(apts);
      setBuildings(blds);
      setFloors(flrs);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách căn hộ lúc này";
      toast.error(message);
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to handle filter changes and reset to page 1
  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const filteredFloors = filterBuildingId
    ? floors.filter((f) => f.buildingId === Number(filterBuildingId))
    : floors;

  const filteredApartments = apartments.filter((a) => {
    if (filterFloorId && a.floorId !== Number(filterFloorId)) return false;
    if (filterBuildingId && !filteredFloors.some((f) => f.id === a.floorId)) return false;
    if (searchCode && !a.code.toLowerCase().includes(searchCode.trim().toLowerCase())) return false;
    if (searchStatus && a.status !== searchStatus) return false;
    if (searchMinArea && Number(a.area) < Number(searchMinArea)) return false;
    if (searchMaxArea && Number(a.area) > Number(searchMaxArea)) return false;
    if (searchMinPrice && Number(a.rentalPrice) < Number(searchMinPrice)) return false;
    if (searchMaxPrice && Number(a.rentalPrice) > Number(searchMaxPrice)) return false;
    return true;
  });

  const totalItems = filteredApartments.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedApartments = filteredApartments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getFloorLabel = (floorId: number) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return "";
    const building = buildings.find((b) => b.id === floor.buildingId);
    return `${building?.name || ""} - Tầng ${floor.floorNumber}`;
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (apt: Apartment) => {
    setEditId(apt.id);
    setForm({
      floorId: apt.floorId,
      code: apt.code,
      area: apt.area,
      numBedrooms: apt.numBedrooms,
      numBathrooms: apt.numBathrooms,
      rentalPrice: apt.rentalPrice,
      description: apt.description || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = validateForm(apartmentSchema, form);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const updatedApartment = await api.put<Apartment>(`/apartments/${editId}`, validation.data);
        setApartments((current) =>
          current.map((apartment) => (apartment.id === editId ? updatedApartment : apartment)),
        );
        toast.success("Cập nhật căn hộ thành công");
      } else {
        const createdApartment = await api.post<Apartment>("/apartments", validation.data);
        setApartments((current) => [...current, createdApartment]);
        toast.success("Thêm căn hộ thành công");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/apartments/${deleteId}`);
      setApartments((current) => current.filter((apartment) => apartment.id !== deleteId));
      toast.success("Xóa căn hộ thành công");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updatedApartment = await api.patch<Apartment>(`/apartments/${id}/status`, { status });
      setApartments((current) =>
        current.map((apartment) => (apartment.id === id ? updatedApartment : apartment)),
      );
      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };


  return (
    <div className="space-y-6">
      {pageError && (
        <PageErrorState
          compact
          title="Màn hình căn hộ đang tải lỗi"
          description={pageError}
          onRetry={() => void fetchData()}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Quản lý căn hộ</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách tất cả các căn hộ trong các tòa nhà. Quản lý trạng thái thuê và xem mô hình 3D.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border bg-background p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-sm"
              onClick={() => setViewMode("grid")}
              title="Xem dạng lưới card"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-sm"
              onClick={() => setViewMode("table")}
              title="Xem dạng bảng"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={openCreate} className="rounded-md">
            <Plus className="h-4 w-4 mr-2" />
            Thêm căn hộ
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tòa nhà</Label>
              <Select
                value={filterBuildingId || undefined}
                onValueChange={(v) => {
                  handleFilterChange(setFilterBuildingId, !v || v === "__all__" ? "" : v);
                  setFilterFloorId("");
                }}
              >
                <SelectTrigger className="w-full rounded-md h-9">
                  <SelectValue placeholder="Tất cả tòa nhà">
                    {filterBuildingId
                      ? buildings.find((building) => String(building.id) === filterBuildingId)?.name
                      : "Tất cả tòa nhà"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__" label="Tất cả tòa nhà">Tất cả tòa nhà</SelectItem>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)} label={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tầng</Label>
              <Select
                value={filterFloorId || undefined}
                onValueChange={(v) => handleFilterChange(setFilterFloorId, !v || v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="w-full rounded-md h-9">
                  <SelectValue placeholder="Tất cả tầng">
                    {filterFloorId
                      ? `Tầng ${filteredFloors.find((floor) => String(floor.id) === filterFloorId)?.floorNumber ?? ""}`.trim()
                      : "Tất cả tầng"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__" label="Tất cả tầng">Tất cả tầng</SelectItem>
                  {filteredFloors.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)} label={`Tầng ${f.floorNumber}`}>Tầng {f.floorNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mã căn hộ</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm mã căn hộ..."
                  value={searchCode}
                  onChange={(e) => handleFilterChange(setSearchCode, e.target.value)}
                  className="pl-9 rounded-md h-9"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="w-full rounded-md h-9 flex items-center justify-between"
              >
                <span>Bộ lọc nâng cao</span>
                {isFilterExpanded ? <ChevronUp className="h-4 w-4 ml-2 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          {/* Advanced Collapsible Filters */}
          {isFilterExpanded && (
            <div className="pt-3 border-t border-dashed grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                <Select
                  value={searchStatus || undefined}
                  onValueChange={(v) => handleFilterChange(setSearchStatus, !v || v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="w-full rounded-md h-9">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tất cả trạng thái</SelectItem>
                    <SelectItem value="available">Còn trống</SelectItem>
                    <SelectItem value="rented">Đã thuê</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Diện tích (m²)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={searchMinArea}
                    onChange={(e) => handleFilterChange(setSearchMinArea, e.target.value)}
                    className="rounded-md h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={searchMaxArea}
                    onChange={(e) => handleFilterChange(setSearchMaxArea, e.target.value)}
                    className="rounded-md h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Giá thuê (VND)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={searchMinPrice}
                    onChange={(e) => handleFilterChange(setSearchMinPrice, e.target.value)}
                    className="rounded-md h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={searchMaxPrice}
                    onChange={(e) => handleFilterChange(setSearchMaxPrice, e.target.value)}
                    className="rounded-md h-9"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : paginatedApartments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="Không có căn hộ phù hợp"
                description="Hãy thay đổi bộ lọc tìm kiếm nâng cao hoặc từ khóa để xem thêm căn hộ."
              />
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          /* Premium Card Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedApartments.map((apt) => (
              <Card key={apt.id} className="group overflow-hidden border-border/50 hover:shadow-md hover:border-border transition-all duration-200 flex flex-col justify-between rounded-xl">
                <CardHeader className="p-4 pb-2 space-y-1 relative">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                      Căn {apt.code}
                    </span>
                    <Select value={apt.status} onValueChange={(v) => v && handleStatusChange(apt.id, v)}>
                      <SelectTrigger className="w-fit h-7 border-none bg-transparent hover:bg-muted p-0.5 rounded px-2 gap-1.5 focus:ring-0">
                        <Badge className={cn("text-[10px] uppercase font-semibold", statusColors[apt.status])}>
                          {statusLabels[apt.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="min-w-[120px]">
                        <SelectItem value="available">Còn trống</SelectItem>
                        <SelectItem value="rented">Đã thuê</SelectItem>
                        <SelectItem value="maintenance">Bảo trì</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{getFloorLabel(apt.floorId)}</p>
                </CardHeader>

                <CardContent className="p-4 pt-2 pb-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-dashed border-border/60 text-xs">
                    <div className="flex flex-col items-center justify-center p-1 rounded bg-muted/40 text-center">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                        <Maximize className="h-3 w-3" /> Diện tích
                      </span>
                      <span className="font-semibold">{apt.area}m²</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1 rounded bg-muted/40 text-center">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                        <Bed className="h-3 w-3" /> P.Ngủ
                      </span>
                      <span className="font-semibold">{apt.numBedrooms ?? "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1 rounded bg-muted/40 text-center">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                        <Bath className="h-3 w-3" /> P.Tắm
                      </span>
                      <span className="font-semibold">{apt.numBathrooms ?? "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Giá thuê tháng</p>
                    <p className="font-extrabold text-lg text-primary leading-none">
                      {formatVND(apt.rentalPrice)}
                    </p>
                  </div>
                </CardContent>

                <div className="p-4 pt-0 flex gap-2 border-t border-border/40 bg-muted/10 group-hover:bg-muted/20 transition-colors">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-md h-8 text-xs font-medium"
                    onClick={() => {
                      const floor = floors.find((f) => f.id === apt.floorId);
                      if (!floor) {
                        toast.error("Không tìm thấy tầng của căn hộ");
                        return;
                      }
                      navigate(`/buildings/${floor.buildingId}/apartments/${apt.id}`);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-md" onClick={() => openEdit(apt)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-md border-destructive/20 hover:bg-destructive/5" onClick={() => setDeleteId(apt.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[920px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[120px] font-semibold">Mã căn hộ</TableHead>
                      <TableHead className="font-semibold">Vị trí tầng / Tòa</TableHead>
                      <TableHead className="text-right font-semibold">Diện tích</TableHead>
                      <TableHead className="text-center font-semibold w-[80px]">P.Ngủ</TableHead>
                      <TableHead className="text-center font-semibold w-[80px]">P.Tắm</TableHead>
                      <TableHead className="text-right font-semibold">Giá thuê</TableHead>
                      <TableHead className="text-center font-semibold w-[160px]">Trạng thái</TableHead>
                      <TableHead className="text-right font-semibold w-[180px]">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApartments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-muted/10">
                        <TableCell className="font-bold text-foreground">{apt.code}</TableCell>
                        <TableCell>{getFloorLabel(apt.floorId)}</TableCell>
                        <TableCell className="text-right font-medium">{apt.area} m²</TableCell>
                        <TableCell className="text-center">{apt.numBedrooms ?? "-"}</TableCell>
                        <TableCell className="text-center">{apt.numBathrooms ?? "-"}</TableCell>
                        <TableCell className="text-right font-bold text-foreground">{formatVND(apt.rentalPrice)}</TableCell>
                        <TableCell className="text-center">
                          <Select value={apt.status} onValueChange={(v) => v && handleStatusChange(apt.id, v)}>
                            <SelectTrigger className="w-[130px] mx-auto border-none bg-transparent hover:bg-muted p-0.5 rounded px-2 gap-1.5 focus:ring-0">
                              <Badge className={cn("text-[10px] uppercase font-semibold", statusColors[apt.status])}>
                                {statusLabels[apt.status]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Còn trống</SelectItem>
                              <SelectItem value="rented">Đã thuê</SelectItem>
                              <SelectItem value="maintenance">Bảo trì</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-medium"
                              onClick={() => {
                                const floor = floors.find((f) => f.id === apt.floorId);
                                if (!floor) {
                                  toast.error("Không tìm thấy tầng của căn hộ");
                                  return;
                                }
                                navigate(`/buildings/${floor.buildingId}/apartments/${apt.id}`);
                              }}
                            >
                              Xem
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(apt)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 border-destructive/20 hover:bg-destructive/5" onClick={() => setDeleteId(apt.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dynamic Shadcn Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 flex items-center justify-between border-t border-border/50">
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Hiển thị {Math.min(totalItems, (currentPage - 1) * pageSize + 1)}-{Math.min(totalItems, currentPage * pageSize)} trong tổng số {totalItems} căn hộ
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    text="Trước"
                    className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
                  />
                </PaginationItem>

                {(() => {
                  const items = [];
                  const maxVisiblePages = 5;

                  if (totalPages <= maxVisiblePages) {
                    for (let i = 1; i <= totalPages; i++) {
                      items.push(
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => setCurrentPage(i)}
                            className="cursor-pointer"
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  } else {
                    // Show 1
                    items.push(
                      <PaginationItem key={1}>
                        <PaginationLink
                          isActive={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    );

                    if (currentPage > 3) {
                      items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
                    }

                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) {
                      if (i > 1 && i < totalPages) {
                        items.push(
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === i}
                              onClick={() => setCurrentPage(i)}
                              className="cursor-pointer"
                            >
                              {i}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    }

                    if (currentPage < totalPages - 2) {
                      items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
                    }

                    // Show totalPages
                    items.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink
                          isActive={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return items;
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    text="Sau"
                    className={cn(currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa căn hộ" : "Thêm căn hộ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tầng *</Label>
              <Select value={form.floorId ? String(form.floorId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, floorId: Number(v || 0) }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tầng">
                    {form.floorId
                      ? (() => {
                          const floor = floors.find((item) => item.id === form.floorId);
                          const building = floor ? buildings.find((item) => item.id === floor.buildingId) : null;
                          return floor ? `${building?.name ?? "Tòa nhà"} - Tầng ${floor.floorNumber}` : undefined;
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => {
                    const b = buildings.find((b) => b.id === f.buildingId);
                    return (
                      <SelectItem key={f.id} value={String(f.id)} label={`${b?.name ?? "Tòa nhà"} - Tầng ${f.floorNumber}`}>
                        {b?.name} - Tầng {f.floorNumber}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.floorId && <p className="text-sm text-destructive">{errors.floorId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã căn hộ *</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label>Diện tích (m²) *</Label>
                <Input type="number" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
                {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phòng ngủ</Label>
                <Input type="number" value={form.numBedrooms ?? ""} onChange={(e) => setForm((f) => ({ ...f, numBedrooms: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="space-y-2">
                <Label>Phòng tắm</Label>
                <Input type="number" value={form.numBathrooms ?? ""} onChange={(e) => setForm((f) => ({ ...f, numBathrooms: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Giá thuê (VND/tháng) *</Label>
              <Input type="number" value={form.rentalPrice} onChange={(e) => setForm((f) => ({ ...f, rentalPrice: e.target.value }))} />
              {errors.rentalPrice && <p className="text-sm text-destructive">{errors.rentalPrice}</p>}
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              {apartments.find((a) => a.id === deleteId)?.status === "rented"
                ? "Căn hộ này đang trong trạng thái \"Đã thuê\". Thông tin hợp đồng và người thuê vẫn được giữ nguyên sau khi xóa. Bạn có chắc muốn xóa? Hành động này không thể hoàn tác."
                : "Bạn có chắc muốn xóa căn hộ này? Hành động này không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
