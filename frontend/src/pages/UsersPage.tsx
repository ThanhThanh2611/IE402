import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { userSchema, userUpdateSchema, validateForm, type UserInput, type UserUpdateInput } from "@/lib/validators";
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
} from "@/components/ui";
import { Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";

const emptyForm = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  role: "user" as const,
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await api.get<User[]>("/users"));
    } catch {
      toast.error("Lỗi tải dữ liệu");
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
        await api.put(`/users/${editId}`, validation.data);
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/users", validation.data);
        toast.success("Thêm thành công");
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
      await api.delete(`/users/${deleteId}`);
      toast.success("Xóa thành công");
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  const toggleActive = async (user: User) => {
    try {
      const endpoint = user.isActive
        ? `/users/${user.id}/deactivate`
        : `/users/${user.id}/activate`;
      await api.patch(endpoint);
      toast.success(user.isActive ? "Đã vô hiệu hóa" : "Đã kích hoạt");
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="overflow-x-auto">
            <Table>
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
                {users.map((u) => (
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
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Chưa có người dùng
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
