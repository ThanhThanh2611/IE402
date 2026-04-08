# Implementation Plan

## Phase 1: Foundation + Auth + Validation — DONE

### Backend
- [x] Database schema (Drizzle ORM + PostGIS)
- [x] API routes (buildings, apartments, contracts, tenants, payments, users, dashboard, auth, floors, status-history)
- [x] Seed data file (`backend/src/db/seed.ts`) — bcrypt hashed passwords
- [x] JWT authentication middleware (`backend/src/middleware/auth.ts`)
- [x] Role-based access control middleware (manager-only routes)
- [x] Bảo vệ các route cần auth (tất cả trừ login + health)
- [x] Hash password (bcrypt) trong auth + users route

### Frontend Setup
- [x] Vite + React 19 + TypeScript
- [x] Tailwind CSS v4 + shadcn/ui v4
- [x] 28 shadcn components installed
- [x] React Router + Recharts + Zod installed
- [x] TypeScript types/models (`src/types/index.ts`)
- [x] API service layer (`src/lib/api.ts`) — JWT interceptor, auto 401 redirect
- [x] Auth context/provider (`src/contexts/AuthContext.tsx`)
- [x] Protected route + Role guard (`src/components/ProtectedRoute.tsx`)
- [x] Form validation với zod (`src/lib/validators.ts`)
- [x] Custom hooks (`src/lib/hooks.ts`)
- [x] App layout with sidebar (`src/components/AppLayout.tsx`)
- [x] Coming Soon placeholder (`src/components/ComingSoon.tsx`)

### Frontend Pages (Non-GIS)
- [x] `/login` - Trang đăng nhập (zod validation, toast error)
- [x] `/dashboard` - Dashboard & Thống kê (stat cards, BarChart occupancy, LineChart revenue)
- [x] `/apartments` - Quản lý căn hộ (CRUD, filter building/floor, status change)
- [x] `/contracts` - Quản lý hợp đồng (CRUD, auto-fill rent from apartment)
- [x] `/tenants` - Quản lý người thuê (CRUD, SĐT/CCCD validation)
- [x] `/payments` - Quản lý thanh toán (CRUD, auto-fill amount from contract)
- [x] `/users` - Quản lý người dùng (CRUD, activate/deactivate toggle)

### GIS Placeholder
- [x] `/map` - Coming Soon
- [x] `/buildings/:id` - Coming Soon
- [x] `/buildings/:id/apartments/:apartmentId` - Coming Soon

## Phase 2: GIS & 3D
- [x] `/map` - Bản đồ GIS (Mapbox/Leaflet, markers, filters, popup, timeline snapshot)
- [x] `/buildings/:id` - Chi tiết tòa nhà + mô hình 3D (Three.js/React Three Fiber, upload model, click apartment popup)
- [ ] `/buildings/:id/apartments/:apartmentId` - Chi tiết căn hộ (linked from 3D view)

## Phase 2.5: Navigation & Topology
- [x] BE: Schema navigation_nodes + navigation_edges (PointZ geometry, node_type/edge_type enums)
- [x] BE: apartments.entry_node_id liên kết căn hộ với mạng lưới navigation
- [x] BE: Geometry chuyển từ Point → PointZ cho tọa độ 3D
- [x] BE: CRUD API routes cho navigation nodes/edges + graph query theo building
- [x] BE: Seed data — nodes (junction, elevator, stairs, door) + edges (hallway, liên tầng) cho 5 tòa nhà
- [x] FE: Types NavigationNode, NavigationEdge, BuildingGraph
- [x] Docs: Cập nhật ERD (DBML) với bảng navigation, enums mới

## Phase 3: Polish
- [x] Responsive design tuning
- [ ] Dark mode support
- [ ] Performance optimization (lazy loading, code splitting)
- [x] Error boundaries + 404 page
- [ ] E2E testing

