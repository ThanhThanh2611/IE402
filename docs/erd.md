# ERD - 3D GIS Apartment Management System

## Tổng quan

Hệ thống gồm **15 bảng** và **11 enum**, mô tả dữ liệu quản lý cho thuê chung cư tích hợp GIS 3D, mạng lưới navigation, phân quyền truy cập theo căn hộ và mô hình không gian nội thất LoD4.

### Sơ đồ quan hệ

```
users
  │
  ├──< apartments (created_by_id, updated_by_id)
  ├──< tenants (linked_user_id)
  ├──< apartment_access_grants (user_id, granted_by_id)
  ├──< rental_contracts (created_by_id, updated_by_id)
  ├──< apartment_status_history (changed_by_id)
  ├──< furniture_layouts (created_by_id, updated_by_id)
  └──< furniture_items (indirectly through layouts)

buildings
  └──< floors
        ├──< navigation_nodes
        │     ├──< navigation_edges (start_node_id, end_node_id)
        │     └──< apartments (entry_node_id)
        └──< apartments
              ├──< apartment_spaces
              │     ├──< apartment_spaces (parent_space_id)
              │     └──< furniture_items
              ├──< furniture_layouts
              ├──< rental_contracts
              └──< apartment_status_history

tenants
  └──< rental_contracts
        └──< payments

furniture_catalog
  └──< furniture_items
```

> `──<` nghĩa là quan hệ 1-n (một-nhiều)

---

## Chi tiết các bảng

### 1. `buildings` — Tòa nhà

Lưu thông tin tòa nhà và tọa độ GIS để hiển thị trên bản đồ.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | ID tự tăng |
| name | varchar(255) | Yes | Tên tòa nhà |
| address | varchar(500) | Yes | Địa chỉ đầy đủ |
| ward | varchar(100) | No | Phường/Xã |
| district | varchar(100) | No | Quận/Huyện |
| city | varchar(100) | No | Thành phố/Tỉnh |
| location | geometry(PointZ, 4326) | Yes | Tọa độ GIS 3D (PostGIS PointZ, SRID 4326) |
| footprint | geometry(PolygonZ, 4326) | No | Footprint chi tiết của tòa nhà để render GIS/3D chính xác hơn |
| total_floors | integer | Yes | Tổng số tầng |
| lod_level | lod_level | Yes | Mức độ chi tiết mô hình tòa nhà (mặc định `lod3`) |
| description | text | No | Mô tả |
| image_url | varchar(500) | No | URL hình ảnh |
| model_3d_url | varchar(500) | No | URL mô hình 3D (.glb/.gltf) |
| created_at | timestamp | Auto | Ngày tạo |
| updated_at | timestamp | Auto | Ngày cập nhật |

**Ghi chú:**
- Các cột `ward`, `district`, `city` được tách ra từ `address` để hỗ trợ lọc tòa nhà theo khu vực (UC03).
- Cột `location` sử dụng PostGIS `geometry(PointZ, 4326)` thay vì decimal lat/lng. Khi tạo/cập nhật, truyền `longitude` và `latitude` trong body → BE tự chuyển thành `ST_SetSRID(ST_MakePoint(lng, lat, z), 4326)`. Giá trị Z cho buildings mặc định là 0.
- Cột `lod_level` giúp phân biệt dữ liệu tòa nhà đang ở mức chi tiết LoD2 hay LoD3.

---

### 2. `floors` — Tầng

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| building_id | integer | FK → buildings | Tòa nhà chứa tầng |
| floor_number | integer | Yes | Số tầng |
| elevation | decimal(10,2) | Yes | Cao độ sàn tầng trong không gian 3D |
| floor_plan | geometry(PolygonZ, 4326) | No | Hình học mặt bằng của tầng |
| model_3d_url | varchar(500) | No | Model 3D riêng cho tầng |
| description | text | No | Mô tả |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

**Ràng buộc:** `(building_id, floor_number)` là UNIQUE — không trùng số tầng trong cùng tòa nhà.

---

### 3. `navigation_nodes` — Điểm giao cắt trong mạng lưới tòa nhà

