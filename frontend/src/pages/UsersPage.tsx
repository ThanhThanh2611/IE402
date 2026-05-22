import { useState, useEffect, useCallback, useMemo } from "react";
import { api, ApiError } from "@/lib/api";
import { userSchema, userUpdateSchema, validateForm, type UserInput, type UserUpdateInput } from "@/lib/validators";
import { EmptyState, PageErrorState } from "@/components/PageFeedback";
import type { User } from "@/types";
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
  Skeleton,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui";
import { Plus, Pencil, Trash2, UserCheck, UserX, Search, RotateCcw } from "lucide-react";

const emptyForm: UserInput = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  role: "user",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Filters & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const username = u.username?.toLowerCase() || "";
        const fullName = u.fullName?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        return username.includes(query) || fullName.includes(query) || email.includes(query);
      }
      return true;
    });
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setPageError(null);
      setUsers(await api.get<User[]>("/users"));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách người dùng";
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

  const openEdit = (u: User) => {
    setEditId(u.id);
    setForm({
      username: u.username,
      password: "",
      fullName: u.fullName,
      email: u.email || "",
      role: u.role,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const schema = editId ? userUpdateSchema : userSchema;
    const data = editId ? { username: form.username, fullName: form.fullName, email: form.email, role: form.role } : form;
    const validation = editId
      ? validateForm<UserUpdateInput>(schema as typeof userUpdateSchema, data)
      : validateForm<UserInput>(schema as typeof userSchema, data);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updatedUser = await api.put<User>(`/users/${editId}`, validation.data);
        setUsers((current) => current.map((user) => (user.id === editId ? updatedUser : user)));
        toast.success("Cập nhật thành công");
      } else {
        const createdUser = await api.post<User>("/users", validation.data);
        setUsers((current) => [...current, createdUser]);
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
      await api.delete(`/users/${deleteId}`);
      setUsers((current) => current.filter((user) => user.id !== deleteId));
      toast.success("Xóa thành công");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  const toggleActive = async (user: User) => {
    try {
      const endpoint = user.isActive
        ? `/users/${user.id}/deactivate`
        : `/users/${user.id}/activate`;
      const updatedUser = await api.patch<User>(endpoint);
      setUsers((current) => current.map((entry) => (entry.id === user.id ? updatedUser : entry)));
      toast.success(user.isActive ? "Đã vô hiệu hóa" : "Đã kích hoạt");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      {pageError && (
        <PageErrorState
          compact
          title="Màn hình người dùng đang tải lỗi"
          description={pageError}
          onRetry={() => void fetchData()}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo username, họ tên hoặc email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                Đặt lại
              </Button>
            )}
          </div>

          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : users.length === 0 ? (
            <EmptyState
              title="Chưa có người dùng"
              description="Manager có thể tạo tài khoản mới tại đây để cấp quyền truy cập hệ thống."
            />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title="Không tìm thấy người dùng"
              description="Không tìm thấy bản ghi người dùng nào khớp với từ khóa tìm kiếm của bạn."
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border border-border">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Vai trò</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>{u.fullName}</TableCell>
                        <TableCell>{u.email || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={u.role === "manager" ? "default" : "secondary"}>
                            {u.role === "manager" ? "Manager" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={u.isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}>
                            {u.isActive ? "Hoạt động" : "Vô hiệu"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(u)}
                              title={u.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                            >
                              {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDeleteId(u.id)}>
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
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                    {Math.min(currentPage * pageSize, filteredUsers.length)} trong tổng số{" "}
                    {filteredUsers.length} kết quả
                  </p>
                  <Pagination className="w-auto m-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        if (
                          page === 2 ||
                          page === totalPages - 1
                        ) {
                          return (
                            <PaginationItem key={page}>
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
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa người dùng" : "Thêm người dùng"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            </div>
            {!editId && (
              <div className="space-y-2">
                <Label>Mật khẩu *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Họ tên *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Vai trò *</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as "user" | "manager" }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn vai trò">
                    {form.role === "manager" ? "Manager" : "User"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogDescription>Bạn có chắc muốn xóa người dùng này?</AlertDialogDescription>
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
