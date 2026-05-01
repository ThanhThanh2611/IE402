# Cập nhật mục 2.4 – 2.5 (Checkpoint 4) cho khớp schema hiện tại

> Tài liệu này thay thế nội dung mục **2.4 Sơ đồ quan hệ đối tượng (ERD)** và **2.5 Mô hình quan hệ CSDL chi tiết** trong báo cáo Checkpoint 4. Schema tham chiếu: `backend/src/db/schema.ts`.

---

## 2.4 Sơ đồ quan hệ đối tượng (ERD)

### 2.4.1 Mô tả tổng quan ERD

Hệ thống 3D GIS Apartment Management System sử dụng PostgreSQL + PostGIS, gồm **16 thực thể** chia thành 5 nhóm chức năng:

**Nhóm 1 – Không gian & Tòa nhà (GIS core):**
- `buildings` – Tòa nhà: lưu định danh, địa chỉ, vị trí GIS dạng `geometry(PointZ, 4326)` và footprint dạng `geometry(PolygonZ, 4326)`.
- `floors` – Tầng: lưu thông tin tầng thuộc tòa nhà, có cao độ (`elevation`) và polygon mặt sàn.

**Nhóm 2 – Mạng lưới điều hướng 3D (Navigation graph):**
- `navigation_nodes` – Điểm giao cắt: cửa, thang máy, cầu thang, junction.
- `navigation_edges` – Cạnh nối: hành lang, cầu thang, thang máy — phục vụ tìm đường Dijkstra/A*.

**Nhóm 3 – Căn hộ & Không gian trong nhà (Indoor LoD4):**
- `apartments` – Căn hộ: thực thể trung tâm, liên kết với `entry_node_id` (terminal node).
- `apartment_spaces` – Không gian căn hộ: phân cấp (phòng/khu vực) bằng `parent_space_id`, có boundary PolygonZ.
- `apartment_access_grants` – Cấp quyền: cho phép user xem tenant/contract của căn hộ cụ thể.

**Nhóm 4 – Nội thất 3D (Catalog → Layout → Instance):**
- `furniture_catalog` – Thư viện đồ nội thất.
- `furniture_layouts` – Phiên bản bố cục (draft/published/archived).
- `furniture_items` – Instance nội thất được đặt trong layout.

**Nhóm 5 – Nghiệp vụ cho thuê & Quản trị:**
- `tenants` – Khách thuê (có thể liên kết tùy chọn với `users.id` qua `linked_user_id`).
- `rental_contracts` – Hợp đồng thuê.
- `payments` – Thanh toán.
- `apartment_status_history` – Audit log thay đổi trạng thái.
- `users` – Tài khoản hệ thống (Manager/User).
- `auth_sessions` – Phiên đăng nhập (refresh token rotation/revoke).

### 2.4.2 Phân biệt `users` và `tenants`

`users` và `tenants` là hai thực thể tách biệt, nhưng **có thể liên kết tùy chọn** qua `tenants.linked_user_id` (UNIQUE, FK → `users.id`) khi khách thuê đồng thời cần tài khoản truy cập hệ thống.

| Tiêu chí | `users` (Người dùng hệ thống) | `tenants` (Khách thuê) |
|---|---|---|
| Bản chất | Tài khoản đăng nhập | Đối tượng nghiệp vụ |
| Vai trò | `manager` / `user` (`role` enum) | Người ký hợp đồng |
| Thông tin lưu | username, password (hash), full_name, email, role, is_active | full_name, id_card (UNIQUE), phone, email, address |
| Liên kết | `auth_sessions`, `apartment_access_grants` | `tenants.linked_user_id → users.id` (tùy chọn) |
| Soft delete | `deleted_at` + `is_active` | `deleted_at` |

### 2.4.3 Các mối quan hệ trong ERD

