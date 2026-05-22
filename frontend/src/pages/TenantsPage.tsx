import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { tenantSchema, validateForm, type TenantInput } from "@/lib/validators";
import { EmptyState, PageErrorState } from "@/components/PageFeedback";
import type { Tenant } from "@/types";
import { toast } from "sonner";
import {
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const emptyForm: TenantInput = {
  fullName: "",
  phone: "",
  email: "",
  idCard: "",
  address: "",
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TenantInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Search & Pagination States
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  const filteredTenants = tenants.filter((t) => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase().trim();
      const nameMatch = t.fullName.toLowerCase().includes(keyword);
      const phoneMatch = t.phone.toLowerCase().includes(keyword);
      const idCardMatch = t.idCard.toLowerCase().includes(keyword);
      if (!nameMatch && !phoneMatch && !idCardMatch) return false;
    }
    return true;
  });

  const totalItems = filteredTenants.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setPageError(null);
      setTenants(await api.get<Tenant[]>("/tenants"));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách người thuê";
      toast.error(message);
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditId(t.id);
    setForm({
      fullName: t.fullName,
      phone: t.phone || "",
      email: t.email || "",
      idCard: t.idCard,
      address: t.address || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = validateForm(tenantSchema, form);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updatedTenant = await api.put<Tenant>(`/tenants/${editId}`, validation.data);
        setTenants((current) =>
          current.map((tenant) => (tenant.id === editId ? updatedTenant : tenant)),
        );
        toast.success("Cập nhật thành công");
      } else {
        const createdTenant = await api.post<Tenant>("/tenants", validation.data);
        setTenants((current) => [...current, createdTenant]);
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
      await api.delete(`/tenants/${deleteId}`);
      setTenants((current) => current.filter((tenant) => tenant.id !== deleteId));
      toast.success("Xóa thành công");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      {pageError && (
        <PageErrorState
          compact
          title="Màn hình người thuê đang tải lỗi"
          description={pageError}
          onRetry={() => void fetchData()}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Quản lý người thuê</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm người thuê
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người thuê ({tenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            tenants.length === 0 ? (
              <EmptyState
                title="Chưa có người thuê"
                description="Hãy thêm hồ sơ người thuê để sẵn sàng cho luồng tạo hợp đồng và theo dõi cư dân."
              />
            ) : (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên, SĐT hoặc CCCD..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-9 rounded-md h-9"
                  />
                </div>

                {filteredTenants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground text-sm">Không tìm thấy người thuê nào phù hợp với từ khóa.</p>
                    <Button variant="link" onClick={() => setSearchKeyword("")} className="mt-1 text-xs text-primary">
                      Xóa bộ lọc
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-md border border-border">
                      <Table className="min-w-[840px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>SĐT</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>CCCD</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTenants.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium">{t.fullName}</TableCell>
                              <TableCell>{t.phone}</TableCell>
                              <TableCell>{t.email || "-"}</TableCell>
                              <TableCell>{t.idCard}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{t.address || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEdit(t)} className="rounded-md">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setDeleteId(t.id)} className="rounded-md">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                          Hiển thị {Math.min(filteredTenants.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredTenants.length, currentPage * pageSize)} trong tổng số {filteredTenants.length} người thuê
                        </p>
                        <Pagination className="w-auto m-0">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalPages }).map((_, idx) => {
                              const pageNum = idx + 1;
                              if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                Math.abs(currentPage - pageNum) <= 1
                              ) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      href="#"
                                      isActive={currentPage === pageNum}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(pageNum);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              if (
                                (pageNum === 2 && currentPage > 3) ||
                                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                              ) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                );
                              }
                              return null;
                            })}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa người thuê" : "Thêm người thuê"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Họ tên *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>SĐT *</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0901234567" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label>CCCD *</Label>
                <Input value={form.idCard} onChange={(e) => setForm((f) => ({ ...f, idCard: e.target.value }))} placeholder="079201001234" />
                {errors.idCard && <p className="text-sm text-destructive">{errors.idCard}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input value={form.address || ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
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
            <AlertDialogDescription>Bạn có chắc muốn xóa người thuê này?</AlertDialogDescription>
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
