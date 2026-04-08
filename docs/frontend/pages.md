# Danh sách trang và Routing

## Tổng quan

Ứng dụng chia làm 2 layout chính:
- **Public layout**: Trang đăng nhập (không cần sidebar)
- **App layout**: Các trang chính (có sidebar + header)

## Cấu trúc routing

| Route | Trang | Actor | UC liên quan |
|---|---|---|---|
| `/login` | Đăng nhập | Tất cả | — |
| `/map` | Bản đồ GIS | User, Manager | UC01-05 |
| `/dashboard` | Dashboard & thống kê | User, Manager | UC22-25 |
| `/buildings/:id` | Chi tiết tòa nhà + mô hình 3D | User, Manager | UC06-09 |
| `/buildings/:id/apartments/:apartmentId` | Chi tiết căn hộ | User, Manager | UC10-13 |
| `/apartments` | Quản lý căn hộ (danh sách) | Manager | UC14-17 |
| `/contracts` | Quản lý hợp đồng thuê | Manager | UC18-21 |
| `/tenants` | Quản lý người thuê | Manager | — |
| `/payments` | Quản lý thanh toán | Manager | — |
| `/users` | Quản lý người dùng | Manager | UC26-31 |
| `*` | Trang 404 | Tất cả | Fallback route |

## Sidebar (App layout)

Sidebar cố định bên trái, nền tối (`bg-sidebar`), chữ trắng (`text-sidebar-foreground`), mục active màu vàng gold (`text-sidebar-primary`).

### Menu items

```
Bản đồ             /map           (icon: Map)
Dashboard          /dashboard     (icon: LayoutDashboard)

--- Quản lý ---    (chỉ hiện khi role = manager)
Căn hộ             /apartments    (icon: Building2)
Hợp đồng           /contracts     (icon: FileText)
Người thuê         /tenants       (icon: Users)
Thanh toán         /payments      (icon: CreditCard)
Người dùng         /users         (icon: UserCog)
```

## Phân quyền

- Các route `/apartments`, `/contracts`, `/tenants`, `/payments`, `/users` chỉ dành cho **Manager**
- Nếu User (role=user) truy cập route manager → redirect về `/dashboard`
- Kiểm tra quyền dựa trên field `role` của user đang đăng nhập
- Hệ thống **không có trang đăng ký** — tài khoản do Manager tạo tại `/users`
- Route `/buildings/:id/apartments/:apartmentId` mở cho cả `User` và `Manager`, nhưng dữ liệu tenant/hợp đồng hiển thị theo quyền mà backend trả về

## Error Handling

- FE hiện có `AppErrorBoundary` bọc toàn ứng dụng để chặn lỗi render ngoài ý muốn
- Khi route không tồn tại, hệ thống hiển thị trang `404` thay vì redirect âm thầm
- Các màn hình chính như dashboard, map, building detail và nhóm CRUD manager có state lỗi thân thiện kèm nút thử lại
