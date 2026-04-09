# Tài liệu Frontend

Tài liệu dành cho team Frontend và UI/UX của hệ thống **3D GIS Apartment Management System**.

## Mục lục

| File | Nội dung |
|---|---|
| [setup.md](./setup.md) | Hướng dẫn cài đặt, chạy dự án, shadcn/ui, bảng màu |
| [pages.md](./pages.md) | Danh sách trang và cấu trúc routing |
| [map-gis.md](./map-gis.md) | Trang bản đồ GIS và mô hình 3D (UC01-09) |
| [apartments.md](./apartments.md) | Quản lý căn hộ (UC10-17) |
| [../user-guide/building-apartment-3d-2d-guide.md](D:\Workspace\IE402\docs\user-guide\building-apartment-3d-2d-guide.md) | Hướng dẫn thao tác chi tiết màn 3D/2D của tòa nhà và căn hộ |
| [contracts.md](./contracts.md) | Quản lý hợp đồng thuê (UC18-21) |
| [dashboard.md](./dashboard.md) | Dashboard và thống kê (UC22-25) |
| [users.md](./users.md) | Quản lý người dùng (UC26-31) |
| [auth.md](./auth.md) | Đăng nhập, AuthContext, route protection |
| [data-models.md](./data-models.md) | Kiểu dữ liệu TypeScript, enum, trạng thái |

## Actors

| Actor | Mô tả | Quyền |
|---|---|---|
| **User** | Người dùng thông thường | Xem dashboard, bản đồ, mô hình 3D, chi tiết căn hộ theo quyền |
| **Manager** | Quản lý hệ thống | Toàn bộ quyền User + CRUD quản trị và cấu hình dữ liệu |

## Ngôn ngữ

Giao diện chỉ hỗ trợ **tiếng Việt**, không cần i18n.

## Ghi chú cập nhật

- Frontend hiện route trang bản đồ tại `/map`, không dùng `/` làm trang chính
- Trang chi tiết tòa nhà và căn hộ đã được triển khai thực tế, không còn placeholder
- FE đã đồng bộ với backend mới:
  - `POST /api/auth/login` trả `{ user, accessToken, refreshToken }`
  - `GET /api/apartments/:id/details` trả thêm `canViewTenant`, `canViewContract`
  - `GET /api/buildings/geojson` có thể trả `Point` hoặc `Polygon`
  - `Building` và `Floor` có dữ liệu GIS 3D chi tiết hơn (`footprint`, `floorPlan`, `elevation`)
- FE hiện đã có thêm các lớp hoàn thiện sản phẩm:
  - `AppErrorBoundary` cho lỗi render ngoài ý muốn
  - trang `404` thật cho route không tồn tại
  - state lỗi/empty state thân thiện hơn ở các màn hình chính
  - tinh chỉnh responsive cho dashboard, bản đồ, trang 3D và các bảng quản trị lớn
- Test frontend hiện không còn chỉ là test nền tảng:
  - đã có test cho API/hooks/validators
  - đã có thêm test cho error boundary, trang 404 và dashboard