| Thực thể cha | Thực thể con | Kiểu | Ràng buộc / Ghi chú |
|---|---|---|---|
| `buildings` | `floors` | 1–N | UNIQUE `(building_id, floor_number)` |
| `floors` | `apartments` | 1–N | `code` UNIQUE toàn cục |
| `floors` | `navigation_nodes` | 1–N | Mỗi node thuộc về một tầng (cao độ Z) |
| `navigation_nodes` | `navigation_edges` | 1–N | Cả `start_node_id` và `end_node_id` |
| `apartments` | `navigation_nodes` | N–1 | `entry_node_id` (cửa căn hộ) |
| `apartments` | `apartment_spaces` | **1–N** | UNIQUE `(apartment_id, name)` |
| `apartment_spaces` | `apartment_spaces` | 1–N | Cây phân cấp qua `parent_space_id` |
| `apartments` | `apartment_access_grants` | 1–N | UNIQUE `(apartment_id, user_id)` |
| `apartments` | `furniture_layouts` | 1–N | Nhiều phiên bản bố cục |
| `furniture_layouts` | `furniture_items` | 1–N | Instance trong layout |
| `furniture_catalog` | `furniture_items` | 1–N | Mỗi item tham chiếu một mẫu catalog |
| `apartment_spaces` | `furniture_items` | 1–N (tùy chọn) | `space_id` để gắn item vào phòng |
| `apartments` | `rental_contracts` | 1–N | Một căn có thể có nhiều hợp đồng theo thời gian |
| `tenants` | `rental_contracts` | 1–N | Một khách có thể ký nhiều hợp đồng |
| `rental_contracts` | `payments` | 1–N | Mỗi kỳ thu tiền |
| `apartments` | `apartment_status_history` | 1–N | Audit log bất biến |
| `users` | `apartments` | 1–N (ref) | `created_by_id`, `updated_by_id` |
| `users` | `rental_contracts` | 1–N (ref) | `created_by_id`, `updated_by_id` |
| `users` | `apartment_status_history` | 1–N (ref) | `changed_by_id` |
| `users` | `furniture_layouts` | 1–N (ref) | `created_by_id`, `updated_by_id` |
| `users` | `auth_sessions` | 1–N | `user_id` |
| `users` | `tenants` | 1–1 (tùy chọn) | `tenants.linked_user_id` UNIQUE |

**Soft delete** áp dụng cho 5 bảng: `users`, `apartments`, `tenants`, `rental_contracts`, `payments` qua trường `deleted_at`. `users` còn có thêm `is_active` để vô hiệu hóa tài khoản mà không xóa.

---

## 2.5 Mô hình quan hệ CSDL chi tiết

### 2.5.1 Bảng `buildings` – Tòa nhà

Lưu thông tin tòa nhà. Sử dụng PostGIS với SRID 4326 cho dữ liệu không gian 3D.

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | Khóa chính |
| `name` | VARCHAR(255) | NOT NULL | | Mô tả | Tên tòa nhà |
| `address` | VARCHAR(500) | NOT NULL | | Không gian | Địa chỉ chi tiết |
| `ward` | VARCHAR(100) | | | Không gian | Phường/Xã |
| `district` | VARCHAR(100) | | | Không gian | Quận/Huyện |
| `city` | VARCHAR(100) | | | Không gian | Thành phố/Tỉnh |
| `location` | geometry(PointZ, 4326) | NOT NULL | | Không gian | Tọa độ 3D (kinh độ, vĩ độ, cao độ) |
| `footprint` | geometry(PolygonZ, 4326) | | | Không gian | Polygon mặt bằng tòa nhà |
| `total_floors` | INTEGER | NOT NULL | | Ngữ nghĩa | Số tầng tổng cộng |
| `lod_level` | ENUM | NOT NULL, DEFAULT 'lod3' | | Ngữ nghĩa | Mức chi tiết: lod2/lod3/lod4 |
| `description` | TEXT | | | Mô tả | Mô tả chi tiết |
| `image_url` | VARCHAR(500) | | | Mô tả | URL ảnh đại diện |
| `model_3d_url` | VARCHAR(500) | | | Không gian | URL file glTF/GLB |
| `created_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Thời điểm tạo |
| `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | Thời điểm cập nhật |