## Phase 2.6: BA / ERD Alignment
- [x] Làm rõ tách biệt `users` (tài khoản hệ thống) và `tenants` (khách thuê nghiệp vụ)
- [x] Bổ sung lớp dữ liệu indoor space cho căn hộ theo hướng LoD4
- [x] Bổ sung thư viện nội thất, layout nội thất và item nội thất đã đặt
- [x] Bổ sung access grant theo căn hộ để kiểm soát quyền xem tenant/hợp đồng theo ngữ cảnh
- [x] Mở rộng GIS 3D với `buildings.footprint`, `floors.floor_plan`, `floors.elevation`, `floors.model_3d_url`
- [x] Cập nhật tài liệu ERD (`docs/erd.dbml`, `docs/erd.md`) theo schema mới
- [x] BE: Mở rộng API căn hộ với dữ liệu indoor space, furniture layouts, furniture items
- [x] FE: Triển khai trang chi tiết căn hộ để xem/chỉnh sửa không gian và bố cục nội thất
- [x] BE: Dọn lịch sử migration cũ và generate lại một migration Drizzle sạch từ schema hiện tại
- [x] Docs: Đồng bộ lại toàn bộ tài liệu Frontend theo route, auth flow, GeoJSON và quyền truy cập mới
- [x] Docs: Viết lại `docs/user-guide/` theo đúng route và quyền hiện tại của User/Manager
- [x] Docs: Tạo `docs/usecase-status.md` để đối chiếu từng UC giữa BA, Backend và Frontend
- [x] Tests: Thiết lập unit test cho Backend và Frontend, kèm bộ test lõi có thể chạy được
- [x] Docs: Tạo tài liệu PM summary để ưu tiên backlog và chia việc cho team
- [x] FE+BE: Hoàn thiện UC24 time series data trên dashboard với bộ lọc ngày và biểu đồ lịch sử lấp đầy
- [x] FE+BE: Chuyển auth sang access token + refresh token, có session revoke ở backend
- [x] FE: Bổ sung snapshot occupancy theo mốc thời gian ngay trên dashboard
- [x] FE: Bổ sung UI manager quản lý access grant theo từng căn hộ
- [x] Tests: Mở rộng route test BE và component/page test FE cho error handling, dashboard, 404
- [x] FE: Fix lỗi trang trắng lúc khởi động do toast/theme và dữ liệu auth localStorage không an toàn
- [x] FE: Fix chọn tầng ở trang chi tiết tòa nhà khi đổi tòa hoặc bấm vào danh sách tầng
- [x] FE+BE: Fix kéo thả nội thất và chuẩn hóa hiển thị vị trí geometry về dạng dễ đọc
- [x] FE: Render boundary không gian LoD4 trực tiếp trên workspace kéo thả và tự gắn item vào space phù hợp
- [x] FE: Chuẩn hóa hành vi button để không submit/reload ngoài ý muốn và thay reload cứng bằng retry SPA
- [x] FE: Giảm reload dữ liệu sau CRUD ở các trang quản trị chính bằng cập nhật state cục bộ
- [x] FE+BE: Hỗ trợ hotspot local cho model tầng, chuyển tầng bằng thang máy/cầu thang và thêm mode 3D tổng quan quanh tòa nhà
- [x] FE+BE: Reset DB sạch, seed lại local hotspot mẫu cho building 5 và thêm UI manager chỉnh local hotspot ngay trên trang tòa nhà
- [x] BE: Nới giới hạn upload model 3D và trả lỗi Multer thân thiện khi file vượt quá dung lượng cho phép
- [x] FE+BE: Thêm upload model 3D riêng cho từng tầng để floor mode không còn phụ thuộc vào model tổng quan của building
- [x] FE: Fix input upload model tầng để đổi tầng xong vẫn chọn lại file và upload tiếp được
- [x] Docs: Viết hướng dẫn kỹ thuật chuẩn bị floor model, hotspot local và workflow Blender cho màn `/buildings/:id`
- [x] FE: Bổ sung UI tạo hotspot mới và chọn `node type` trực tiếp trên trang chi tiết tòa nhà
