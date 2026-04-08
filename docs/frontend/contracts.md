# Quản lý hợp đồng thuê

Use Cases: UC18-21

## 1. Trang quản lý hợp đồng (`/contracts`) - Chỉ Manager

FE hiện có trang quản lý hợp đồng riêng chỉ dành cho `Manager`. Route này được bảo vệ bởi `ManagerRoute`, nên người dùng thông thường không vào được màn hình CRUD hợp đồng.

### Danh sách hợp đồng

- **API**: `GET /api/contracts`
- Hiển thị dạng bảng

#### Cột chính

| Cột | Field |
|---|---|
| Căn hộ | `apartmentId` / thông tin apartment |
| Người thuê | `tenantId` / thông tin tenant |
| Ngày bắt đầu | `startDate` |
| Ngày kết thúc | `endDate` |
| Tiền thuê/tháng | `monthlyRent` |
| Tiền cọc | `deposit` |
| Trạng thái | `status` |
| Hành động | xem, sửa, xóa |

#### Trạng thái hợp đồng

| Giá trị | Label tiếng Việt |
|---|---|
| `active` | Đang hiệu lực |
| `expired` | Hết hạn |
| `cancelled` | Đã hủy |

### UC18 - Thêm hợp đồng

- **API**: `POST /api/contracts`
- FE mở dialog form để tạo hợp đồng mới
- Khi chọn căn hộ, giá thuê có thể được auto-fill từ dữ liệu apartment
- Backend tự động cập nhật trạng thái căn hộ sang `rented`

### UC19 - Sửa hợp đồng

- **API**: `PUT /api/contracts/:id`
- FE dùng lại form create/edit

### UC20 - Xóa hợp đồng

- **API**: `DELETE /api/contracts/:id`
- Backend dùng soft delete và tự động trả trạng thái căn hộ về `available`

### UC21 - Xem chi tiết hợp đồng

- **API**: `GET /api/contracts/:id`
- Trên trang quản lý, FE dùng endpoint này để xem chi tiết hợp đồng khi cần

## 2. Khác biệt giữa quyền backend và UI hiện tại

Backend hiện đã mở `GET /api/contracts/:id` cho các trường hợp có quyền theo ngữ cảnh:
- `Manager`
- tenant được liên kết tài khoản
- user có `apartment_access_grants`

Tuy nhiên FE hiện chưa có trang hợp đồng riêng cho user cuối. Việc hiển thị thông tin hợp đồng với user đang diễn ra gián tiếp trong:
- trang chi tiết tòa nhà
- trang chi tiết căn hộ

Nói cách khác, backend đã hỗ trợ đọc hợp đồng theo quyền hẹp hơn role, còn FE management page `/contracts` vẫn là màn hình tác nghiệp của manager.

## 3. Thanh toán liên quan đến hợp đồng

FE quản lý thanh toán ở route riêng `/payments`, không nhúng bảng thanh toán ngay trong `/contracts` theo dạng trang detail lớn như mô tả thiết kế ban đầu.

Các API liên quan:
- `GET /api/payments`
- `POST /api/payments`
- `PUT /api/payments/:id`
- `DELETE /api/payments/:id`
