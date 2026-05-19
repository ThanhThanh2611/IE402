# Mục 2.2 – 2.6: Cơ sở dữ liệu hệ thống 3D GIS Apartment Management System

---

## 2.2 Mô hình biểu diễn không gian 2D và 3D

Hệ thống áp dụng **kiến trúc lai (Hybrid 2D + 3D)** — mô hình kinh điển trong các nền tảng GIS 3D hiện đại như ESRI ArcGIS Indoors, Bentley OpenCities, Cesium Ion. Mỗi lớp không gian phục vụ một mục đích trực quan hóa khác nhau.

### 2.2.1 Mô hình 2D truyền thống

Mô hình GIS 2D biểu diễn đối tượng địa lý dưới dạng hình học phẳng trên mặt phẳng tọa độ `(x, y)` trong hệ quy chiếu **WGS84 (EPSG:4326)**. Trong hệ thống:

- Mỗi tòa nhà được đánh dấu bằng một điểm (**Point**) dựa trên tọa độ tâm, phục vụ marker trên bản đồ nền (hệ thống dùng Leaflet qua `react-leaflet` ở phía frontend).
- Ranh giới đáy tòa nhà được lưu dưới dạng đa giác (**Polygon**) — gọi là **footprint** — để hiển thị hình chiếu mặt đất.
- Phù hợp cho thao tác tổng quan: lọc theo khu vực hành chính, phân bố theo quận/huyện, tỉ lệ lấp đầy theo vùng.

### 2.2.2 Mô hình 3D – CityGML và Level of Detail (LoD)

Để trực quan hóa chi tiết tòa nhà, từng tầng và từng căn hộ, hệ thống sử dụng **mô hình 3D theo tinh thần chuẩn CityGML** — tiêu chuẩn của OGC (Open Geospatial Consortium) cho mô hình hóa thành phố ba chiều. Đối tượng được mô tả bằng các kiểu hình học 3D cơ bản: **PointZ (x, y, z)**, **PolygonZ**, trong đó trục Z mang ý nghĩa **cao độ** (elevation) — yếu tố then chốt để mô hình hóa tòa nhà nhiều tầng.

CityGML định nghĩa 5 mức Level of Detail. Hệ thống bao phủ cả 5 mức bằng hai cơ chế khác nhau (lưu trực tiếp hoặc suy ra runtime):

**Bảng 2.1 – Các mức LoD áp dụng trong hệ thống**

| Cấp | Mô tả | Áp dụng trong hệ thống | Cơ chế |
|---|---|---|---|
| LoD0 | Footprint 2D mặt đất | `buildings.footprint` (PolygonZ) | Lưu trực tiếp |
| LoD1 | Khối hộp đơn giản | Suy ra từ `footprint × total_floors × elevation` | Tính runtime |
| LoD2 | Mô hình kiến trúc có mái | `buildings.lod_level = 'lod2'` | Lưu file glTF/GLB |
| LoD3 | Chi tiết bên ngoài (cửa sổ, ban công) | `buildings.lod_level = 'lod3'` (mặc định) | Lưu file glTF/GLB |
| LoD4 | Không gian bên trong và nội thất | `apartments.indoor_lod_level`, `apartment_spaces.lod_level` | Lưu file glTF/GLB |

Mô hình 3D được lưu dưới dạng file **glTF/GLB** và tham chiếu qua trường `model_3d_url`. Việc gán LoD độc lập ở 3 cấp (building → apartment → apartment_space) hỗ trợ chiến lược **adaptive rendering**: hiển thị LoD2 khi camera ở xa, chuyển sang LoD4 khi người dùng zoom sâu vào căn hộ — tối ưu hiệu năng render WebGL (frontend dùng Three.js qua `@react-three/fiber` và `@react-three/drei`).

### 2.2.3 Tích hợp 2D + 3D

| Lớp | Mô hình | Mục đích | Bảng dữ liệu |
|---|---|---|---|
| Outdoor / City-scale | 2D + 3D (LoD0–LoD3) | Marker, footprint, khối tòa nhà trên bản đồ | `buildings` (default `lod_level = 'lod3'`) |
| Indoor / Building-scale | 3D chi tiết (LoD4) | Hiển thị từng tầng, căn hộ, phòng, nội thất | `floors`, `apartments`, `apartment_spaces`, `furniture_items` |
| Topology | Đồ thị 3D đa tầng | Tìm đường giữa các căn hộ qua thang/cầu thang | `navigation_nodes`, `navigation_edges` |

---

## 2.3 Phân tích ưu nhược điểm của mô hình đã chọn

**Bảng 2.2 – So sánh mô hình 2D và 3D trong hệ thống**

| Tiêu chí | Mô hình 2D (GIS truyền thống) | Mô hình 3D (3D GIS / CityGML) |
|---|---|---|
| Biểu diễn không gian | Mặt phẳng 2 chiều, hiển thị theo lớp (layer) | Không gian 3 chiều, có chiều cao và khối lượng |
| Phân cấp tầng/căn hộ | Không phân biệt; căn hộ gắn theo vị trí phẳng | Phân cấp rõ: **tòa nhà → tầng → căn hộ → phòng** theo trục Z |
| Tương tác người dùng | Zoom, pan, click xem thông tin | Zoom, pan, **xoay, nghiêng**; chọn trực tiếp căn hộ theo tầng |
| Hiệu năng rendering | Nhẹ, tải nhanh, phù hợp thiết bị thấp | Đòi hỏi GPU/WebGL, cần tối ưu LoD |
| Tích hợp thuộc tính | Liên kết qua ID đối tượng | Mỗi khối 3D mang đầy đủ metadata + ngữ nghĩa sâu |
| Thuộc tính không gian | Tọa độ điểm (lat/lng) | Tọa độ điểm + hình học khối + cao độ Z + topology |
| Ứng dụng phù hợp | Tổng quan, lọc khu vực, thống kê vùng | Quản lý tòa nhà, chọn căn hộ theo tầng, mô phỏng đường đi 3D |