### 2.5.2 Bảng `floors` – Tầng

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | Khóa chính |
| `building_id` | INTEGER | NOT NULL | FK→buildings | Định danh | Tòa nhà chứa tầng |
| `floor_number` | INTEGER | NOT NULL, UNIQUE* | | Không gian | Vị trí trục Z; UNIQUE `(building_id, floor_number)` |
| `elevation` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | | Không gian | Cao độ thực tế (m) |
| `floor_plan` | geometry(PolygonZ, 4326) | | | Không gian | Polygon mặt sàn |
| `model_3d_url` | VARCHAR(500) | | | Không gian | URL model 3D của tầng |
| `description` | TEXT | | | Mô tả | Mô tả bổ sung |
| `created_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |
| `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.3 Bảng `navigation_nodes` – Điểm giao cắt

Điểm trong mạng lưới topology phục vụ tìm đường 3D.

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `floor_id` | INTEGER | NOT NULL | FK→floors | Định danh | Tầng chứa node |
| `node_type` | ENUM | NOT NULL | | Ngữ nghĩa | door/elevator/stairs/junction |
| `label` | VARCHAR(255) | | | Mô tả | Nhãn hiển thị |
| `location` | geometry(PointZ, 4326) | NOT NULL | | Không gian | Tọa độ 3D toàn cục |
| `local_x` | DECIMAL(12,3) | | | Không gian | Tọa độ X cục bộ |
| `local_y` | DECIMAL(12,3) | | | Không gian | Tọa độ Y cục bộ |
| `local_z` | DECIMAL(12,3) | | | Không gian | Tọa độ Z cục bộ |
| `mesh_ref` | VARCHAR(255) | | | Mô tả | Tham chiếu mesh trong model 3D |
| `metadata` | JSONB | | | Mô tả | Thuộc tính mở rộng |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.4 Bảng `navigation_edges` – Cạnh nối

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `start_node_id` | INTEGER | NOT NULL | FK→navigation_nodes | Định danh | Node bắt đầu |
| `end_node_id` | INTEGER | NOT NULL | FK→navigation_nodes | Định danh | Node kết thúc |
| `edge_type` | ENUM | NOT NULL, DEFAULT 'hallway' | | Ngữ nghĩa | hallway/stairs/elevator |
| `distance` | DECIMAL(10,2) | NOT NULL | | Không gian | Khoảng cách (m) |
| `travel_time` | DECIMAL(10,2) | | | Thời gian | Thời gian di chuyển ước tính |
| `is_accessible` | BOOLEAN | NOT NULL, DEFAULT TRUE | | Ngữ nghĩa | Hỗ trợ người khuyết tật |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.5 Bảng `apartments` – Căn hộ

Thực thể trung tâm. Áp dụng soft delete.

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `floor_id` | INTEGER | NOT NULL | FK→floors | Định danh | Tầng chứa căn hộ |
| `entry_node_id` | INTEGER | | FK→navigation_nodes | Định danh | Node cửa căn hộ |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | | Định danh | Mã căn hộ (VD: A101) |
| `area` | DECIMAL(10,2) | NOT NULL | | Không gian | Diện tích (m²) |
| `num_bedrooms` | INTEGER | | | Ngữ nghĩa | Số phòng ngủ |
| `num_bathrooms` | INTEGER | | | Ngữ nghĩa | Số phòng tắm |
| `rental_price` | DECIMAL(15,2) | NOT NULL | | Ngữ nghĩa | Giá niêm yết (VND/tháng) |
| `status` | ENUM | NOT NULL, DEFAULT 'available' | | Ngữ nghĩa | available/rented/maintenance |
| `indoor_model_url` | VARCHAR(500) | | | Không gian | URL model 3D nội thất |
| `indoor_lod_level` | ENUM | DEFAULT 'lod4' | | Ngữ nghĩa | Mức chi tiết indoor |
| `description` | TEXT | | | Mô tả | |
| `created_by_id` | INTEGER | | FK→users | Định danh | Audit |
| `updated_by_id` | INTEGER | | FK→users | Định danh | Audit |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |
| `deleted_at` | TIMESTAMP | | | Thời gian | Soft delete |

