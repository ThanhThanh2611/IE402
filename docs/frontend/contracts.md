# Quản lý hợp đồng thuê

Use Cases: UC18-21 — Chỉ Manager

## Trang quản lý hợp đồng (`/contracts`)

### Danh sách hợp đồng

- **API**: `GET /api/contracts`
- Hiển thị dạng bảng

#### Cột bảng

| Cột | Field | Ghi chú |
|---|---|---|
| Căn hộ | `apartmentId` | Hiển thị mã căn hộ (join hoặc populate) |
| Người thuê | `tenantId` | Hiển thị họ tên (join hoặc populate) |
| Ngày bắt đầu | `startDate` | Format: `dd/MM/yyyy` |
| Ngày kết thúc | `endDate` | Format: `dd/MM/yyyy` |
| Tiền thuê/tháng | `monthlyRent` | Format VND |
| Tiền cọc | `deposit` | Format VND |
| Trạng thái | `status` | Badge |
| Hành động | — | Xem, Sửa, Xóa |

#### Trạng thái hợp đồng

| Giá trị | Label tiếng Việt | Badge |
|---|---|---|
| `active` | Đang hiệu lực | Xanh lá |
| `expired` | Hết hạn | Xám |
| `cancelled` | Đã hủy | Đỏ |

---

### UC18 — Thêm hợp đồng

- Nút "Thêm hợp đồng" → mở Dialog
- **API**: `POST /api/contracts`
- **Lưu ý nghiệp vụ**: Khi tạo hợp đồng → backend tự động set căn hộ `status = rented`

#### Form fields

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Căn hộ | Select (`apartmentId`) | Có | Chỉ hiện căn hộ `available` |
| Người thuê | Select (`tenantId`) | Có | Cho phép tìm kiếm theo tên/CCCD |
| Ngày bắt đầu | DatePicker (`startDate`) | Có | |
| Ngày kết thúc | DatePicker (`endDate`) | Có | Phải sau ngày bắt đầu |
| Tiền thuê/tháng | Input number (`monthlyRent`) | Có | Có thể auto-fill từ giá thuê căn hộ |
| Tiền cọc | Input number (`deposit`) | Không | |
| Ghi chú | Textarea (`note`) | Không | |

### UC19 — Sửa hợp đồng

- Click "Sửa" → mở Dialog với dữ liệu fill sẵn
- **API**: `PUT /api/contracts/:id`
- Form fields giống thêm hợp đồng

### UC20 — Xóa hợp đồng

- Click "Xóa" → AlertDialog xác nhận
- Nội dung: "Bạn có chắc muốn xóa hợp đồng này? Căn hộ sẽ được chuyển về trạng thái Còn trống."
- **API**: `DELETE /api/contracts/:id` (soft delete)
- **Lưu ý nghiệp vụ**: Backend tự động set căn hộ `status = available`

### UC21 — Xem chi tiết hợp đồng

- Click "Xem" hoặc click hàng → mở Sheet/Dialog chi tiết
- **API**: `GET /api/contracts/:id`
- Hiển thị toàn bộ thông tin hợp đồng
- Section thêm: danh sách thanh toán của hợp đồng

---

## Thanh toán (trong chi tiết hợp đồng)

- **API**: `GET /api/payments?contractId=:id`
- Hiển thị bảng thanh toán bên trong trang chi tiết hợp đồng

#### Cột bảng thanh toán

| Cột | Field | Ghi chú |
|---|---|---|
| Ngày thanh toán | `paymentDate` | Format: `dd/MM/yyyy` |
| Số tiền | `amount` | Format VND |
| Trạng thái | `status` | Badge |
| Ghi chú | `note` | |
| Hành động | — | Sửa, Xóa |

#### Trạng thái thanh toán

| Giá trị | Label tiếng Việt | Badge |
|---|---|---|
| `pending` | Chờ thanh toán | Vàng |
| `paid` | Đã thanh toán | Xanh lá |
| `overdue` | Quá hạn | Đỏ |

#### Thêm thanh toán

- **API**: `POST /api/payments`
- Form: ngày thanh toán, số tiền, trạng thái, ghi chú
