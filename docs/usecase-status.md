# Use Case Status

Tài liệu này tổng hợp trạng thái triển khai của toàn bộ use case trong `docs/BA.md`, đối chiếu với backend và frontend hiện tại.

## Quy ước trạng thái

- `Done`: đã có luồng sử dụng thực tế, backend và frontend khớp tương đối đầy đủ
- `Partial`: đã có nền tảng hoặc triển khai được một phần, nhưng chưa đạt đúng mức BA kỳ vọng
- `Not done`: chưa có triển khai đáng kể

## Tổng quan

| Nhóm | Số UC | Done | Partial | Not done |
|---|---:|---:|---:|---:|
| Xác thực và phân quyền | 3 | 3 | 0 | 0 |
| Bản đồ GIS | 5 | 5 | 0 | 0 |
| Hiển thị tòa nhà 3D | 4 | 4 | 0 | 0 |
| Tra cứu thông tin căn hộ | 3 | 3 | 0 | 0 |
| Quản lý căn hộ | 4 | 4 | 0 | 0 |
| Quản lý hợp đồng thuê | 4 | 4 | 0 | 0 |
| Dashboard và thống kê | 4 | 4 | 0 | 0 |
| Quản lý người dùng | 6 | 6 | 0 | 0 |
| LoD4 nội thất | 3 | 0 | 3 | 0 |
| **Tổng** | **36*** | **33** | **3** | **0** |

\* Bảng BA đang dùng chuỗi mã `UC00`, `UC00a`, `UC00b`, `UC01`...`UC33`. Nếu tính cả `UC00a` và `UC00b` thì tổng số mục được theo dõi là 36 dòng mã, còn số use case chính theo mô tả dự án thường được gọi gọn là 34.

## Chi tiết từng use case

| ID | Use case | Backend | Frontend | Overall | Ghi chú / cần bổ sung |
|---|---|---|---|---|---|
| UC00 | Login | Done | Done | Done | Có access token + refresh token, kiểm tra tài khoản active, session backend và auto refresh phía FE. |
| UC00a | Logout | Done | Done | Done | FE gọi logout thật, BE revoke session theo refresh token và kết thúc phiên đúng luồng. |
| UC00b | Verify Authorization | Done | Done | Done | BE có middleware auth, role check, và grant theo căn hộ; FE có protected route, manager route, auto redirect khi 401. |
| UC01 | View City Map | Done | Done | Done | Có trang `/map`, render bản đồ tổng thể. |
| UC02 | View Building Locations | Done | Done | Done | BE trả GeoJSON, FE hiển thị point hoặc polygon footprint của tòa nhà. |
| UC03 | Filter Buildings | Done | Done | Done | FE có filter theo city, district, ward, minPrice, maxPrice; BE hỗ trợ query tương ứng. |
| UC04 | View Occupancy Rate | Done | Done | Done | BE có dữ liệu occupancy; FE hiển thị occupancy trên map, popup, badge và timeline snapshot. |
| UC05 | Select Building | Done | Done | Done | Từ map có thể chọn tòa nhà và đi tới màn chi tiết tòa nhà. |
| UC06 | View 3D Building Model | Done | Done | Done | BE lưu/trả `model3dUrl`; FE render bằng React Three Fiber / drei, có `3D tổng quan`, reset camera và upload model tổng quan riêng cho tòa nhà. |
| UC07 | View Floors | Done | Done | Done | BE có floors và dữ liệu GIS tầng; FE hiển thị danh sách tầng, bật/tắt tầng, chọn tầng để vào `Mặt sàn theo tầng`, đồng thời manager đã có CRUD tầng và upload model riêng cho từng tầng. |
| UC08 | View Apartment Units | Done | Done | Done | BE trả apartments theo tầng; FE hiển thị danh sách căn hộ, popup từ model 3D và hotspot `door` gắn được với căn hộ qua `entryNodeId`. |
| UC09 | Zoom / Rotate 3D Model | Done | Done | Done | FE có `OrbitControls`; BE không cần logic đặc biệt ngoài dữ liệu model. |
| UC10 | View Apartment Details | Done | Done | Done | Có `GET /api/apartments/:id/details`; FE có trang chi tiết căn hộ thật. |
| UC11 | View Public Tenant Information | Done | Done | Done | BE trả `canViewTenant`; FE chỉ hiển thị khi có quyền. |
| UC12 | View Contract Information | Done | Done | Done | BE trả `canViewContract` và mở `GET /api/contracts/:id` theo ngữ cảnh; FE render đúng theo cờ quyền. |
| UC13 | Add Apartment | Done | Done | Done | Có CRUD apartment đầy đủ trên BE và trang `/apartments` cho manager. |
| UC14 | Update Apartment Information | Done | Done | Done | Có `PUT /api/apartments/:id` và UI chỉnh sửa. |
| UC15 | Delete Apartment | Done | Done | Done | Soft delete đã triển khai ở BE, có UI xác nhận trên FE. |
| UC16 | Update Apartment Status | Done | Done | Done | Có API đổi trạng thái và UI badge/select. |
| UC17 | Add Rental Contract | Done | Done | Done | Có tạo hợp đồng, BE tự set apartment sang `rented`. |
| UC18 | Edit Rental Contract | Done | Done | Done | Có `PUT /api/contracts/:id` và form FE tương ứng. |
| UC19 | Delete Rental Contract | Done | Done | Done | Có soft delete, BE tự set apartment về `available`. |
| UC20 | Manage Tenant Information | Done | Done | Done | Có CRUD tenant riêng trong BE và FE `/tenants`. |
| UC21 | View Dashboard | Done | Done | Done | Có dashboard tổng quan sau login. |
| UC22 | View Occupancy Statistics | Done | Done | Done | Có API occupancy và FE hiển thị thống kê theo từng tòa nhà. |
| UC23 | View Revenue Statistics | Done | Done | Done | Có `revenue`, `revenue-by-month`; FE vẽ chart doanh thu theo tháng. |
| UC24 | View Time Series Data | Done | Done | Done | BE có `occupancy-history` và `map-snapshot`. FE hiện đã có bộ lọc ngày trực tiếp trên dashboard, biểu đồ lịch sử tỷ lệ lấp đầy, snapshot occupancy theo mốc thời gian ngay trên dashboard và vẫn giữ timeline snapshot ở trang map. |
| UC25 | View User List | Done | Done | Done | Có `GET /api/users` và trang manager `/users`. |
| UC26 | Add User | Done | Done | Done | Có `POST /api/users` và UI tạo user. |
| UC27 | Update User Information | Done | Done | Done | Có `PUT /api/users/:id` và UI chỉnh sửa. |
| UC28 | Delete User | Done | Done | Done | Có soft delete và UI xác nhận xóa. |
| UC29 | Activate User | Done | Done | Done | Có `PATCH /api/users/:id/activate` và nút kích hoạt. |
| UC30 | Deactivate User | Done | Done | Done | Có `PATCH /api/users/:id/deactivate` và nút vô hiệu hóa. |
| UC31 | View 3D Indoor Space | Done | Partial | Partial | BE đã có schema `apartment_spaces`, layouts, items và API detail. FE mới hiển thị danh sách không gian + dữ liệu LoD4, chưa có viewer 3D indoor đúng nghĩa theo BA. Nên bổ sung scene indoor 3D riêng cho căn hộ/phòng. |
| UC32 | Drag & Drop Furniture | Done | Partial | Partial | BE đã có API item/layout và kiểm tra cơ bản. FE có workspace kéo thả nhưng đang là mặt phẳng 2D mô phỏng, chưa phải kéo thả trực tiếp trong không gian 3D. Nên bổ sung thao tác 3D gizmo/transform, snapping, va chạm trực quan. |
| UC33 | Save Furniture Layout | Done | Partial | Partial | Dữ liệu layout/item đã lưu được về BE và FE đã thao tác CRUD. Tuy nhiên vì editor hiện mới là workspace 2D nên use case mới đạt mức lưu bố cục nghiệp vụ, chưa đạt mức “save 3D furniture layout” đầy đủ theo BA. |

