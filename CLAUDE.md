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
- **Database**: PostgreSQL + PostGIS
- **GIS libs**: `@turf/turf` (tính toán không gian), GeoJSON format (trao đổi dữ liệu bản đồ)
- **File upload**: `multer` (upload mô hình 3D .glb/.gltf)
- **Ngôn ngữ**: TypeScript/JavaScript

### Frontend
- **Framework**: React
- **CSS**: Tailwind CSS v3

## Mô tả nghiệp vụ

Hệ thống gồm 2 actors chính:
- **User**: Xem bản đồ, thông tin tòa nhà, căn hộ, thống kê
- **Manager**: Quản lý căn hộ, hợp đồng thuê, cập nhật trạng thái dữ liệu

### Các nhóm chức năng
1. **Bản đồ GIS**: Hiển thị bản đồ thành phố, vị trí tòa nhà, lọc, tỷ lệ lấp đầy
2. **Mô hình 3D tòa nhà**: Hiển thị 3D, xem tầng/căn hộ, zoom/rotate
3. **Thông tin căn hộ**: Chi tiết, trạng thái, giá thuê, thông tin người thuê
4. **Quản lý căn hộ** (Manager): CRUD căn hộ, cập nhật trạng thái
5. **Quản lý hợp đồng thuê** (Manager): CRUD hợp đồng
6. **Dashboard & Thống kê**: Tỷ lệ lấp đầy, doanh thu, dữ liệu time series

## Tài liệu tham khảo

- `docs/BA.md` - Tài liệu phân tích nghiệp vụ (Use Case, DFD, Sequence Diagram)
- `docs/erd.dbml` - ERD định dạng DBML
