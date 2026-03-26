# TODO

## Done
- [x] BE: Tạo file seed data (`backend/src/db/seed.ts`) — hash password với bcrypt
- [x] FE: Install dependencies (react-router-dom, recharts, zod)
- [x] BE: JWT auth middleware + hash password (bcrypt)
- [x] BE: Role-based middleware (manager-only routes)
- [x] FE: Tạo types/models (`src/types/index.ts`)
- [x] FE: Tạo API service layer (`src/lib/api.ts`) — có JWT interceptor, auto redirect 401
- [x] FE: Auth context/provider (`src/contexts/AuthContext.tsx`)
- [x] FE: Protected route + role guard (`src/components/ProtectedRoute.tsx`)
- [x] FE: Form validation với zod (`src/lib/validators.ts`)
- [x] FE: Custom hooks (useApiQuery, useApiMutation, formatVND, formatDate)
- [x] FE: Tạo AppLayout + Sidebar (có role-based menu, active state highlight)
- [x] FE: Tạo ComingSoon component
- [x] FE: Setup routing (App.tsx) với protected routes
- [x] FE: Trang Login (form validation, error feedback)
- [x] FE: Trang Dashboard (stat cards + biểu đồ occupancy + revenue)
- [x] FE: Trang Quản lý căn hộ (CRUD + filter + status change)
- [x] FE: Trang Quản lý hợp đồng (CRUD + auto-fill rent)
- [x] FE: Trang Quản lý người thuê (CRUD + validation SĐT/CCCD)
- [x] FE: Trang Quản lý thanh toán (CRUD + auto-fill amount)
- [x] FE: Trang Quản lý người dùng (CRUD + activate/deactivate)
- [x] FE: Trang GIS/3D hiển thị Coming Soon
- [x] BE: Update auth route (JWT + bcrypt)
- [x] BE: Update users route (hash password khi tạo user)
- [x] BE: Gắn auth middleware vào index.ts
- [x] FE: Fix sidebar icon + text alignment (dùng render prop thay asChild)
- [x] FE: Fix sidebar active state highlight (dùng useLocation)
- [x] FE: Fix Select width trong dialogs (w-full)
- [x] FE: Fix status select hiện text tiếng Anh → hiện tiếng Việt
- [x] FE: Fix dialog width (sm:max-w-lg)
- [x] FE: Fix table responsive (overflow-x-auto)
- [x] FE: Fix status badge-in-select styling (border-none, shadow-none)
- [x] Docs: Tạo hướng dẫn sử dụng theo vai trò (docs/user-guide/)
- [x] Docs: Cập nhật README.md (hướng dẫn chạy, seed, auth, scripts)
- [x] FE: Tích hợp Leaflet cho bản đồ GIS (UC01-05)
- [x] FE: Thêm timeline map snapshot theo thời gian (UC25)
- [x] BE: File upload endpoint cho model 3D (.glb/.gltf)
- [x] FE: Tích hợp Three.js + React Three Fiber cho mô hình 3D tòa nhà
- [x] FE: Click mesh căn hộ 3D -> gọi API -> render popup diện tích/giá/hợp đồng

## Navigation / Topology
- [x] BE: Schema navigation_nodes, navigation_edges, enums node_type/edge_type
- [x] BE: Apartments thêm entry_node_id liên kết navigation
- [x] BE: Geometry chuyển từ Point → PointZ (3D)
- [x] BE: API routes CRUD navigation nodes/edges + graph query
- [x] BE: Seed data navigation nodes, edges, liên kết apartments
- [x] FE: Types NavigationNode, NavigationEdge, BuildingGraph
- [x] Docs: Cập nhật ERD (DBML) với bảng navigation mới

## Backlog
- [ ] FE+BE: Error boundaries + 404 page
- [ ] FE: Responsive design tuning
- [ ] FE: Dark mode support
