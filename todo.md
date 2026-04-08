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
- [ ] FE: Dark mode support
- [ ] FE: E2E test cho luồng chính

## BA / ERD Alignment
- [x] BE: Làm rõ quan hệ giữa `users` và `tenants` trong schema
- [x] BE: Thêm mô hình không gian trong căn hộ (`apartment_spaces`) cho LoD4
- [x] BE: Thêm schema thư viện nội thất, layout và furniture items cho kéo-thả
- [x] BE: Thêm `apartment_access_grants` để phân quyền xem tenant/hợp đồng theo từng căn hộ
- [x] BE: Mở rộng GIS 3D với `buildings.footprint`, `floors.floor_plan`, `floors.elevation`, `floors.model_3d_url`
- [x] Docs: Cập nhật `docs/erd.dbml` và `docs/erd.md` theo BA mới
- [x] BE: Thêm API `/apartments/:id/details`, CRUD spaces, layouts, items
- [x] FE: Thay `ApartmentDetailPage` placeholder bằng UI chi tiết căn hộ LoD4
- [x] BE: Xóa migration Drizzle cũ và tạo lại 1 migration sạch từ schema hiện tại
- [x] Docs FE: Viết lại tài liệu `docs/frontend/` cho khớp FE và BE hiện tại
- [x] Docs User Guide: Viết lại `docs/user-guide/` theo quyền và màn hình thực tế
- [x] Docs: Tạo `docs/usecase-status.md` liệt kê trạng thái từng use case
- [x] Tests: Thêm unit test cho BE và FE, chạy pass thực tế
- [x] Docs: Viết `docs/pm-summary.md` cho PM non-tech theo dõi backlog và ưu tiên
- [x] FE+BE: Cải thiện time series data trên dashboard
- [x] FE+BE: Chuyển sang access token + refresh token
- [x] FE: Thêm snapshot occupancy trực tiếp trên dashboard
- [x] FE: Thêm UI access grant cho manager trong trang chi tiết căn hộ
- [x] FE: Thêm error boundary, trang 404 và state lỗi thân thiện cho các màn hình chính
- [x] FE: Tối ưu responsive cho dashboard, map, building 3D và các trang bảng lớn
- [x] Tests: Mở rộng route test backend và component/page test frontend
- [x] FE: Fix lỗi trang trắng khi app mount do Toaster/Auth bootstrap
- [x] FE: Fix không chọn được tầng ổn định ở trang chi tiết tòa nhà
- [x] FE+BE: Fix item nội thất bị dồn góc trái trên do geometry trả về sai format
- [x] FE: Vẽ boundary LoD4 trên workspace và tự gắn item vào không gian khi kéo thả
- [x] FE: Chặn button submit/reload ngoài ý muốn và chuyển retry/navigation về SPA flow
- [x] FE: Bỏ reload toàn bảng sau CRUD ở các màn quản trị chính, chuyển sang cập nhật state tại chỗ
- [x] FE+BE: Thêm support model tầng với hotspot local, bấm door/elevator/stairs và nút 3D tổng quan tòa nhà
- [x] FE+BE: Reset DB sạch, seed hotspot local mẫu cho building 5 và thêm UI sửa local x/y/z, meshRef ngay trên màn hình
- [x] BE: Tăng giới hạn upload `.glb/.gltf` và trả lỗi upload file quá lớn theo dạng dễ hiểu
- [x] FE+BE: Thêm upload model 3D riêng cho tầng để `floors.model3dUrl` có thể được gán ngay từ UI
- [x] FE: Fix input upload model tầng để không bị disable sai sau khi đổi tầng hoặc chọn lại cùng file
- [x] Docs: Thêm file hướng dẫn workflow model tầng, hotspot local và cách lấy local X/Y/Z từ Blender
- [x] FE: Thêm nút tạo hotspot và cho chỉnh `node type` ngay trong dialog hotspot ở trang tòa nhà
