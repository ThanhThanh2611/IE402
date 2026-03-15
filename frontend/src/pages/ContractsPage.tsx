import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { formatVND, formatDate } from "@/lib/hooks";
import { contractSchema, validateForm, type ContractInput } from "@/lib/validators";
import type { RentalContract, Apartment, Tenant } from "@/types";
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

const statusLabels = { active: "Đang hoạt động", expired: "Hết hạn", cancelled: "Đã hủy" };
const statusColors = {
  active: "bg-green-100 text-green-800",
  expired: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const emptyForm: ContractInput = {
  apartmentId: 0,
  tenantId: 0,
  startDate: "",
  endDate: "",
  monthlyRent: "",
  deposit: "",
  note: "",
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ContractInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a, t] = await Promise.all([
        api.get<RentalContract[]>("/contracts"),
        api.get<Apartment[]>("/apartments"),
        api.get<Tenant[]>("/tenants"),
      ]);
      setContracts(c);
      setApartments(a);
      setTenants(t);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getApartmentCode = (id: number) => apartments.find((a) => a.id === id)?.code || "";
  const getTenantName = (id: number) => tenants.find((t) => t.id === id)?.fullName || "";

  const availableApartments = apartments.filter(
    (a) => a.status === "available" || (editId && a.id === contracts.find((c) => c.id === editId)?.apartmentId),
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (c: RentalContract) => {
    setEditId(c.id);
    setForm({
      apartmentId: c.apartmentId,
      tenantId: c.tenantId,
      startDate: c.startDate,
      endDate: c.endDate,
      monthlyRent: c.monthlyRent,
      deposit: c.deposit || "",
      note: c.note || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = validateForm(contractSchema, form);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/contracts/${editId}`, validation.data);
        toast.success("Cập nhật hợp đồng thành công");
      } else {
        await api.post("/contracts", validation.data);
        toast.success("Thêm hợp đồng thành công");
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
      await api.delete(`/contracts/${deleteId}`);
      toast.success("Xóa hợp đồng thành công");
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  // Auto-fill rent when apartment selected
  const handleApartmentSelect = (aptId: string) => {
    const apt = apartments.find((a) => a.id === Number(aptId));
    setForm((f) => ({
      ...f,
      apartmentId: Number(aptId),
      monthlyRent: apt ? apt.rentalPrice : f.monthlyRent,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý hợp đồng</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm hợp đồng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hợp đồng ({contracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Căn hộ</TableHead>
                  <TableHead>Người thuê</TableHead>
                  <TableHead>Bắt đầu</TableHead>
                  <TableHead>Kết thúc</TableHead>
                  <TableHead className="text-right">Tiền thuê/tháng</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{getApartmentCode(c.apartmentId)}</TableCell>
                    <TableCell>{getTenantName(c.tenantId)}</TableCell>
                    <TableCell>{formatDate(c.startDate)}</TableCell>
                    <TableCell>{formatDate(c.endDate)}</TableCell>
                    <TableCell className="text-right">{formatVND(c.monthlyRent)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusColors[c.status]}>{statusLabels[c.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {contracts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Chưa có hợp đồng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa hợp đồng" : "Thêm hợp đồng"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Căn hộ *</Label>
                <Select value={form.apartmentId ? String(form.apartmentId) : ""} onValueChange={handleApartmentSelect}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Chọn căn hộ" /></SelectTrigger>
                  <SelectContent>
                    {availableApartments.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.apartmentId && <p className="text-sm text-destructive">{errors.apartmentId}</p>}
              </div>
              <div className="space-y-2">
                <Label>Người thuê *</Label>
                <Select value={form.tenantId ? String(form.tenantId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, tenantId: Number(v) }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Chọn người thuê" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.fullName} - {t.idCard}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tenantId && <p className="text-sm text-destructive">{errors.tenantId}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc *</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiền thuê/tháng (VND) *</Label>
                <Input type="number" value={form.monthlyRent} onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value }))} />
                {errors.monthlyRent && <p className="text-sm text-destructive">{errors.monthlyRent}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tiền cọc (VND)</Label>
                <Input type="number" value={form.deposit || ""} onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea value={form.note || ""} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa hợp đồng này? Căn hộ sẽ chuyển về trạng thái "Còn trống".
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
