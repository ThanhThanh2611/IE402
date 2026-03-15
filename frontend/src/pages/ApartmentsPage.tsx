import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { formatVND } from "@/lib/hooks";
import { apartmentSchema, validateForm, type ApartmentInput } from "@/lib/validators";
import type { Apartment, Building, Floor } from "@/types";
import { toast } from "sonner";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Plus, Pencil, Trash2 } from "lucide-react";

const statusLabels = {
  available: "Còn trống",
  rented: "Đã thuê",
  maintenance: "Bảo trì",
};
const statusColors = {
  available: "bg-green-100 text-green-800",
  rented: "bg-red-100 text-red-800",
  maintenance: "bg-gray-100 text-gray-800",
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

  // Filters
  const [filterBuildingId, setFilterBuildingId] = useState<string>("");
  const [filterFloorId, setFilterFloorId] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [apts, blds, flrs] = await Promise.all([
        api.get<Apartment[]>("/apartments"),
        api.get<Building[]>("/buildings"),
        api.get<Floor[]>("/floors"),
      ]);
      setApartments(apts);
      setBuildings(blds);
      setFloors(flrs);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFloors = filterBuildingId
    ? floors.filter((f) => f.buildingId === Number(filterBuildingId))
    : floors;

  const filteredApartments = apartments.filter((a) => {
    if (filterFloorId && a.floorId !== Number(filterFloorId)) return false;
    if (filterBuildingId && !filteredFloors.some((f) => f.id === a.floorId))
      return false;
    return true;
  });

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
        await api.put(`/apartments/${editId}`, validation.data);
        toast.success("Cập nhật căn hộ thành công");
      } else {
        await api.post("/apartments", validation.data);
        toast.success("Thêm căn hộ thành công");
      }
      setDialogOpen(false);
      fetchData();
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
      toast.success("Xóa căn hộ thành công");
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/apartments/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý căn hộ</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm căn hộ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterBuildingId} onValueChange={(v) => { setFilterBuildingId(v === "all" ? "" : v); setFilterFloorId(""); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả tòa nhà" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tòa nhà</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterFloorId} onValueChange={(v) => setFilterFloorId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả tầng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tầng</SelectItem>
            {filteredFloors.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>Tầng {f.floorNumber}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách căn hộ ({filteredApartments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead className="text-right">Diện tích</TableHead>
                  <TableHead className="text-center">PN</TableHead>
                  <TableHead className="text-right">Giá thuê</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApartments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.code}</TableCell>
                    <TableCell>{getFloorLabel(apt.floorId)}</TableCell>
                    <TableCell className="text-right">{apt.area} m²</TableCell>
                    <TableCell className="text-center">{apt.numBedrooms ?? "-"}</TableCell>
                    <TableCell className="text-right">{formatVND(apt.rentalPrice)}</TableCell>
                    <TableCell className="text-center">
                      <Select value={apt.status} onValueChange={(v) => handleStatusChange(apt.id, v)}>
                        <SelectTrigger className="w-[140px] mx-auto border-none shadow-none justify-center gap-2">
                          <Badge className={statusColors[apt.status]}>{statusLabels[apt.status]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Còn trống</SelectItem>
                          <SelectItem value="rented">Đã thuê</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(apt)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(apt.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredApartments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Không có căn hộ nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa căn hộ" : "Thêm căn hộ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tầng *</Label>
              <Select value={form.floorId ? String(form.floorId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, floorId: Number(v) }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn tầng" /></SelectTrigger>
                <SelectContent>
                  {floors.map((f) => {
                    const b = buildings.find((b) => b.id === f.buildingId);
                    return (
                      <SelectItem key={f.id} value={String(f.id)}>
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
              Bạn có chắc muốn xóa căn hộ này? Hành động này không thể hoàn tác.
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