**Lý do lựa chọn mô hình Hybrid:**

- **Mô hình 2D** phù hợp hiển thị tổng quan nhiều tòa nhà trên bản đồ thành phố, hỗ trợ lọc và phân tích không gian nhanh, tiêu tốn ít tài nguyên máy khách.
- **Mô hình 3D** chỉ kích hoạt khi người dùng chọn một tòa nhà cụ thể, giúp giảm tải rendering và tập trung trải nghiệm vào đối tượng quan tâm.
- **Cấu trúc topology graph** (navigation_nodes/edges) cho phép vượt xa khả năng của GIS 2D thuần: dữ liệu được tổ chức để **phục vụ** các thuật toán tìm đường 3D đa tầng (ví dụ Dijkstra/A*) qua thang máy/cầu thang. Hiện CSDL và API đã sẵn sàng cung cấp toàn bộ graph; bản thân thuật toán pathfinding chưa triển khai trong kho mã.
- Kiến trúc Hybrid cho phép hệ thống hoạt động mượt trên cả thiết bị di động (lớp 2D) lẫn máy tính để bàn (lớp 3D).

---

## 2.4 Sơ đồ quan hệ đối tượng (ERD)

### 2.4.1 Mô tả tổng quan ERD

Sơ đồ ERD (Entity-Relationship Diagram) mô tả cấu trúc dữ liệu thông qua các thực thể, thuộc tính và mối quan hệ giữa chúng. Hệ thống **3D GIS Apartment Management System** bao gồm **16 thực thể**, được thiết kế để đáp ứng đầy đủ các nghiệp vụ: quản lý không gian tòa nhà 3D, mạng lưới điều hướng đa tầng, bố trí nội thất 3D, hợp đồng thuê, thanh toán và phân quyền truy cập.

Danh sách các thực thể:

- `buildings` – **Tòa nhà**: lưu định danh, địa chỉ và hình học GIS (PointZ + PolygonZ footprint).
- `floors` – **Tầng**: lưu thông tin tầng kèm cao độ (`elevation`) và mặt bằng (`floor_plan` PolygonZ).
- `apartments` – **Căn hộ**: thực thể trung tâm, kết nối phân cấp không gian với nghiệp vụ thuê.
- `apartment_spaces` – **Không gian trong căn hộ**: cây phân cấp `unit → room → zone` với ranh giới 3D (PolygonZ).
- `navigation_nodes` – **Nút điều hướng**: cửa, thang máy, cầu thang, sảnh — mang tọa độ PointZ.
- `navigation_edges` – **Cạnh điều hướng**: cạnh đồ thị có trọng số `distance`, phân loại `hallway`/`stairs`/`elevator`.
- `furniture_catalog` – **Thư viện mẫu nội thất**: master data chứa kích thước 3D mặc định.
- `furniture_layouts` – **Bố cục nội thất**: phiên bản layout của một căn hộ (draft/published/archived).
- `furniture_items` – **Item nội thất**: instance trong layout với `position` PointZ + rotation 3 trục + scale 3 trục.
- `tenants` – **Khách thuê**: định danh pháp lý người thuê (CCCD/CMND), không phải tài khoản đăng nhập.
- `rental_contracts` – **Hợp đồng thuê**: điều khoản thuê căn hộ.
- `payments` – **Thanh toán**: lịch sử thu tiền theo kỳ.
- `apartment_status_history` – **Lịch sử trạng thái**: audit log biến động trạng thái căn hộ.
- `users` – **Người dùng hệ thống**: tài khoản đăng nhập (manager/user).
- `auth_sessions` – **Phiên đăng nhập**: lưu refresh token rotation cho đa thiết bị.
- `apartment_access_grants` – **Cấp quyền truy cập**: manager cấp quyền xem tenant/contract của một căn hộ cho user cụ thể.

### 2.4.2 Phân biệt `users` và `tenants`

Một điểm cần làm rõ: `users` và `tenants` là **hai thực thể hoàn toàn tách biệt** với vai trò khác nhau:

**Bảng 2.3 – So sánh thực thể `users` và `tenants`**

| Tiêu chí | `users` (Người dùng hệ thống) | `tenants` (Khách thuê) |
|---|---|---|
| Bản chất | Tài khoản đăng nhập vào phần mềm | Người thuê căn hộ thực tế |
| Vai trò | `manager`: quản lý hệ thống; `user`: xem thông tin | Là đối tượng được quản lý trong hệ thống |
| Thông tin lưu trữ | `username`, `password` (hash), `role`, `email` | `full_name`, `id_card`, `phone`, `address` (thuộc tính không gian) |
| Mối quan hệ với hợp đồng | Ghi nhận ai tạo/cập nhật hợp đồng (audit) | Là người ký hợp đồng (`tenant_id` trong `rental_contracts`) |
| Có thể vừa là user vừa là tenant? | Có thể liên kết tùy chọn qua `tenants.linked_user_id` (1 — 0..1) — nhưng vẫn là 2 thực thể độc lập | |
| Thuộc tính không gian | Không có | `address` – địa chỉ thường trú |

### 2.4.3 Sơ đồ ERD

*(Hình 2.1 – Sơ đồ ERD tổng thể, đã được nhóm vẽ riêng)*

Sơ đồ ERD mô tả rõ **phân cấp không gian 3 cấp** theo tinh thần CityGML:

- **Cấp 1 – Tòa nhà (`buildings`)**: điểm neo không gian GIS, lưu tọa độ `location` (PointZ) và `footprint` (PolygonZ) trong CRS WGS84.
- **Cấp 2 – Tầng (`floors`)**: xác định vị trí theo trục Z thông qua `elevation`; ràng buộc unique `(building_id, floor_number)` ngăn trùng số tầng.
- **Cấp 3 – Căn hộ (`apartments`)**: thực thể trung tâm; trường `status` điều khiển màu sắc hiển thị trong cảnh 3D (xanh/đỏ/vàng); liên kết với mạng navigation qua `entry_node_id`.

### 2.4.4 Các mối quan hệ trong ERD

**Bảng 2.4 – Tổng hợp các mối quan hệ giữa các thực thể**

| Thực thể cha | Thực thể con | Kiểu quan hệ | Khóa ngoại | Ràng buộc / Ghi chú |
|---|---|---|---|---|
| `buildings` | `floors` | 1 — N | `floors.building_id` | Một tòa nhà có nhiều tầng; UNIQUE `(building_id, floor_number)` |
| `floors` | `apartments` | 1 — N | `apartments.floor_id` | Một tầng chứa nhiều căn hộ |
| `floors` | `navigation_nodes` | 1 — N | `navigation_nodes.floor_id` | Mỗi tầng chứa các nút điều hướng |
| `navigation_nodes` | `navigation_edges` | 1 — N | `navigation_edges.start_node_id` | Node ở một đầu của cạnh |
| `navigation_nodes` | `navigation_edges` | 1 — N | `navigation_edges.end_node_id` | Node ở đầu còn lại — hai FK kết hợp biểu diễn đồ thị có trọng số (việc xử lý có hướng hay vô hướng do tầng ứng dụng quyết định) |
| `navigation_nodes` | `apartments` | 1 — N (tùy chọn) | `apartments.entry_node_id` | Node cửa vào — terminal node trong mạng navigation |
| `apartments` | `apartment_spaces` | 1 — N | `apartment_spaces.apartment_id` | Một căn hộ chia thành nhiều không gian |
| `apartment_spaces` | `apartment_spaces` | 1 — N (tự tham chiếu) | `apartment_spaces.parent_space_id` | Cây phân cấp `unit → room → zone` |
| `apartments` | `furniture_layouts` | 1 — N | `furniture_layouts.apartment_id` | Một căn hộ có nhiều bố cục (draft/published/archived) |
| `furniture_layouts` | `furniture_items` | 1 — N | `furniture_items.layout_id` | Một layout chứa nhiều item |
| `furniture_catalog` | `furniture_items` | 1 — N | `furniture_items.catalog_id` | Một mẫu được dùng nhiều lần ở các layout |
| `apartment_spaces` | `furniture_items` | 1 — N (tùy chọn) | `furniture_items.space_id` | Item gắn vào một phòng/zone để kiểm tra va chạm với `boundary` |
| `apartments` | `rental_contracts` | 1 — N | `rental_contracts.apartment_id` | Một căn hộ có thể có nhiều hợp đồng theo thời gian |
| `tenants` | `rental_contracts` | 1 — N | `rental_contracts.tenant_id` | Một khách thuê có thể ký nhiều hợp đồng |
| `rental_contracts` | `payments` | 1 — N | `payments.contract_id` | Một hợp đồng có nhiều kỳ thanh toán |
| `apartments` | `apartment_status_history` | 1 — N | `apartment_status_history.apartment_id` | Lịch sử trạng thái căn hộ |
| `users` | `tenants` | 1 — 0..1 (tùy chọn) | `tenants.linked_user_id` UNIQUE | Khách thuê có thể có hoặc không có tài khoản đăng nhập |
| `users` | `auth_sessions` | 1 — N | `auth_sessions.user_id` | Đăng nhập đa thiết bị, refresh token rotation |
| `apartments` | `apartment_access_grants` | 1 — N | `apartment_access_grants.apartment_id` | Bảng nối phân quyền theo căn hộ |
| `users` | `apartment_access_grants` | 1 — N | `apartment_access_grants.user_id` | Bảng nối phân quyền theo user |
| **Tổng hợp:** `apartments` ↔ `users` | qua `apartment_access_grants` | **N — N** | UNIQUE `(apartment_id, user_id)` | Manager cấp quyền `can_view_tenant` / `can_view_contract` cho user trên từng căn hộ |
| `users` | `apartment_access_grants` | 1 — N (audit ref) | `apartment_access_grants.granted_by_id` | Manager cấp quyền |
| `users` | `apartments` | 1 — N (audit refs) | `apartments.created_by_id`, `updated_by_id` | Audit |
| `users` | `rental_contracts` | 1 — N (audit refs) | `rental_contracts.created_by_id`, `updated_by_id` | Audit |
| `users` | `apartment_status_history` | 1 — N (audit ref) | `apartment_status_history.changed_by_id` | Manager thực hiện thay đổi trạng thái |
| `users` | `furniture_layouts` | 1 — N (audit refs) | `furniture_layouts.created_by_id`, `updated_by_id` | Audit |

**Xóa mềm (Soft Delete):**

Hệ thống áp dụng xóa mềm qua trường `deleted_at` trên 5 thực thể: `apartments`, `tenants`, `rental_contracts`, `payments`, `users` — nhằm bảo toàn dữ liệu lịch sử và hỗ trợ phân tích spatio-temporal (ví dụ: tỷ lệ lấp đầy theo tháng, biến động giá thuê theo năm).

---

## 2.5 Mô hình quan hệ CSDL chi tiết