## Các khoảng trống chính cần bổ sung

### 1. Indoor 3D LoD4

Hiện trạng:
- BE đã khá đầy đủ về dữ liệu
- FE mới dừng ở quản trị dữ liệu + workspace kéo thả 2D

Nên bổ sung:
- viewer 3D indoor cho apartment detail
- render `spaces` và `furniture items` trong scene 3D
- transform controls cho move/rotate/scale
- kiểm tra collision/snap trực quan
- đồng bộ realtime hoặc refresh scene sau khi save

### 2. Quản trị access grant ở FE

Hiện trạng:
- Done

Đã có:
- UI manager trong trang chi tiết căn hộ để xem danh sách grant
- cấp mới, chỉnh sửa và thu hồi grant theo từng căn hộ
- danh sách user được cấp quyền
- toggle `canViewTenant` / `canViewContract`

### 3. Chất lượng sản phẩm ngoài use case

Hiện trạng:
- FE đã có error boundary, trang 404, empty/error state thân thiện hơn
- responsive cho dashboard, map, building 3D và các màn hình bảng lớn đã được tinh chỉnh
- backend/frontend đều đã có thêm test so với giai đoạn nền tảng ban đầu

Vẫn nên bổ sung tiếp:
- E2E test cho các luồng chính
- tối ưu hiệu năng bundle/render cho các màn hình 3D lớn
- dark mode nếu team muốn đầu tư thêm vào polish giao diện

## Kết luận

Hệ thống hiện đã hoàn thành tốt phần lõi của nghiệp vụ quản lý thuê căn hộ, GIS map, mô hình 3D tòa nhà, dashboard cơ bản và quản trị dữ liệu. Những phần còn thiếu tập trung ở mức hoàn thiện sâu hơn theo BA:
- `Indoor 3D LoD4` đúng nghĩa thay vì workspace 2D mô phỏng
- `E2E testing` cho luồng sử dụng chính
- `Tối ưu đồ họa / hiệu năng 3D` để nâng chất lượng demo và trải nghiệm thật

Lưu ý: các hạng mục quản trị topology ở trang tòa nhà như tạo/sửa/xóa hotspot, bind `door -> apartment`, CRUD edge và CRUD tầng hiện đã có UI thực tế trên frontend, không còn là khoảng trống của tài liệu cũ.