Lưu các điểm quan trọng: cửa căn hộ, thang máy, cầu thang, sảnh tầng.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| floor_id | integer | FK → floors | Tầng chứa node |
| node_type | node_type | Yes | Loại node: door, elevator, stairs, junction |
| label | varchar(255) | No | Nhãn mô tả |
| location | geometry(PointZ, 4326) | Yes | Tọa độ 3D (z xác định cao độ tầng) |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

---

### 4. `navigation_edges` — Đường nối giữa các nodes

Lưu các đường nối (hành lang, cầu thang liên tầng, thang máy liên tầng), phục vụ thuật toán Dijkstra/A*.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| start_node_id | integer | FK → navigation_nodes | Node đầu |
| end_node_id | integer | FK → navigation_nodes | Node cuối |
| edge_type | edge_type | Yes | Loại cạnh: hallway, stairs, elevator (mặc định: hallway) |
| distance | decimal(10,2) | Yes | Khoảng cách (m) — trọng số cho tìm đường |
| travel_time | decimal(10,2) | No | Thời gian di chuyển (giây) |
| is_accessible | boolean | Yes | Có thể đi qua không (false khi hỏa hoạn, bảo trì). Mặc định: true |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

---

### 5. `apartments` — Căn hộ 🔒

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| floor_id | integer | FK → floors | Tầng chứa căn hộ |
| entry_node_id | integer | FK → navigation_nodes | Node cửa vào — terminal node trong mạng navigation |
| code | varchar(50) | Yes, UNIQUE | Mã căn hộ (VD: A-101) |
| area | decimal(10,2) | Yes | Diện tích (m2) |
| num_bedrooms | integer | No | Số phòng ngủ |
| num_bathrooms | integer | No | Số phòng tắm |
| rental_price | decimal(15,2) | Yes | Giá thuê (VND/tháng) |
| status | apartment_status | Yes | Trạng thái (mặc định: available) |
| indoor_model_url | varchar(500) | No | URL mô hình không gian bên trong căn hộ |
| indoor_lod_level | lod_level | No | Mức LoD cho dữ liệu indoor, mặc định `lod4` |
| description | text | No | Mô tả |
| created_by_id | integer | FK → users | Manager tạo |
| updated_by_id | integer | FK → users | Manager cập nhật |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

---

### 6. `tenants` — Người thuê 🔒

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| linked_user_id | integer | FK → users | Liên kết tùy chọn đến account đăng nhập nếu khách thuê có tài khoản |
| full_name | varchar(255) | Yes | Họ tên |
| phone | varchar(20) | Yes | Số điện thoại |
| email | varchar(255) | No | Email |
| id_card | varchar(20) | Yes, UNIQUE | Số CCCD/CMND |
| address | varchar(500) | No | Địa chỉ thường trú |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

**Ghi chú:**
- `users` là tài khoản truy cập hệ thống.
- `tenants` là thực thể nghiệp vụ khách thuê.
- Một khách thuê có thể không có tài khoản đăng nhập, nên `linked_user_id` là tùy chọn.

---

### 7. `rental_contracts` — Hợp đồng thuê 🔒

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| apartment_id | integer | FK → apartments | Căn hộ cho thuê |
| tenant_id | integer | FK → tenants | Người thuê |
| start_date | date | Yes | Ngày bắt đầu |
| end_date | date | Yes | Ngày kết thúc |
| monthly_rent | decimal(15,2) | Yes | Giá thuê thực tế (VND/tháng) |
| deposit | decimal(15,2) | No | Tiền đặt cọc |
| status | contract_status | Yes | Trạng thái (mặc định: active) |
| note | text | No | Ghi chú |
| created_by_id | integer | FK → users | Manager tạo |
| updated_by_id | integer | FK → users | Manager cập nhật |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

**Logic nghiệp vụ:**
- Khi tạo hợp đồng → apartment.status tự động chuyển thành `rented`
- Khi xóa hợp đồng → apartment.status tự động chuyển về `available`

---

### 8. `apartment_access_grants` — Phân quyền truy cập theo căn hộ