Phần này trình bày chi tiết cấu trúc từng bảng dữ liệu trong hệ thống, bao gồm tên thuộc tính, kiểu dữ liệu, ràng buộc và phân loại theo đặc trưng GIS (Không gian / Thời gian / Ngữ nghĩa / Định danh / Mô tả).

### 2.5.1 Bảng `buildings` – Tòa nhà (LoD0 → LoD3)

Lưu thông tin tòa nhà chung cư. Đây là thực thể có mật độ thuộc tính không gian cao nhất hệ thống: lưu cả **PointZ** (tọa độ tâm) và **PolygonZ** (footprint) — đáp ứng đầy đủ chuẩn CityGML.

**Bảng 2.5 – Phân loại thuộc tính bảng `buildings`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính tự tăng (tương đương khái niệm `gml:id` trong GML) |
| `name` | VARCHAR | NOT NULL | | Mô tả | Tên tòa nhà |
| `address` | VARCHAR | NOT NULL | | Không gian | Địa chỉ cụ thể |
| `ward`, `district`, `city` | VARCHAR | | | Không gian | Đơn vị hành chính cấp 3/2/1 |
| `location` | geometry(PointZ, 4326) | NOT NULL | | **Không gian** | Tọa độ 3D tâm tòa nhà — gml:Point |
| `footprint` | geometry(PolygonZ, 4326) | | | **Không gian** | LoD0 footprint — gml:Polygon |
| `total_floors` | INTEGER | NOT NULL | | Ngữ nghĩa | Tổng số tầng — đầu vào suy ra LoD1 |
| `lod_level` | ENUM | NOT NULL, DEFAULT 'lod3' | | Ngữ nghĩa | Mức LoD của model_3d_url |
| `description`, `image_url` | TEXT/VARCHAR | | | Mô tả | Mô tả và ảnh đại diện |
| `model_3d_url` | VARCHAR | | | Mô tả | externalReference đến file glTF/GLB |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

### 2.5.2 Bảng `floors` – Tầng (LoD2 → LoD3)

Lưu thông tin các tầng. Trường `elevation` là **thuộc tính không gian then chốt** xác định vị trí trục Z, đầu vào để dựng LoD1 block model.

**Bảng 2.6 – Phân loại thuộc tính bảng `floors`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `building_id` | INTEGER | NOT NULL | FK → buildings | Định danh | Quan hệ 1-N với tòa nhà |
| `floor_number` | INTEGER | NOT NULL, UNIQUE* | | Không gian (logic) | Số thứ tự tầng theo trục Z |
| `elevation` | DECIMAL | NOT NULL, DEFAULT 0 | | **Không gian** | Cao độ sàn (m) trong không gian 3D |
| `floor_plan` | geometry(PolygonZ, 4326) | | | **Không gian** | Mặt bằng hình học của tầng |
| `model_3d_url` | VARCHAR | | | Mô tả | externalReference cho model riêng từng tầng |
| `description` | TEXT | | | Mô tả | Mô tả bổ sung |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

\* UNIQUE `(building_id, floor_number)`

### 2.5.3 Bảng `apartments` – Căn hộ (LoD3 → LoD4)

**Thực thể trung tâm** của hệ thống — điểm hội tụ của phân cấp không gian (lên trên: floor → building) và nghiệp vụ (xuống dưới: contract, payment, status history). Trường `status` điều khiển trực tiếp màu sắc hiển thị trong cảnh 3D.

