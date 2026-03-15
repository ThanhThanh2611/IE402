# Hướng dẫn sử dụng — Vai trò Manager

## Tổng quan

Manager có **toàn quyền** trên hệ thống: xem tất cả thông tin của User + thêm/sửa/xóa dữ liệu + quản lý người dùng.

## Các chức năng

### 1. Dashboard (`/dashboard`)
Giống User — xem thống kê tổng quan, biểu đồ tỷ lệ lấp đầy và doanh thu.

### 2. Bản đồ GIS (`/map`) *(sắp ra mắt)*
Giống User — xem bản đồ, lọc tòa nhà, xem chi tiết.

### 3. Quản lý căn hộ (`/apartments`)
- **Xem danh sách**: Bảng hiển thị mã, vị trí (tòa nhà + tầng), diện tích, phòng ngủ, giá thuê, trạng thái
- **Lọc**: Dropdown chọn tòa nhà → dropdown chọn tầng (tự động lọc theo tòa nhà đã chọn)
- **Thêm căn hộ**: Nhấn nút "Thêm căn hộ" → điền form (tầng, mã, diện tích, phòng ngủ, phòng tắm, giá thuê, mô tả)
- **Sửa căn hộ**: Nhấn icon bút chì → form pre-fill → sửa → Lưu
- **Xóa căn hộ**: Nhấn icon thùng rác → xác nhận → xóa mềm (soft delete)
- **Đổi trạng thái**: Click vào badge trạng thái trong bảng → chọn: Còn trống / Đã thuê / Bảo trì

> **Lưu ý**: Trạng thái căn hộ tự động thay đổi khi tạo/xóa hợp đồng (xem mục Hợp đồng).

### 4. Quản lý hợp đồng (`/contracts`)
- **Xem danh sách**: Bảng hiển thị căn hộ, người thuê, ngày bắt đầu/kết thúc, tiền thuê, trạng thái
- **Thêm hợp đồng**: Nhấn "Thêm hợp đồng" → chọn căn hộ (chỉ hiện căn "Còn trống"), người thuê, ngày, tiền thuê, tiền cọc
  - **Tự động**: Khi chọn căn hộ, tiền thuê/tháng tự điền theo giá thuê của căn hộ
  - **Tự động**: Khi tạo thành công → căn hộ chuyển trạng thái thành "Đã thuê"
- **Sửa hợp đồng**: Icon bút chì → sửa → Lưu
- **Xóa hợp đồng**: Icon thùng rác → xác nhận → xóa mềm
  - **Tự động**: Khi xóa → căn hộ chuyển về "Còn trống"
- **Trạng thái**: Đang hoạt động (xanh) / Hết hạn (xám) / Đã hủy (đỏ)

### 5. Quản lý người thuê (`/tenants`)
- **Xem danh sách**: Họ tên, SĐT, email, CCCD, địa chỉ
- **Thêm**: Nhấn "Thêm người thuê" → điền form (họ tên, SĐT, CCCD, email, địa chỉ)
  - **Validation**: SĐT phải đúng format 10 số bắt đầu bằng 0, CCCD phải 12 chữ số
- **Sửa/Xóa**: Tương tự

> **Liên quan**: Người thuê được gắn vào hợp đồng. Cần tạo người thuê trước khi tạo hợp đồng cho họ.

### 6. Quản lý thanh toán (`/payments`)
- **Xem danh sách**: Hợp đồng (mã căn hộ - tên người thuê), ngày, số tiền, trạng thái, ghi chú
- **Thêm thanh toán**: Chọn hợp đồng (chỉ hiện hợp đồng đang hoạt động) → số tiền tự điền theo tiền thuê hợp đồng → chọn ngày, trạng thái, ghi chú
- **Trạng thái**: Chờ thanh toán (vàng) / Đã thanh toán (xanh) / Quá hạn (đỏ)
- **Sửa/Xóa**: Tương tự

> **Liên quan**: Thanh toán thuộc về hợp đồng. Doanh thu trên Dashboard được tính từ các thanh toán có status "Đã thanh toán".

### 7. Quản lý người dùng (`/users`)
- **Xem danh sách**: Username, họ tên, email, vai trò (User/Manager), trạng thái (Hoạt động/Vô hiệu)
- **Thêm người dùng**: Username (tối thiểu 3 ký tự), mật khẩu (tối thiểu 6 ký tự), họ tên, email, vai trò
- **Sửa**: Chỉ sửa thông tin cơ bản (không sửa mật khẩu)
- **Xóa**: Soft delete
- **Kích hoạt / Vô hiệu hóa**: Nhấn icon người → toggle trạng thái
  - Tài khoản bị vô hiệu hóa **không thể đăng nhập**

## Sidebar menu (Manager)

Manager thấy đầy đủ menu:

**Tổng quan:**
- Bản đồ
- Dashboard

**Quản lý:**
- Căn hộ
- Hợp đồng
- Người thuê
- Thanh toán
- Người dùng

## Quy trình nghiệp vụ chính

### Cho thuê căn hộ mới
```
1. Tạo người thuê (nếu chưa có) → /tenants
2. Tạo hợp đồng: chọn căn hộ + người thuê → /contracts
   → Căn hộ tự động chuyển "Đã thuê"
3. Tạo thanh toán hàng tháng → /payments
```

### Kết thúc hợp đồng
```
1. Xóa hợp đồng → /contracts
   → Căn hộ tự động chuyển "Còn trống"
```

### Bảo trì căn hộ
```
1. Đổi trạng thái căn hộ → "Bảo trì" → /apartments
   (Căn hộ đang bảo trì không thể tạo hợp đồng mới)
```

## Mối liên hệ giữa các chức năng

```
Tòa nhà → có nhiều Tầng → có nhiều Căn hộ
Căn hộ + Người thuê → Hợp đồng thuê
Hợp đồng thuê → có nhiều Thanh toán
Thanh toán (đã thanh toán) → Doanh thu trên Dashboard
```