### 2.5.6 Bảng `apartment_spaces` – Không gian trong căn hộ (1–N)

Phân cấp dạng cây thông qua `parent_space_id`. Quan hệ với `apartments` là **1–N**, không phải 1–1.

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `apartment_id` | INTEGER | NOT NULL, UNIQUE* | FK→apartments | Định danh | UNIQUE `(apartment_id, name)` |
| `parent_space_id` | INTEGER | | FK→apartment_spaces (self) | Định danh | Cây phân cấp |
| `name` | VARCHAR(255) | NOT NULL | | Định danh | Tên không gian |
| `space_type` | ENUM | NOT NULL, DEFAULT 'room' | | Ngữ nghĩa | unit/room/zone |
| `room_type` | ENUM | | | Ngữ nghĩa | living_room/bedroom/kitchen/bathroom/balcony/corridor/storage/other |
| `lod_level` | ENUM | NOT NULL, DEFAULT 'lod4' | | Ngữ nghĩa | |
| `boundary` | geometry(PolygonZ, 4326) | | | Không gian | Ranh giới 3D |
| `model_3d_url` | VARCHAR(500) | | | Không gian | |
| `metadata` | JSONB | | | Mô tả | |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.7 Bảng `apartment_access_grants` – Cấp quyền căn hộ

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `apartment_id` | INTEGER | NOT NULL, UNIQUE* | FK→apartments | Định danh | UNIQUE `(apartment_id, user_id)` |
| `user_id` | INTEGER | NOT NULL | FK→users | Định danh | Người được cấp quyền |
| `can_view_tenant` | BOOLEAN | NOT NULL, DEFAULT FALSE | | Ngữ nghĩa | |
| `can_view_contract` | BOOLEAN | NOT NULL, DEFAULT FALSE | | Ngữ nghĩa | |
| `expires_at` | TIMESTAMP | | | Thời gian | Hết hạn quyền |
| `granted_by_id` | INTEGER | | FK→users | Định danh | Manager cấp quyền |
| `note` | TEXT | | | Mô tả | |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.8 Bảng `furniture_catalog` – Thư viện đồ nội thất

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `code` | VARCHAR(100) | NOT NULL, UNIQUE | | Định danh | Mã catalog |
| `name` | VARCHAR(255) | NOT NULL | | Mô tả | Tên đồ nội thất |
| `category` | ENUM | NOT NULL, DEFAULT 'other' | | Ngữ nghĩa | sofa/table/chair/bed/cabinet/appliance/decor/other |
| `model_3d_url` | VARCHAR(500) | NOT NULL | | Không gian | URL model 3D |
| `default_width` | DECIMAL(10,2) | | | Không gian | |
| `default_depth` | DECIMAL(10,2) | | | Không gian | |
| `default_height` | DECIMAL(10,2) | | | Không gian | |
| `metadata` | JSONB | | | Mô tả | |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | | Ngữ nghĩa | |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.9 Bảng `furniture_layouts` – Phiên bản bố cục

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `apartment_id` | INTEGER | NOT NULL | FK→apartments | Định danh | |
| `name` | VARCHAR(255) | NOT NULL | | Mô tả | Tên layout |
| `status` | ENUM | NOT NULL, DEFAULT 'draft' | | Ngữ nghĩa | draft/published/archived |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | | Ngữ nghĩa | |
| `created_by_id` / `updated_by_id` | INTEGER | | FK→users | Định danh | Audit |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.10 Bảng `furniture_items` – Instance nội thất 3D

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `layout_id` | INTEGER | NOT NULL | FK→furniture_layouts | Định danh | |
| `space_id` | INTEGER | | FK→apartment_spaces | Định danh | Phòng/khu vực chứa item |
| `catalog_id` | INTEGER | NOT NULL | FK→furniture_catalog | Định danh | |
| `label` | VARCHAR(255) | | | Mô tả | |
| `position` | geometry(PointZ, 4326) | NOT NULL | | Không gian | Tọa độ 3D đặt item |
| `rotation_x/y/z` | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | | Không gian | Góc xoay 3 trục (độ) |
| `scale_x/y/z` | DECIMAL(8,2) | NOT NULL, DEFAULT 1 | | Không gian | Hệ số tỉ lệ 3 trục |
| `is_locked` | BOOLEAN | NOT NULL, DEFAULT FALSE | | Ngữ nghĩa | Khóa không cho di chuyển |
| `metadata` | JSONB | | | Mô tả | |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