**Bảng 2.7 – Phân loại thuộc tính bảng `apartments`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `floor_id` | INTEGER | NOT NULL | FK → floors | Định danh | Tham chiếu tầng — xác định Z |
| `entry_node_id` | INTEGER | | FK → navigation_nodes | Định danh | **Cầu nối ER ↔ topology graph** |
| `code` | VARCHAR | NOT NULL, UNIQUE | | Định danh | Mã căn hộ (VD: A101, B2-05) |
| `area` | DECIMAL | NOT NULL | | Không gian (đo lường) | Diện tích thông thủy (m²) |
| `num_bedrooms`, `num_bathrooms` | INTEGER | | | Ngữ nghĩa | Phân loại căn hộ |
| `rental_price` | DECIMAL | NOT NULL | | Ngữ nghĩa | Giá thuê niêm yết (VND/tháng) |
| `status` | ENUM | NOT NULL, DEFAULT 'available' | | Ngữ nghĩa | available/rented/maintenance — điều khiển màu render 3D |
| `indoor_model_url` | VARCHAR | | | Mô tả | externalReference đến model nội thất |
| `indoor_lod_level` | ENUM | DEFAULT 'lod4' | | Ngữ nghĩa | LoD của nội thất bên trong |
| `description` | TEXT | | | Mô tả | Mô tả chi tiết |
| `created_by_id`, `updated_by_id` | INTEGER | | FK → users | Định danh | Audit refs |
| `created_at`, `updated_at`, `deleted_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Soft delete |

### 2.5.4 Bảng `apartment_spaces` – Không gian trong căn hộ (LoD4)

Cây phân cấp các không gian con trong căn hộ (`unit → room → zone`), tương ứng với khái niệm **IndoorRoom/Zone** trong CityGML. Trường `boundary` là PolygonZ định nghĩa ranh giới 3D thực sự của phòng — phục vụ kiểm tra va chạm khi đặt nội thất.

**Bảng 2.8 – Phân loại thuộc tính bảng `apartment_spaces`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `apartment_id` | INTEGER | NOT NULL | FK → apartments | Định danh | Căn hộ chứa không gian này |
| `parent_space_id` | INTEGER | | FK self | Định danh | Cây phân cấp không gian |
| `name` | VARCHAR | NOT NULL, UNIQUE* | | Định danh | Tên không gian (VD: Phòng khách) |
| `space_type` | ENUM | NOT NULL, DEFAULT 'room' | | Ngữ nghĩa | unit / room / zone |
| `room_type` | ENUM | | | Ngữ nghĩa | living_room / bedroom / kitchen / ... |
| `lod_level` | ENUM | NOT NULL, DEFAULT 'lod4' | | Ngữ nghĩa | LoD nội thất |
| `boundary` | geometry(PolygonZ, 4326) | | | **Không gian** | Ranh giới 3D phòng — kiểm tra va chạm |
| `model_3d_url` | VARCHAR | | | Mô tả | Model 3D riêng nếu có |
| `metadata` | JSONB | | | Mô tả | Vật liệu, chiều cao trần, vùng cấm |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

\* UNIQUE `(apartment_id, name)`

### 2.5.5 Bảng `navigation_nodes` & `navigation_edges` – Đồ thị điều hướng 3D

Cụm bảng này hiện thực hóa **mô hình mạng (graph)** — cấu trúc dữ liệu phục vụ các thuật toán tìm đường 3D đa tầng (ví dụ Dijkstra/A*). Khác biệt so với GIS 2D thông thường nằm ở chỗ các cạnh có thể **kết nối node ở các tầng khác nhau** (qua `edge_type = 'stairs'` hoặc `'elevator'`), cho phép biểu diễn đường đi xuyên trục Z.

**Bảng 2.9 – Phân loại thuộc tính bảng `navigation_nodes`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Đỉnh đồ thị |
| `floor_id` | INTEGER | NOT NULL | FK → floors | Định danh | Tầng chứa node |
| `node_type` | ENUM | NOT NULL | | Ngữ nghĩa | door / elevator / stairs / junction |
| `label` | VARCHAR | | | Mô tả | Nhãn mô tả |
| `location` | geometry(PointZ, 4326) | NOT NULL | | **Không gian** | Tọa độ 3D toàn cục — theo quy ước thiết kế, giá trị z lý tưởng khớp với `floors.elevation` của tầng chứa node (không enforce ở DB) |
| `local_x`, `local_y`, `local_z` | DECIMAL | | | **Không gian** | Tọa độ cục bộ trong tòa nhà |
| `mesh_ref` | VARCHAR | | | Mô tả | Tham chiếu mesh trong model 3D |
| `metadata` | JSONB | | | Mô tả | Thuộc tính mở rộng |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

**Bảng 2.10 – Phân loại thuộc tính bảng `navigation_edges`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Cạnh đồ thị |
| `start_node_id`, `end_node_id` | INTEGER | NOT NULL | FK → navigation_nodes | Định danh | Hai đầu mút |
| `edge_type` | ENUM | NOT NULL, DEFAULT 'hallway' | | Ngữ nghĩa | hallway / stairs / elevator — phân loại liên kết Z |
| `distance` | DECIMAL | NOT NULL | | **Không gian** (đo lường) | Khoảng cách (m), dùng làm trọng số cho thuật toán tìm đường |
| `travel_time` | DECIMAL | | | Thời gian | Trọng số thay thế (giây) |
| `is_accessible` | BOOLEAN | NOT NULL, DEFAULT true | | Ngữ nghĩa | Điều khiển khả năng đi qua (đóng khi hỏa hoạn, bảo trì) |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

> **Cầu nối ER ↔ Graph:** Trường `apartments.entry_node_id` (FK → `navigation_nodes`) là điểm kết nối giữa mô hình thực thể nghiệp vụ và mô hình mạng — cho phép từ một căn hộ truy vấn ngược về node cửa của nó để làm điểm đầu/đích trong các bài toán tìm đường.

### 2.5.6 Bảng `furniture_catalog` – Thư viện nội thất (LoD4)

Master data lưu các mẫu nội thất có thể kéo thả vào căn hộ. Các trường kích thước mặc định (`default_width/depth/height`) là **thuộc tính không gian 3D** xác định khối hộp bao của vật.

**Bảng 2.11 – Phân loại thuộc tính bảng `furniture_catalog`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `code` | VARCHAR | NOT NULL, UNIQUE | | Định danh | Mã mẫu trong thư viện |
| `name` | VARCHAR | NOT NULL | | Mô tả | Tên đồ nội thất |
| `category` | ENUM | NOT NULL, DEFAULT 'other' | | Ngữ nghĩa | sofa / table / chair / bed / cabinet / appliance / decor / other |
| `model_3d_url` | VARCHAR | NOT NULL | | Mô tả | Model glTF/GLB để render khi kéo thả |
| `default_width`, `default_depth`, `default_height` | DECIMAL | | | **Không gian** | Kích thước 3D mặc định |
| `metadata` | JSONB | | | Mô tả | Material, anchor rules |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | | Ngữ nghĩa | Bật/tắt mẫu trong thư viện |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

### 2.5.7 Bảng `furniture_layouts` – Phiên bản bố cục

Một căn hộ có thể có nhiều bố cục (draft/published/archived) — hỗ trợ cơ chế **versioning** cho thiết kế nội thất.

**Bảng 2.12 – Phân loại thuộc tính bảng `furniture_layouts`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `apartment_id` | INTEGER | NOT NULL | FK → apartments | Định danh | Căn hộ chứa layout |
| `name` | VARCHAR | NOT NULL | | Mô tả | Tên bố cục |
| `status` | ENUM | NOT NULL, DEFAULT 'draft' | | Ngữ nghĩa | draft / published / archived |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | | Ngữ nghĩa | Số phiên bản |
| `created_by_id`, `updated_by_id` | INTEGER | | FK → users | Định danh | Audit refs |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

### 2.5.8 Bảng `furniture_items` – Item trong layout

**Bảng có mật độ thuộc tính không gian 3D cao nhất hệ thống**: `position` (PointZ) + 3 trường rotation (Euler angles) + 3 trường scale tham số hóa **ma trận affine 4×4** trong scene graph 3D — pattern phổ biến trong các engine WebGL (Three.js). Cách lưu trữ này không phải là `gml:relativeGMLGeometry` thuần của CityGML (vốn chứa hình học GML đầy đủ), mà là biến thể **catalog + transform** giúp tiết kiệm dung lượng khi cùng một mẫu nội thất xuất hiện nhiều lần.

**Bảng 2.13 – Phân loại thuộc tính bảng `furniture_items`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `layout_id` | INTEGER | NOT NULL | FK → furniture_layouts | Định danh | Layout chứa item |
| `space_id` | INTEGER | | FK → apartment_spaces | Định danh | Phòng/zone chứa item (kiểm tra va chạm) |
| `catalog_id` | INTEGER | NOT NULL | FK → furniture_catalog | Định danh | Mẫu nội thất tham chiếu |
| `label` | VARCHAR | | | Mô tả | Tên gợi nhớ |
| `position` | geometry(PointZ, 4326) | NOT NULL | | **Không gian** | Tọa độ 3D đặt nội thất |
| `rotation_x`, `rotation_y`, `rotation_z` | DECIMAL | NOT NULL, DEFAULT 0 | | **Không gian** | Góc Euler 3 trục |
| `scale_x`, `scale_y`, `scale_z` | DECIMAL | NOT NULL, DEFAULT 1 | | **Không gian** | Tỉ lệ 3 trục |
| `is_locked` | BOOLEAN | NOT NULL, DEFAULT false | | Ngữ nghĩa | Khóa item tránh chỉnh sửa |
| `metadata` | JSONB | | | Mô tả | Trạng thái va chạm, anchor, preset |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

### 2.5.9 Bảng `tenants` – Khách thuê

Định danh pháp lý người thuê. Trường `id_card` UNIQUE toàn hệ thống tránh trùng hồ sơ. `address` là thuộc tính không gian dạng văn bản (địa chỉ thường trú).

**Bảng 2.14 – Phân loại thuộc tính bảng `tenants`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `linked_user_id` | INTEGER | UNIQUE | FK → users | Định danh | Tài khoản đăng nhập (tùy chọn) |
| `full_name` | VARCHAR | NOT NULL | | Mô tả | Họ tên đầy đủ |
| `phone` | VARCHAR | NOT NULL | | Mô tả | Số điện thoại |
| `email` | VARCHAR | | | Mô tả | Email liên hệ |
| `id_card` | VARCHAR | NOT NULL, UNIQUE | | Định danh | CCCD/CMND |
| `address` | VARCHAR | | | Không gian | Địa chỉ thường trú |
| `created_at`, `updated_at`, `deleted_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Soft delete |

