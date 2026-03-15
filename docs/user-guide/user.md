# Hướng dẫn sử dụng — Vai trò User

## Tổng quan

User là người dùng thường, có quyền **xem** thông tin nhưng **không** có quyền thêm/sửa/xóa dữ liệu.

## Các chức năng

### 1. Đăng nhập (`/login`)
- Nhập username và mật khẩu → nhấn **Đăng nhập**
- Sau khi đăng nhập, hệ thống chuyển tới Dashboard
- Nếu tài khoản bị vô hiệu hóa sẽ nhận thông báo lỗi

### 2. Dashboard (`/dashboard`)
- **Stat cards**: Xem tổng số tòa nhà, căn hộ, đã cho thuê, hợp đồng đang hoạt động
- **Biểu đồ tỷ lệ lấp đầy**: Bar chart ngang hiển thị % lấp đầy từng tòa nhà
- **Biểu đồ doanh thu**: Line chart doanh thu theo tháng trong năm hiện tại
- **Thanh tiến trình**: Tỷ lệ lấp đầy tổng thể

### 3. Bản đồ GIS (`/map`) *(sắp ra mắt)*
- Xem bản đồ thành phố với vị trí các tòa nhà
- Lọc theo quận, phường, giá thuê
- Click tòa nhà để xem chi tiết
- Xem tỷ lệ lấp đầy trên marker

### 4. Chi tiết tòa nhà (`/buildings/:id`) *(sắp ra mắt)*
- Xem mô hình 3D tòa nhà
- Danh sách tầng bên trái
- Click tầng → xem các căn hộ
- Zoom, xoay, pan mô hình 3D

### 5. Chi tiết căn hộ (`/buildings/:id/apartments/:apartmentId`) *(sắp ra mắt)*
- Xem thông tin chi tiết: mã, diện tích, phòng ngủ, giá thuê, trạng thái
- Nếu đã cho thuê → xem thông tin người thuê

## Sidebar menu

User chỉ thấy 2 mục:
- **Bản đồ** — Trang bản đồ GIS
- **Dashboard** — Tổng quan & thống kê

Các mục quản lý (Căn hộ, Hợp đồng, Người thuê, Thanh toán, Người dùng) **không hiển thị** cho User.

## Mối liên hệ chức năng

```
Bản đồ GIS → Click tòa nhà → Chi tiết tòa nhà + 3D → Click căn hộ → Chi tiết căn hộ
Dashboard  → Xem thống kê tổng quan, biểu đồ
```