Cho phép cấp quyền xem tenant/hợp đồng cho từng `user` trên từng `apartment`, thay vì chỉ dựa trên role toàn cục.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| apartment_id | integer | FK → apartments | Căn hộ được cấp quyền |
| user_id | integer | FK → users | Người dùng được cấp quyền |
| can_view_tenant | boolean | Yes | Xem tenant đầy đủ |
| can_view_contract | boolean | Yes | Xem hợp đồng |
| expires_at | timestamp | No | Thời hạn grant |
| granted_by_id | integer | FK → users | Manager cấp quyền |
| note | text | No | Ghi chú |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

**Ràng buộc:** `(apartment_id, user_id)` là UNIQUE.

---

### 9. `payments` — Thanh toán 🔒

Lưu lịch sử thanh toán thực tế, phục vụ thống kê doanh thu (UC24, UC25).

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| contract_id | integer | FK → rental_contracts | Hợp đồng liên quan |
| amount | decimal(15,2) | Yes | Số tiền (VND) |
| payment_date | date | Yes | Ngày thanh toán |
| status | payment_status | Yes | Trạng thái (mặc định: paid) |
| note | text | No | Ghi chú |
| created_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

---

### 10. `apartment_status_history` — Lịch sử trạng thái căn hộ

Lưu vết mỗi lần thay đổi trạng thái căn hộ, phục vụ thống kê tỷ lệ lấp đầy theo thời gian (UC25).

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| apartment_id | integer | FK → apartments | Căn hộ |
| status | apartment_status | Yes | Trạng thái mới |
| changed_by_id | integer | FK → users | Manager thay đổi |
| changed_at | timestamp | Yes | Thời điểm thay đổi |
| note | text | No | Ghi chú |

---

### 11. `users` — Tài khoản người dùng 🔒

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| username | varchar(100) | Yes, UNIQUE | Tên đăng nhập |
| password | varchar(255) | Yes | Mật khẩu |
| full_name | varchar(255) | Yes | Họ tên |
| email | varchar(255) | UNIQUE | Email |
| role | user_role | Yes | Vai trò (mặc định: user) |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

---

### 12. `apartment_spaces` — Không gian trong căn hộ

Mô hình hóa không gian bên trong căn hộ ở mức LoD4: căn hộ, phòng và các zone con để phục vụ hiển thị indoor 3D và kiểm tra hợp lệ khi đặt nội thất.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| apartment_id | integer | FK → apartments | Căn hộ chứa không gian |
| parent_space_id | integer | FK → apartment_spaces | Không gian cha, phục vụ mô hình phân cấp |
| name | varchar(255) | Yes | Tên không gian |
| space_type | indoor_space_type | Yes | `unit`, `room`, `zone` |
| room_type | room_type | No | Ngữ nghĩa không gian phòng |
| lod_level | lod_level | Yes | Mặc định `lod4` |
| boundary | geometry(PolygonZ,4326) | No | Ranh giới 3D của không gian |
| model_3d_url | varchar(500) | No | Model 3D chi tiết của phòng/zone |
| metadata | jsonb | No | Thuộc tính mở rộng |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

**Ràng buộc:** `(apartment_id, name)` là UNIQUE.

---

### 13. `furniture_catalog` — Danh mục nội thất

Thư viện nội thất để user/manager kéo thả vào mô hình indoor.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| code | varchar(100) | Yes, UNIQUE | Mã nội thất |
| name | varchar(255) | Yes | Tên hiển thị |
| category | furniture_category | Yes | Phân loại nội thất |
| model_3d_url | varchar(500) | Yes | URL model 3D |
| default_width | decimal(10,2) | No | Kích thước mặc định |
| default_depth | decimal(10,2) | No | Kích thước mặc định |
| default_height | decimal(10,2) | No | Kích thước mặc định |
| metadata | jsonb | No | Thuộc tính mở rộng |
| is_active | boolean | Yes | Có cho phép dùng không |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

---

### 14. `furniture_layouts` — Bố cục nội thất

Lưu các phiên bản bố trí nội thất của một căn hộ.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| apartment_id | integer | FK → apartments | Căn hộ áp dụng layout |
| name | varchar(255) | Yes | Tên layout |
| status | furniture_layout_status | Yes | `draft`, `published`, `archived` |
| version | integer | Yes | Số phiên bản |
| created_by_id | integer | FK → users | Người tạo |
| updated_by_id | integer | FK → users | Người cập nhật cuối |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

