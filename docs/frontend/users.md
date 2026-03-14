# Quản lý người dùng

Use Cases: UC26-31 — Chỉ Manager

## Trang quản lý người dùng (`/users`)

### UC26 — Danh sách người dùng

- **API**: `GET /api/users`
- Hiển thị dạng bảng

#### Cột bảng

| Cột | Field | Ghi chú |
|---|---|---|
| Tên đăng nhập | `username` | |
| Họ tên | `fullName` | |
| Email | `email` | |
| Vai trò | `role` | Badge |
| Trạng thái | `isActive` | Badge |
| Hành động | — | Sửa, Xóa, Kích hoạt/Vô hiệu hóa |

#### Badge vai trò

| Giá trị | Label tiếng Việt |
|---|---|
| `user` | Người dùng |
| `manager` | Quản lý |

#### Badge trạng thái

| Giá trị | Label tiếng Việt | Badge |
|---|---|---|
| `true` | Đang hoạt động | Xanh lá |
| `false` | Đã vô hiệu hóa | Xám |

---

### UC27 — Thêm người dùng

- Nút "Thêm người dùng" → mở Dialog
- **API**: `POST /api/users`

#### Form fields

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Tên đăng nhập | Input text (`username`) | Có | Unique |
| Mật khẩu | Input password (`password`) | Có | |
| Họ tên | Input text (`fullName`) | Có | |
| Email | Input email (`email`) | Không | Unique nếu có |
| Vai trò | Select (`role`) | Có | `user` hoặc `manager` |

---

### UC28 — Sửa thông tin người dùng

- Click "Sửa" → Dialog với dữ liệu fill sẵn
- **API**: `PUT /api/users/:id`
- Form fields giống thêm (trừ mật khẩu — chỉ nhập khi muốn đổi)

---

### UC29 — Xóa người dùng

- Click "Xóa" → AlertDialog xác nhận
- Nội dung: "Bạn có chắc muốn xóa người dùng [username]?"
- **API**: `DELETE /api/users/:id` (soft delete)

---

### UC30 — Kích hoạt tài khoản

- Chỉ hiện khi `isActive = false`
- Click nút "Kích hoạt" → gọi API
- **API**: `PATCH /api/users/:id/activate`
- Toast: "Đã kích hoạt tài khoản [username]"

---

### UC31 — Vô hiệu hóa tài khoản

- Chỉ hiện khi `isActive = true`
- Click nút "Vô hiệu hóa" → AlertDialog xác nhận
- Nội dung: "Người dùng [username] sẽ không thể đăng nhập. Tiếp tục?"
- **API**: `PATCH /api/users/:id/deactivate`
- Toast: "Đã vô hiệu hóa tài khoản [username]"