### 2.5.10 Bảng `rental_contracts` – Hợp đồng thuê

Bảng có nhiều thuộc tính thời gian nhất hệ thống (5 trường) — `start_date`/`end_date` xác định **valid time** (thời gian nghiệp vụ), trong khi `created_at`/`updated_at`/`deleted_at` là **system time**.

**Bảng 2.15 – Phân loại thuộc tính bảng `rental_contracts`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `apartment_id` | INTEGER | NOT NULL | FK → apartments | Định danh | Căn hộ thuê |
| `tenant_id` | INTEGER | NOT NULL | FK → tenants | Định danh | Khách thuê |
| `start_date`, `end_date` | DATE | NOT NULL | | Thời gian (valid time) | Khoảng hiệu lực hợp đồng |
| `monthly_rent` | DECIMAL | NOT NULL | | Ngữ nghĩa | Giá thuê thực tế (VND/tháng) |
| `deposit` | DECIMAL | | | Ngữ nghĩa | Tiền đặt cọc |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | | Ngữ nghĩa | active / expired / cancelled |
| `note` | TEXT | | | Mô tả | Ghi chú điều khoản |
| `created_by_id`, `updated_by_id` | INTEGER | | FK → users | Định danh | Audit refs |
| `created_at`, `updated_at`, `deleted_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Soft delete |

### 2.5.11 Bảng `payments` – Thanh toán

**Bảng 2.16 – Phân loại thuộc tính bảng `payments`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `contract_id` | INTEGER | NOT NULL | FK → rental_contracts | Định danh | Hợp đồng tương ứng |
| `amount` | DECIMAL | NOT NULL | | Ngữ nghĩa | Số tiền thanh toán (VND) |
| `payment_date` | DATE | NOT NULL | | Thời gian (valid time) | Ngày thanh toán |
| `status` | ENUM | NOT NULL, DEFAULT 'paid' | | Ngữ nghĩa | pending / paid / overdue |
| `note` | TEXT | | | Mô tả | Ghi chú |
| `created_at`, `deleted_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Soft delete |

### 2.5.12 Bảng `apartment_status_history` – Lịch sử trạng thái

Audit log bất biến (không có soft delete), ghi nhận mọi biến động trạng thái căn hộ — nền tảng cho phân tích **spatio-temporal**.

**Bảng 2.17 – Phân loại thuộc tính bảng `apartment_status_history`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `apartment_id` | INTEGER | NOT NULL | FK → apartments | Định danh | Căn hộ thay đổi |
| `status` | ENUM | NOT NULL | | Ngữ nghĩa | Trạng thái tại thời điểm |
| `changed_by_id` | INTEGER | | FK → users | Định danh | Manager thực hiện |
| `changed_at` | TIMESTAMP | NOT NULL, DEFAULT now() | | Thời gian | Thời điểm thay đổi |
| `note` | TEXT | | | Mô tả | Lý do thay đổi |