### 2.5.11 Bảng `tenants` – Khách thuê

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `linked_user_id` | INTEGER | UNIQUE | FK→users | Định danh | Liên kết tài khoản (tùy chọn) |
| `full_name` | VARCHAR(255) | NOT NULL | | Mô tả | |
| `phone` | VARCHAR(20) | NOT NULL | | Mô tả | |
| `email` | VARCHAR(255) | | | Mô tả | |
| `id_card` | VARCHAR(20) | NOT NULL, UNIQUE | | Định danh | CCCD/CMND |
| `address` | VARCHAR(500) | | | Không gian | Địa chỉ thường trú |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |
| `deleted_at` | TIMESTAMP | | | Thời gian | Soft delete |

### 2.5.12 Bảng `rental_contracts` – Hợp đồng thuê

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `apartment_id` | INTEGER | NOT NULL | FK→apartments | Định danh | |
| `tenant_id` | INTEGER | NOT NULL | FK→tenants | Định danh | |
| `start_date` | DATE | NOT NULL | | Thời gian | Ngày bắt đầu hiệu lực |
| `end_date` | DATE | NOT NULL | | Thời gian | Ngày kết thúc |
| `monthly_rent` | DECIMAL(15,2) | NOT NULL | | Ngữ nghĩa | Giá thuê thực tế |
| `deposit` | DECIMAL(15,2) | | | Ngữ nghĩa | Tiền đặt cọc |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | | Ngữ nghĩa | active/expired/cancelled |
| `note` | TEXT | | | Mô tả | |
| `created_by_id` / `updated_by_id` | INTEGER | | FK→users | Định danh | Audit |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |
| `deleted_at` | TIMESTAMP | | | Thời gian | Soft delete |

