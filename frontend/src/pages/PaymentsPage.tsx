import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { formatVND, formatDate } from "@/lib/hooks";
import { paymentSchema, validateForm, type PaymentInput } from "@/lib/validators";
import { EmptyState, PageErrorState } from "@/components/PageFeedback";
import type { Payment, RentalContract, Apartment, Tenant } from "@/types";
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

const statusLabels = { pending: "Chờ thanh toán", paid: "Đã thanh toán", overdue: "Quá hạn" };
const statusColors = {
  pending: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  overdue: "bg-destructive/10 text-destructive border border-destructive/20",
};

const emptyForm: PaymentInput = {
  contractId: 0,
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  status: "pending",
  note: "",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PaymentInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setPageError(null);
      const [p, c, a, t] = await Promise.all([
        api.get<Payment[]>("/payments"),
        api.get<RentalContract[]>("/contracts"),
        api.get<Apartment[]>("/apartments"),
        api.get<Tenant[]>("/tenants"),
      ]);
      setPayments(p);
      setContracts(c);
      setApartments(a);
      setTenants(t);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách thanh toán";
      toast.error(message);
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getContractLabel = (contractId: number) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return "";
    const apt = apartments.find((a) => a.id === contract.apartmentId);
    const tenant = tenants.find((t) => t.id === contract.tenantId);
    return `${apt?.code || "?"} - ${tenant?.fullName || "?"}`;
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditId(p.id);
    setForm({
      contractId: p.contractId,
      amount: p.amount,
      paymentDate: p.paymentDate,
      status: p.status,
      note: p.note || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = validateForm(paymentSchema, form);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updatedPayment = await api.put<Payment>(`/payments/${editId}`, validation.data);
        setPayments((current) =>
          current.map((payment) => (payment.id === editId ? updatedPayment : payment)),
        );
        toast.success("Cập nhật thành công");
      } else {
        const createdPayment = await api.post<Payment>("/payments", validation.data);
        setPayments((current) => [...current, createdPayment]);
        toast.success("Thêm thành công");
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
      await api.delete(`/payments/${deleteId}`);
      setPayments((current) => current.filter((payment) => payment.id !== deleteId));
      toast.success("Xóa thành công");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  const handleContractSelect = (contractId: string | null) => {
    if (!contractId) return;
    const contract = contracts.find((c) => c.id === Number(contractId));
    setForm((f) => ({
      ...f,
      contractId: Number(contractId),
      amount: contract ? contract.monthlyRent : f.amount,
    }));
  };

  return (
    <div className="space-y-6">
      {pageError && (
        <PageErrorState
          compact
          title="Màn hình thanh toán đang tải lỗi"
          description={pageError}
          onRetry={() => void fetchData()}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm thanh toán
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thanh toán ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            payments.length === 0 ? (
              <EmptyState
                title="Chưa có thanh toán"
                description="Khi phát sinh giao dịch thuê nhà, các lần thanh toán sẽ xuất hiện ở đây để theo dõi công nợ."
              />
            ) : (
            <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Hợp đồng</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{getContractLabel(p.contractId)}</TableCell>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell className="text-right">{formatVND(p.amount)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusColors[p.status]}>{statusLabels[p.status]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{p.note || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa thanh toán" : "Thêm thanh toán"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hợp đồng *</Label>
              <Select value={form.contractId ? String(form.contractId) : ""} onValueChange={handleContractSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn hợp đồng">
                    {form.contractId ? getContractLabel(form.contractId) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {contracts.filter((c) => c.status === "active").map((c) => {
                    const apt = apartments.find((a) => a.id === c.apartmentId);
                    const tenant = tenants.find((t) => t.id === c.tenantId);
                    const label = `${apt?.code ?? "Căn hộ"} - ${tenant?.fullName ?? "Người thuê"}`;
                    return (
                      <SelectItem key={c.id} value={String(c.id)} label={label}>
                        {apt?.code} - {tenant?.fullName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.contractId && <p className="text-sm text-destructive">{errors.contractId}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Số tiền (VND) *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ngày thanh toán *</Label>
                <Input type="date" value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} />
                {errors.paymentDate && <p className="text-sm text-destructive">{errors.paymentDate}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái *</Label>
              <Select value={form.status} onValueChange={(v) => v && setForm((f) => ({ ...f, status: v as PaymentInput["status"] }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái">
                    {statusLabels[form.status]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogDescription>Bạn có chắc muốn xóa thanh toán này?</AlertDialogDescription>
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
