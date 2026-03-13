# ERD - 3D GIS Apartment Management System

## Tổng quan

Hệ thống gồm **8 bảng** và **4 enum**, mô tả dữ liệu quản lý cho thuê chung cư tích hợp GIS.

### Sơ đồ quan hệ

```
users
  │
  ├──< apartments (created_by_id, updated_by_id)
  ├──< rental_contracts (created_by_id, updated_by_id)
  └──< apartment_status_history (changed_by_id)

buildings
  └──< floors
        └──< apartments
              ├──< rental_contracts
              └──< apartment_status_history

tenants
  └──< rental_contracts
        └──< payments
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
| location | geometry(Point, 4326) | Yes | Tọa độ GIS (PostGIS Point, SRID 4326) |
| total_floors | integer | Yes | Tổng số tầng |
| description | text | No | Mô tả |
| image_url | varchar(500) | No | URL hình ảnh |
| model_3d_url | varchar(500) | No | URL mô hình 3D (.glb/.gltf) |
| created_at | timestamp | Auto | Ngày tạo |
| updated_at | timestamp | Auto | Ngày cập nhật |

**Ghi chú:**
- Các cột `ward`, `district`, `city` được tách ra từ `address` để hỗ trợ lọc tòa nhà theo khu vực (UC03).
- Cột `location` sử dụng PostGIS `geometry(Point, 4326)` thay vì decimal lat/lng. Khi tạo/cập nhật, truyền `longitude` và `latitude` trong body → BE tự chuyển thành `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.

---

### 2. `floors` — Tầng

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| building_id | integer | FK → buildings | Tòa nhà chứa tầng |
| floor_number | integer | Yes | Số tầng |
| description | text | No | Mô tả |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |

**Ràng buộc:** `(building_id, floor_number)` là UNIQUE — không trùng số tầng trong cùng tòa nhà.

---

### 3. `apartments` — Căn hộ 🔒

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| floor_id | integer | FK → floors | Tầng chứa căn hộ |
| code | varchar(50) | Yes, UNIQUE | Mã căn hộ (VD: A-101) |
| area | decimal(10,2) | Yes | Diện tích (m2) |
| num_bedrooms | integer | No | Số phòng ngủ |
| num_bathrooms | integer | No | Số phòng tắm |
| rental_price | decimal(15,2) | Yes | Giá thuê (VND/tháng) |
| status | apartment_status | Yes | Trạng thái (mặc định: available) |
| description | text | No | Mô tả |
| created_by_id | integer | FK → users | Manager tạo |
| updated_by_id | integer | FK → users | Manager cập nhật |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

---

### 4. `tenants` — Người thuê 🔒

| Cột | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | serial | PK | |
| full_name | varchar(255) | Yes | Họ tên |
| phone | varchar(20) | Yes | Số điện thoại |
| email | varchar(255) | No | Email |
| id_card | varchar(20) | Yes, UNIQUE | Số CCCD/CMND |
| address | varchar(500) | No | Địa chỉ thường trú |
| created_at | timestamp | Auto | |
| updated_at | timestamp | Auto | |
| deleted_at | timestamp | No | Xóa mềm |

---

### 5. `rental_contracts` — Hợp đồng thuê 🔒

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

### 6. `payments` — Thanh toán 🔒

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

### 7. `apartment_status_history` — Lịch sử trạng thái căn hộ

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

### 8. `users` — Tài khoản người dùng 🔒

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

---

## Xóa mềm (Soft Delete)

Các bảng có đánh dấu 🔒 sử dụng xóa mềm qua cột `deleted_at`:
- `NULL` → bản ghi đang hoạt động
- Có giá trị → bản ghi đã bị xóa

Dữ liệu không bị xóa khỏi DB, đảm bảo giữ nguyên lịch sử cho audit trail và thống kê.

---

## File DBML

Xem file ERD gốc định dạng DBML tại: [`docs/erd.dbml`](./erd.dbml)
