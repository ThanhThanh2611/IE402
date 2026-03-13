# CLAUDE.md

## Thông tin dự án

Đây là dự án **3D GIS Apartment Management System** - Hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS 3D.

## Quy tắc giao tiếp

- Luôn trả lời bằng **tiếng Việt**
- Luôn đọc folder `docs/` khi làm task để nắm ngữ cảnh nghiệp vụ

## Cấu trúc dự án

Repo này chứa cả **Frontend** và **Backend** (monorepo).

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Drizzle ORM + `drizzle-postgis` (spatial query)
- **Database**: PostgreSQL + PostGIS (Docker, port 5434)
- **GIS libs**: `@turf/turf` (tính toán không gian), GeoJSON format (trao đổi dữ liệu bản đồ)
- **File upload**: `multer` (upload mô hình 3D .glb/.gltf)
- **Ngôn ngữ**: TypeScript

### Frontend
- **Framework**: React
- **CSS**: Tailwind CSS v3

## Quy ước kỹ thuật

- 5 bảng sử dụng **soft delete** (`deleted_at`): users, apartments, tenants, rental_contracts, payments
- Tất cả API GET tự động lọc bỏ bản ghi đã xóa mềm (`isNull(deletedAt)`)
- Khi tạo hợp đồng → tự động set apartment status = `rented`
- Khi xóa hợp đồng → tự động set apartment status = `available`

## Mô tả nghiệp vụ

Hệ thống gồm 2 actors chính:
- **User**: Xem bản đồ, thông tin tòa nhà, căn hộ, thống kê
- **Manager**: Quản lý căn hộ, hợp đồng thuê, người dùng, cập nhật trạng thái dữ liệu

### Các nhóm chức năng (31 Use Cases)
1. **Bản đồ GIS** (UC01-05): Hiển thị bản đồ, vị trí tòa nhà, lọc, tỷ lệ lấp đầy, chọn tòa nhà
2. **Mô hình 3D tòa nhà** (UC06-09): Hiển thị 3D, xem tầng/căn hộ, zoom/rotate
3. **Thông tin căn hộ** (UC10-13): Chi tiết, trạng thái, giá thuê, thông tin người thuê
4. **Quản lý căn hộ** (UC14-17): CRUD căn hộ, cập nhật trạng thái
5. **Quản lý hợp đồng thuê** (UC18-21): CRUD hợp đồng
6. **Dashboard & Thống kê** (UC22-25): Tổng quan, tỷ lệ lấp đầy, doanh thu, time series
7. **Quản lý người dùng** (UC26-31): Xem danh sách, thêm, sửa, xóa, kích hoạt, vô hiệu hóa user

## Tài liệu tham khảo

- `docs/BA.md` - Tài liệu phân tích nghiệp vụ (Use Case, DFD, Sequence Diagram)
- `docs/erd.dbml` - ERD định dạng DBML
- `docs/api/` - API documentation cho từng nhóm chức năng