---

### 15. `furniture_items` — Vật thể nội thất đã đặt

Lưu từng instance nội thất trong layout, bao gồm vị trí 3D, góc xoay và tỉ lệ, phục vụ use case kéo-thả.

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| layout_id | integer | FK → furniture_layouts | Layout chứa item |
| space_id | integer | FK → apartment_spaces | Không gian chứa item |
| catalog_id | integer | FK → furniture_catalog | Mẫu nội thất gốc |
| label | varchar(255) | No | Tên gợi nhớ |
| position | geometry(PointZ, 4326) | Yes | Vị trí đặt nội thất |
| rotation_x | decimal(8,2) | Yes | Góc xoay theo X |
| rotation_y | decimal(8,2) | Yes | Góc xoay theo Y |
| rotation_z | decimal(8,2) | Yes | Góc xoay theo Z |
| scale_x | decimal(8,2) | Yes | Tỉ lệ theo X |
| scale_y | decimal(8,2) | Yes | Tỉ lệ theo Y |
| scale_z | decimal(8,2) | Yes | Tỉ lệ theo Z |
| is_locked | boolean | Yes | Khóa item |
| metadata | jsonb | No | Thuộc tính mở rộng như trạng thái va chạm |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

---

## Enum

### `apartment_status`
| Giá trị | Mô tả |
|---------|-------|
| available | Còn trống |
| rented | Đã thuê |
| maintenance | Đang bảo trì |

### `contract_status`
| Giá trị | Mô tả |
|---------|-------|
| active | Đang hiệu lực |
| expired | Hết hạn |
| cancelled | Đã hủy |

### `payment_status`
| Giá trị | Mô tả |
|---------|-------|
| pending | Chờ thanh toán |
| paid | Đã thanh toán |
| overdue | Quá hạn |

### `user_role`
| Giá trị | Mô tả |
|---------|-------|
| user | Người dùng thông thường |
| manager | Quản lý |

### `lod_level`
| Giá trị | Mô tả |
|---------|-------|
| lod2 | Mô hình khối cơ bản |
| lod3 | Mô hình kiến trúc ngoài nhà |
| lod4 | Mô hình không gian bên trong và nội thất |

### `indoor_space_type`
| Giá trị | Mô tả |
|---------|-------|
| unit | Toàn bộ căn hộ |
| room | Phòng chức năng |
| zone | Vùng con trong phòng |

### `room_type`
| Giá trị | Mô tả |
|---------|-------|
| living_room | Phòng khách |
| bedroom | Phòng ngủ |
| kitchen | Bếp |
| bathroom | WC/Phòng tắm |
| balcony | Ban công |
| corridor | Hành lang/lối đi |
| storage | Kho |
| other | Khác |

### `furniture_category`
| Giá trị | Mô tả |
|---------|-------|
| sofa | Sofa |
| table | Bàn |
| chair | Ghế |
| bed | Giường |
| cabinet | Tủ/Kệ |
| appliance | Thiết bị |
| decor | Trang trí |
| other | Khác |

### `furniture_layout_status`
| Giá trị | Mô tả |
|---------|-------|
| draft | Bản nháp |
| published | Đã công bố |
| archived | Lưu trữ |

### `node_type`
| Giá trị | Mô tả |
|---------|-------|
| door | Cửa căn hộ (terminal node) |
| elevator | Thang máy |
| stairs | Cầu thang |
| junction | Sảnh/điểm giao cắt |

### `edge_type`
| Giá trị | Mô tả |
|---------|-------|
| hallway | Hành lang cùng tầng |
| stairs | Cầu thang liên tầng |
| elevator | Thang máy liên tầng |

---

## Xóa mềm (Soft Delete)

Các bảng có đánh dấu 🔒 sử dụng xóa mềm qua cột `deleted_at`:
- `NULL` → bản ghi đang hoạt động
- Có giá trị → bản ghi đã bị xóa

Dữ liệu không bị xóa khỏi DB, đảm bảo giữ nguyên lịch sử cho audit trail và thống kê.

---

## File DBML

Xem file ERD gốc định dạng DBML tại: [`docs/erd.dbml`](./erd.dbml)