### 2.5.13 Bảng `users` – Người dùng hệ thống

Quản lý tài khoản truy cập với hai vai trò: `user` (xem) và `manager` (toàn quyền). Mật khẩu lưu dạng hash (bcrypt/argon2).

**Bảng 2.18 – Phân loại thuộc tính bảng `users`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `username` | VARCHAR | NOT NULL, UNIQUE | | Định danh | Tên đăng nhập |
| `password` | VARCHAR | NOT NULL | | Ngữ nghĩa | Mật khẩu hash |
| `full_name` | VARCHAR | NOT NULL | | Mô tả | Họ tên |
| `email` | VARCHAR | UNIQUE | | Mô tả | Email |
| `role` | ENUM | NOT NULL, DEFAULT 'user' | | Ngữ nghĩa | user / manager |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | | Ngữ nghĩa | Kích hoạt tài khoản |
| `created_at`, `updated_at`, `deleted_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Soft delete |

### 2.5.14 Bảng `auth_sessions` & `apartment_access_grants` – Phân quyền

`auth_sessions` lưu refresh token hash cho cơ chế đăng nhập đa thiết bị. `apartment_access_grants` là bảng nối phân quyền chi tiết (xem tenant / xem contract) trên từng căn hộ — quyết định thông tin nào hiển thị trên bản đồ 3D.

**Bảng 2.19 – Phân loại thuộc tính bảng `auth_sessions`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `user_id` | INTEGER | NOT NULL | FK → users | Định danh | User đăng nhập |
| `refresh_token_hash` | VARCHAR | NOT NULL, UNIQUE | | Định danh | Hash refresh token |
| `expires_at`, `revoked_at`, `last_used_at` | TIMESTAMP | | | Thời gian | Vòng đời token |
| `user_agent` | TEXT | | | Mô tả | Thiết bị đăng nhập |
| `ip_address` | VARCHAR | | | Không gian | Địa chỉ IP |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

**Bảng 2.20 – Phân loại thuộc tính bảng `apartment_access_grants`**

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | INTEGER | NOT NULL | PK | Định danh | Khóa chính |
| `apartment_id` | INTEGER | NOT NULL | FK → apartments | Định danh | Căn hộ áp dụng quyền |
| `user_id` | INTEGER | NOT NULL | FK → users | Định danh | User được cấp quyền |
| `can_view_tenant` | BOOLEAN | NOT NULL, DEFAULT false | | Ngữ nghĩa | Quyền xem thông tin tenant |
| `can_view_contract` | BOOLEAN | NOT NULL, DEFAULT false | | Ngữ nghĩa | Quyền xem chi tiết hợp đồng |
| `expires_at` | TIMESTAMP | | | Thời gian | Hết hạn grant |
| `granted_by_id` | INTEGER | | FK → users | Định danh | Manager cấp quyền (audit) |
| `note` | TEXT | | | Mô tả | Ghi chú |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Audit timestamps |

\* UNIQUE `(apartment_id, user_id)`

---

## 2.6 Phân loại thuộc tính theo đặc trưng GIS

Trong hệ thống GIS, các thuộc tính của thực thể không chỉ mang ý nghĩa nghiệp vụ mà còn phản ánh đặc trưng **không gian – thời gian – ngữ nghĩa** — ba chiều cơ bản của dữ liệu địa lý. Phần này phân loại toàn bộ thuộc tính trong CSDL theo ba nhóm chính, cùng với nhóm định danh và mô tả.

### 2.6.1 Thuộc tính không gian (Spatial Attributes)

Thuộc tính không gian liên kết thực thể với vị trí địa lý thực, là thành phần cốt lõi phân biệt hệ thống GIS với hệ thống quản lý thông thường. Trong hệ thống này, thuộc tính không gian được chia thành **nhiều lớp**:

- **Lớp 2D (vị trí phẳng)**: hình chiếu của `buildings.location` (PointZ) trên mặt phẳng XY phục vụ render marker trên bản đồ tổng quan và truy vấn theo bán kính (`ST_DWithin`, `ST_Distance` đã được dùng trong [backend/src/routes/buildings.ts](../backend/src/routes/buildings.ts)).
- **Lớp 3D hình học khối**:
  - `buildings.footprint` (PolygonZ) – ranh giới mặt đất (LoD0)
  - `floors.floor_plan` (PolygonZ) + `floors.elevation` – mặt bằng và cao độ tầng
  - `apartment_spaces.boundary` (PolygonZ) – ranh giới 3D của phòng (LoD4)
- **Lớp 3D điểm (PointZ)**: `navigation_nodes.location`, `furniture_items.position` – các điểm đặc biệt trong không gian 3D với cao độ Z.
- **Lớp tham chiếu mô hình 3D**: `buildings.model_3d_url`, `apartments.indoor_model_url`, `apartment_spaces.model_3d_url`, `furniture_catalog.model_3d_url` – externalReference đến file glTF/GLB chứa hình học khối chi tiết.
- **Lớp không gian biến đổi (transform)**: `furniture_items.rotation_x/y/z` + `scale_x/y/z` – các tham số biến đổi 3D tạo thành ma trận affine 4×4.
- **Lớp không gian hành chính**: `buildings.ward/district/city`, `tenants.address` – phân vùng hành chính dạng văn bản.
- **Lớp topology mạng**: cấu trúc đồ thị được hình thành từ **quan hệ khóa ngoại** `navigation_edges.start_node_id` / `end_node_id` → `navigation_nodes`. Bản thân `distance` là số đo khoảng cách và `edge_type` là phân loại ngữ nghĩa, đóng vai trò trọng số/nhãn cho các cạnh trong mạng.

### 2.6.2 Thuộc tính thời gian (Temporal Attributes)

Hệ thống lưu song song **hai loại thời gian**:

- **Thời gian hệ thống (system time)**: `created_at`, `updated_at` ghi nhận thời điểm tạo/cập nhật bản ghi; `deleted_at` thực hiện soft delete trên 5 bảng (`apartments`, `tenants`, `rental_contracts`, `payments`, `users`).
- **Thời gian nghiệp vụ (valid time)**: `start_date`/`end_date` (rental_contracts), `payment_date` (payments), `changed_at` (apartment_status_history), `expires_at` (apartment_access_grants, auth_sessions).
- **Thời gian đo lường**: `travel_time` (navigation_edges) – thời gian di chuyển qua cạnh đồ thị.

Việc tách bạch giữa **valid time** và **system time** (lưu ý: chưa phải mô hình bi-temporal đầy đủ với period-based versioning) đã đủ cho các phân tích **spatio-temporal** mức cơ bản: thống kê doanh thu theo tháng/quý/năm và truy vấn biến động trạng thái căn hộ theo thời gian.

### 2.6.3 Thuộc tính ngữ nghĩa (Semantic Attributes)

Thuộc tính ngữ nghĩa mang ý nghĩa nghiệp vụ và phân loại thực thể, là căn cứ thực hiện quy tắc kinh doanh, hiển thị màu sắc trong cảnh 3D và tính toán thống kê:

- `apartment_status` (available / rented / maintenance) – **điều khiển trực tiếp màu sắc khối căn hộ trong scene 3D**.
- `contract_status` (active / expired / cancelled) – kiểm soát vòng đời hợp đồng.
- `payment_status` (pending / paid / overdue) – hỗ trợ cảnh báo tài chính.
- `user_role` (user / manager) – phân quyền hệ thống.
- `lod_level` (lod2 / lod3 / lod4) – **đặc trưng GIS 3D quan trọng**, điều khiển độ chi tiết rendering theo khoảng cách camera.
- `node_type` (door / elevator / stairs / junction), `edge_type` (hallway / stairs / elevator) – ngữ nghĩa topology cho phép đồ thị mô phỏng kết nối trục Z.
- `space_type` (unit / room / zone), `room_type` (living_room / bedroom / kitchen / ...) – phân loại không gian theo CityGML.
- `furniture_category` (sofa / table / chair / bed / ...) – phân loại nội thất.
- `is_accessible`, `is_locked`, `is_active` – các flag kiểm soát logic nghiệp vụ.

### 2.6.4 Bảng tổng hợp phân loại thuộc tính theo thực thể

**Bảng 2.21 – Thống kê số lượng thuộc tính theo từng nhóm cho mỗi thực thể**

| Thực thể | Không gian | Thời gian | Ngữ nghĩa |
|---|---|---|---|
| `buildings` | `location`, `footprint`, `address`, `ward`, `district`, `city`, `model_3d_url` (7) | `created_at`, `updated_at` (2) | `total_floors`, `lod_level` (2) |
| `floors` | `floor_number` (Z), `elevation`, `floor_plan`, `model_3d_url` (4) | `created_at`, `updated_at` (2) | – (0) |
| `apartments` | `area`, `indoor_model_url` (2) | `created_at`, `updated_at`, `deleted_at` (3) | `num_bedrooms`, `num_bathrooms`, `rental_price`, `status`, `indoor_lod_level` (5) |
| `apartment_spaces` | `boundary`, `model_3d_url` (2) | `created_at`, `updated_at` (2) | `space_type`, `room_type`, `lod_level` (3) |
| `navigation_nodes` | `location`, `local_x`, `local_y`, `local_z` (4) | `created_at`, `updated_at` (2) | `node_type` (1) |
| `navigation_edges` | `distance` (1) | `travel_time`, `created_at`, `updated_at` (3) | `edge_type`, `is_accessible` (2) |
| `furniture_catalog` | `default_width`, `default_depth`, `default_height`, `model_3d_url` (4) | `created_at`, `updated_at` (2) | `category`, `is_active` (2) |
| `furniture_layouts` | – (0) | `created_at`, `updated_at` (2) | `status`, `version` (2) |
| `furniture_items` | `position`, `rotation_x/y/z`, `scale_x/y/z` (7) | `created_at`, `updated_at` (2) | `is_locked` (1) |
| `tenants` | `address` (1) | `created_at`, `updated_at`, `deleted_at` (3) | – (0) |
| `rental_contracts` | – (0) | `start_date`, `end_date`, `created_at`, `updated_at`, `deleted_at` (5) | `monthly_rent`, `deposit`, `status` (3) |
| `payments` | – (0) | `payment_date`, `created_at`, `deleted_at` (3) | `amount`, `status` (2) |
| `apartment_status_history` | – (0) | `changed_at` (1) | `status` (1) |
| `users` | – (0) | `created_at`, `updated_at`, `deleted_at` (3) | `role`, `is_active` (2) |
| `auth_sessions` | – (0) | `expires_at`, `revoked_at`, `last_used_at`, `created_at`, `updated_at` (5) | – (0) |
| `apartment_access_grants` | – (0) | `expires_at`, `created_at`, `updated_at` (3) | `can_view_tenant`, `can_view_contract` (2) |

**Quan sát**: Bảng `furniture_items` và `buildings` có nhiều thuộc tính không gian nhất (7 thuộc tính mỗi bảng — nếu tính cả các trường địa chỉ hành chính của `buildings`), phản ánh hai thái cực trong mô hình: `buildings` neo tòa nhà ở quy mô đô thị (LoD0–LoD3), còn `furniture_items` tham số hóa chi tiết nội thất ở quy mô phòng (LoD4).
