# Tài liệu Frontend

Tài liệu dành cho team Frontend và UI/UX của hệ thống **3D GIS Apartment Management System**.

## Mục lục

| File | Nội dung |
|---|---|
| [setup.md](./setup.md) | Hướng dẫn cài đặt, chạy dự án, shadcn/ui, bảng màu |
| [pages.md](./pages.md) | Danh sách trang và cấu trúc routing |
| [map-gis.md](./map-gis.md) | Trang bản đồ GIS và mô hình 3D (UC01-09) |
| [apartments.md](./apartments.md) | Quản lý căn hộ (UC10-17) |
| [contracts.md](./contracts.md) | Quản lý hợp đồng thuê (UC18-21) |
| [dashboard.md](./dashboard.md) | Dashboard và thống kê (UC22-25) |
| [users.md](./users.md) | Quản lý người dùng (UC26-31) |
| [auth.md](./auth.md) | Đăng nhập, đăng ký |
| [data-models.md](./data-models.md) | Kiểu dữ liệu TypeScript, enum, trạng thái |

## Actors

| Actor | Mô tả | Quyền |
|---|---|---|
| **User** | Người dùng thông thường | Xem bản đồ, thông tin tòa nhà, căn hộ, thống kê |
| **Manager** | Quản lý hệ thống | Toàn bộ quyền User + CRUD căn hộ, hợp đồng, người dùng |

## Ngôn ngữ

Giao diện chỉ hỗ trợ **tiếng Việt**, không cần i18n.
