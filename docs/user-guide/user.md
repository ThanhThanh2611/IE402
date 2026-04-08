# Hướng dẫn sử dụng - Vai trò User

## Tổng quan

`User` là người dùng chỉ có quyền xem. Bạn không thể tạo, sửa hoặc xóa dữ liệu quản trị như căn hộ, hợp đồng, thanh toán hay người dùng.

## 1. Đăng nhập

### Màn hình

- Route: `/login`

### Cách dùng

1. Nhập `username`
2. Nhập `password`
3. Nhấn `Đăng nhập`

### Kết quả

- Nếu thành công, hệ thống chuyển tới `/dashboard`
- Nếu sai thông tin hoặc tài khoản bị vô hiệu hóa, hệ thống hiển thị thông báo lỗi

## 2. Dashboard

### Màn hình

- Route: `/dashboard`

### Thông tin có thể xem

- Tổng số tòa nhà
- Tổng số căn hộ
- Số căn đã cho thuê
- Số hợp đồng đang hiệu lực
- Danh sách tỷ lệ lấp đầy theo từng tòa nhà
- Biểu đồ doanh thu theo tháng
- Lịch sử occupancy theo thời gian
- Snapshot occupancy theo mốc ngày ngay trên dashboard

Dashboard là trang tổng quan nhanh để theo dõi tình hình khai thác hệ thống.

## 3. Bản đồ GIS

### Màn hình

- Route: `/map`

### Chức năng chính

- Xem vị trí các tòa nhà trên bản đồ
- Xem tòa nhà dưới dạng điểm hoặc vùng polygon tùy dữ liệu GIS hiện có
- Chọn tòa nhà để mở thông tin nhanh
- Điều hướng sang trang chi tiết tòa nhà

## 4. Chi tiết tòa nhà

### Màn hình

- Route: `/buildings/:id`

### Chức năng chính

- Xem thông tin cơ bản của tòa nhà
- Xem mô hình 3D của tòa nhà nếu đã có file model
- Chọn tầng để xem danh sách căn hộ
- Click vào căn hộ từ mô hình hoặc danh sách để xem chi tiết

### Lưu ý

- User có thể xem 3D nhưng không có quyền upload hoặc thay model

## 5. Chi tiết căn hộ

### Màn hình

- Route: `/buildings/:id/apartments/:apartmentId`

### Thông tin có thể xem

- Mã căn hộ
- Diện tích, số phòng ngủ, số phòng tắm
- Giá thuê
- Trạng thái căn hộ
- Thông tin không gian LoD4 và bố cục nội thất

### Quyền xem tenant và hợp đồng

Ở màn hình này, thông tin người thuê và hợp đồng hiện tại không phải lúc nào cũng hiển thị cho User. FE sẽ hiển thị theo đúng quyền backend trả về:
- nếu được cấp quyền, bạn sẽ thấy tenant/hợp đồng hiện tại
- nếu không được cấp quyền, phần này sẽ bị ẩn hoặc hiển thị trạng thái giới hạn truy cập

## 6. Menu bên trái

User chỉ thấy 2 mục:
- `Bản đồ`
- `Dashboard`

Các menu quản trị như `Căn hộ`, `Hợp đồng`, `Người thuê`, `Thanh toán`, `Người dùng` sẽ không xuất hiện.

## 7. Luồng sử dụng điển hình

```text
Đăng nhập -> Dashboard
Đăng nhập -> Bản đồ -> Chọn tòa nhà -> Chi tiết tòa nhà -> Chọn căn hộ -> Chi tiết căn hộ
```
