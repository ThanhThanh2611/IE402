# Quản lý căn hộ

Use Cases: UC10-17

## 1. Xem chi tiết căn hộ (`/buildings/:id/apartments/:apartmentId`)

### UC10-13 — Thông tin chi tiết căn hộ

**API**: `GET /api/apartments/:apartmentId`

Trang hiển thị đầy đủ thông tin một căn hộ.

### Các section trên trang

#### Thông tin cơ bản

| Trường | Mô tả | Hiển thị |
|---|---|---|
| Mã căn hộ | `code` | Text |
| Diện tích | `area` | `XX m²` |
| Số phòng ngủ | `numBedrooms` | Number |
| Số phòng tắm | `numBathrooms` | Number |
| Giá thuê | `rentalPrice` | Format VND: `XX.XXX.XXX đ/tháng` |
| Trạng thái | `status` | Badge (xem bảng màu bên dưới) |
| Mô tả | `description` | Text paragraph |

#### Trạng thái căn hộ (UC11)

| Giá trị | Label tiếng Việt | Badge |
|---|---|---|
| `available` | Còn trống | Xanh lá |
| `rented` | Đã thuê | Đỏ |
| `maintenance` | Đang bảo trì | Xám |

#### Giá thuê (UC12)

- Hiển thị `rentalPrice` format tiền VND (dùng `Intl.NumberFormat('vi-VN')`)
- Đơn vị: **đ/tháng**

#### Thông tin người thuê (UC13)

- Chỉ hiển thị khi `status = rented`
- Lấy từ hợp đồng đang active của căn hộ: `GET /api/contracts` (filter theo apartmentId)
- Từ contract lấy `tenantId` → `GET /api/tenants/:tenantId`
- Hiển thị: họ tên, SĐT, email, CCCD

---

## 2. Quản lý căn hộ (`/apartments`) — Chỉ Manager

### Danh sách căn hộ

- **API**: `GET /api/apartments?floorId=X`
- Hiển thị dạng bảng (`Table` component)
- Cho phép chọn tòa nhà → chọn tầng → xem danh sách căn hộ
- Có thể dùng 2 dropdown filter: Tòa nhà, Tầng

#### Cột bảng

| Cột | Field | Ghi chú |
|---|---|---|
| Mã | `code` | |
| Diện tích | `area` | `XX m²` |
| Phòng ngủ | `numBedrooms` | |
| Giá thuê | `rentalPrice` | Format VND |
| Trạng thái | `status` | Badge màu |
| Hành động | — | Nút Sửa, Xóa |

### UC14 — Thêm căn hộ

- Nút "Thêm căn hộ" → mở Dialog
- **API**: `POST /api/apartments`

#### Form fields

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Tầng | Select (`floorId`) | Có | Chọn tòa nhà trước → load tầng |
| Mã căn hộ | Input text (`code`) | Có | Unique |
| Diện tích (m²) | Input number (`area`) | Có | |
| Số phòng ngủ | Input number (`numBedrooms`) | Không | |
| Số phòng tắm | Input number (`numBathrooms`) | Không | |
| Giá thuê (VND/tháng) | Input number (`rentalPrice`) | Có | |
| Mô tả | Textarea (`description`) | Không | |

### UC15 — Sửa căn hộ

- Click nút "Sửa" trên hàng → mở Dialog với dữ liệu đã fill sẵn
- **API**: `PUT /api/apartments/:id`
- Form fields giống thêm căn hộ

### UC16 — Xóa căn hộ

- Click nút "Xóa" → hiện AlertDialog xác nhận
- Nội dung: "Bạn có chắc muốn xóa căn hộ [code]?"
- **API**: `DELETE /api/apartments/:id` (soft delete)
- Sau khi xóa → refresh danh sách

### UC17 — Cập nhật trạng thái

- Click badge trạng thái hoặc nút riêng → hiện Popover/Select chọn trạng thái mới
- **API**: `PATCH /api/apartments/:id/status`
- Body: `{ "status": "available" | "rented" | "maintenance" }`
- Hiện toast thông báo thành công