### 2.5.13 Bảng `payments` – Thanh toán

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `contract_id` | INTEGER | NOT NULL | FK→rental_contracts | Định danh | |
| `amount` | DECIMAL(15,2) | NOT NULL | | Ngữ nghĩa | Số tiền (VND) |
| `payment_date` | DATE | NOT NULL | | Thời gian | Ngày thanh toán |
| `status` | ENUM | NOT NULL, DEFAULT 'paid' | | Ngữ nghĩa | pending/paid/overdue |
| `note` | TEXT | | | Mô tả | |
| `created_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |
| `deleted_at` | TIMESTAMP | | | Thời gian | Soft delete |

### 2.5.14 Bảng `apartment_status_history` – Lịch sử trạng thái

Audit log bất biến — không soft delete.

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `apartment_id` | INTEGER | NOT NULL | FK→apartments | Định danh | |
| `status` | ENUM | NOT NULL | | Ngữ nghĩa | apartment_status |
| `changed_by_id` | INTEGER | | FK→users | Định danh | Manager thực hiện |
| `changed_at` | TIMESTAMP | NOT NULL, DEFAULT now() | | Thời gian | |
| `note` | TEXT | | | Mô tả | Lý do thay đổi |

### 2.5.15 Bảng `users` – Người dùng hệ thống

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE | | Định danh | |
| `password` | VARCHAR(255) | NOT NULL | | Ngữ nghĩa | Hash bcrypt/argon2 |
| `full_name` | VARCHAR(255) | NOT NULL | | Mô tả | |
| `email` | VARCHAR(255) | UNIQUE | | Mô tả | |
| `role` | ENUM | NOT NULL, DEFAULT 'user' | | Ngữ nghĩa | user/manager |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | | Ngữ nghĩa | Vô hiệu hóa nhanh |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |
| `deleted_at` | TIMESTAMP | | | Thời gian | Soft delete |

### 2.5.16 Bảng `auth_sessions` – Phiên đăng nhập

| Thuộc tính | Kiểu DL | Ràng buộc | Khóa | Nhóm | Mô tả |
|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL, PK | PK | Định danh | |
| `user_id` | INTEGER | NOT NULL | FK→users | Định danh | |
| `refresh_token_hash` | VARCHAR(255) | NOT NULL, UNIQUE | | Định danh | Hash của refresh token |
| `expires_at` | TIMESTAMP | NOT NULL | | Thời gian | Hết hạn |
| `revoked_at` | TIMESTAMP | | | Thời gian | Đã thu hồi |
| `last_used_at` | TIMESTAMP | | | Thời gian | Lần dùng cuối |
| `user_agent` | TEXT | | | Mô tả | |
| `ip_address` | VARCHAR(255) | | | Mô tả | |
| `created_at` / `updated_at` | TIMESTAMP | DEFAULT now() | | Thời gian | |

---

## 2.6 Tổng hợp thay đổi so với Checkpoint 4 cũ

| # | Thay đổi | Lý do |
|---|---|---|
| 1 | Thay `latitude/longitude DECIMAL` bằng `location geometry(PointZ, 4326)` + `footprint geometry(PolygonZ, 4326)` trong `buildings` | Khai thác PostGIS cho truy vấn không gian 3D |
| 2 | Bổ sung `lod_level` (buildings, apartments, apartment_spaces, floors qua `model_3d_url`) | Quản lý mức chi tiết LoD2/LoD3/LoD4 |
| 3 | Thêm 2 bảng `navigation_nodes`, `navigation_edges` | Tìm đường 3D Dijkstra/A* (yêu cầu nghiệp vụ) |
| 4 | Thêm `entry_node_id` vào `apartments` | Liên kết căn hộ với mạng navigation |
| 5 | `apartment_spaces` chuyển từ 1–1 (canvas 2D) sang 1–N phân cấp 3D với `boundary` PolygonZ | Phù hợp mô hình Indoor LoD4 |
| 6 | Tách furniture thành 3 bảng: `furniture_catalog` + `furniture_layouts` + `furniture_items` | Hỗ trợ versioning bố cục, separation of concerns |
| 7 | `furniture_items` dùng `position` (PointZ) + `rotation_x/y/z` + `scale_x/y/z` thay cho `pos_x/pos_y/rotation_deg` 2D | Đặt nội thất trong không gian 3D thực |
| 8 | Bỏ `furniture_placements` | Đã được thay bằng `furniture_items` mới |
| 9 | Thêm `tenants.linked_user_id` (UNIQUE, tùy chọn) | Cho phép khách thuê có tài khoản đăng nhập |
| 10 | Thêm `users.is_active` | Vô hiệu hóa nhanh không cần soft delete |
| 11 | Thêm `auth_sessions` | Refresh token rotation/revoke |
| 12 | Thêm `apartment_access_grants` | Cấp quyền chi tiết theo căn hộ |
| 13 | `floors` bổ sung `elevation`, `floor_plan`, `model_3d_url` | Render 3D từng tầng độc lập |
