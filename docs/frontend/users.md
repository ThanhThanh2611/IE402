# Quản lý người dùng

Use Cases: UC26-31 - Chỉ Manager

## Trang quản lý người dùng (`/users`)

Route này chỉ dành cho manager và được bảo vệ ở FE bằng `ManagerRoute`.

## 1. Danh sách người dùng

- **API**: `GET /api/users`
- Hiển thị dạng bảng

### Cột chính

| Cột | Field |
|---|---|
| Tên đăng nhập | `username` |
| Họ tên | `fullName` |
| Email | `email` |
| Vai trò | `role` |
| Trạng thái | `isActive` |
| Hành động | sửa, xóa, kích hoạt, vô hiệu hóa |

### Mapping hiển thị

| Giá trị | Label |
|---|---|
| `user` | Người dùng |
| `manager` | Quản lý |

| Giá trị | Label trạng thái |
|---|---|
| `true` | Đang hoạt động |
| `false` | Đã vô hiệu hóa |

## 2. Thêm người dùng

- **API**: `POST /api/users`
- FE mở dialog để nhập:

| Trường | Field | Bắt buộc |
|---|---|---|
| Tên đăng nhập | `username` | Có |
| Mật khẩu | `password` | Có |
| Họ tên | `fullName` | Có |
| Email | `email` | Không |
| Vai trò | `role` | Có |

## 3. Sửa người dùng

- **API**: `PUT /api/users/:id`
- FE mở dialog với dữ liệu đã có sẵn
- Luồng sửa hiện tập trung vào thông tin tài khoản, không phải màn đổi mật khẩu riêng

## 4. Xóa mềm

- **API**: `DELETE /api/users/:id`
- Backend dùng soft delete

## 5. Kích hoạt và vô hiệu hóa

- `PATCH /api/users/:id/activate`
- `PATCH /api/users/:id/deactivate`

FE hiển thị nút hành động theo trạng thái hiện tại của user:
- nếu đang active thì hiện `Vô hiệu hóa`
- nếu đang inactive thì hiện `Kích hoạt`

## 6. Liên hệ với tenant

Schema backend hiện tách `users` và `tenants`. Trang `/users` chỉ quản lý tài khoản hệ thống, không phải danh sách khách thuê. Những liên kết như `tenants.linked_user_id` được xử lý ở backend và các màn hình tenant/apartment, không thao tác trực tiếp trong trang user management.
