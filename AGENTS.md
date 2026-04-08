# AGENTS.md

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
- **Database**: PostgreSQL + PostGIS (Docker, port 5434) — geometry PointZ cho tọa độ 3D
- **GIS libs**: `@turf/turf` (tính toán không gian), GeoJSON format (trao đổi dữ liệu bản đồ)
- **Navigation**: Mạng lưới topology (nodes & edges) cho tìm đường 3D (Dijkstra/A*)
- **File upload**: `multer` (upload mô hình 3D .glb/.gltf)
- **Ngôn ngữ**: TypeScript

### Frontend
- **Framework**: React 19
- **Build tool**: Vite 7
- **CSS**: Tailwind CSS v4 (CSS-first config, không có `tailwind.config.js`)
- **UI Library**: shadcn/ui v4 (style: `base-nova`, icon: `lucide`)
- **Font**: Geist Variable
- **Ngôn ngữ**: TypeScript

## Quy ước kỹ thuật

- 5 bảng sử dụng **soft delete** (`deleted_at`): users, apartments, tenants, rental_contracts, payments
- Tất cả API GET tự động lọc bỏ bản ghi đã xóa mềm (`isNull(deletedAt)`)
- Khi tạo hợp đồng → tự động set apartment status = `rented`
- Khi xóa hợp đồng → tự động set apartment status = `available`
- Geometry sử dụng **PointZ** (x, y, z) — z xác định cao độ/tầng cho tọa độ 3D
- Bảng `navigation_nodes` + `navigation_edges` mô hình hóa mạng lưới topology tòa nhà
- Mỗi căn hộ liên kết với `entry_node_id` (terminal node trong mạng navigation)
- Edges phân loại: `hallway` (cùng tầng), `stairs`/`elevator` (liên tầng)

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

## Quy ước Frontend

- **Không hardcode màu** — luôn dùng design token (`bg-primary`, `text-foreground`, ...)
- **Dùng shadcn component** trước khi tự viết
- **Component tự viết** đặt ở `src/components/`, không đặt trong `src/components/ui/` (thư mục đó dành cho shadcn)
- **Import component** từ barrel index: `import { Button, Card } from '@/components/ui'`
- **Merge class có điều kiện** dùng `cn()` từ `@/lib/utils`
- **Path alias**: `@/` trỏ tới `src/`
- Khi thêm shadcn component mới → cập nhật `src/components/ui/index.ts`

## Quản lý tiến độ

- Mỗi khi bắt đầu task mới, kiểm tra `implement-plan.md` và `todo.md` trước để xem còn tồn đọng gì không
- Nếu không còn tồn đọng thì update plan mới vào 2 file đó
- Sau khi hoàn thành task, đánh dấu `[x]` trong `todo.md` và `implement-plan.md`

## Tài liệu tham khảo

- `docs/BA.md` - Tài liệu phân tích nghiệp vụ (Use Case, DFD, Sequence Diagram)
- `docs/erd.dbml` - ERD định dạng DBML
- `docs/git-workflow.md` - Quy trình Git (branching, commit, PR, rebase)
- `docs/api/` - API documentation cho từng nhóm chức năng (bao gồm navigation API)
- `docs/frontend/` - Tài liệu frontend (setup, pages, từng nhóm chức năng, data models)
- `docs/user-guide/` - Hướng dẫn sử dụng theo vai trò (User, Manager)
