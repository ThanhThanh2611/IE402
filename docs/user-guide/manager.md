# Hướng dẫn sử dụng - Vai trò Manager

## Tổng quan

`Manager` có toàn bộ quyền của `User`, đồng thời có quyền thao tác các màn hình quản trị và nhìn thấy đầy đủ dữ liệu tenant, hợp đồng, thanh toán, người dùng.

## 1. Dashboard

### Màn hình

- Route: `/dashboard`

### Nội dung chính

- Tổng số tòa nhà
- Tổng số căn hộ
- Số căn đã cho thuê
- Số hợp đồng đang hiệu lực
- Tỷ lệ lấp đầy theo từng tòa nhà
- Doanh thu theo tháng
- Lịch sử occupancy theo thời gian
- Snapshot occupancy theo mốc thời gian trực tiếp trên dashboard

## 2. Bản đồ và chi tiết tòa nhà

### Màn hình

- `/map`
- `/buildings/:id`
- `/buildings/:id/apartments/:apartmentId`

### Khả năng của Manager

- Xem bản đồ GIS và vùng footprint của tòa nhà nếu có
- Xem mô hình 3D tòa nhà
- Upload hoặc thay file model 3D của tòa nhà tại trang chi tiết tòa nhà
- Upload model 3D riêng cho từng tầng
- Quản lý hotspot indoor, edge topology và CRUD tầng ngay trong trang tòa nhà
- Đi vào trang chi tiết căn hộ để xem dữ liệu nghiệp vụ đầy đủ

### Tài liệu thao tác chi tiết

- Xem hướng dẫn đầy đủ tại [building-apartment-3d-2d-guide.md](D:\Workspace\IE402\docs\user-guide\building-apartment-3d-2d-guide.md)

## 3. Quản lý căn hộ

### Màn hình

- Route: `/apartments`

### Chức năng

- Xem danh sách căn hộ theo tòa nhà và tầng
- Thêm căn hộ mới
- Chỉnh sửa thông tin căn hộ
- Xóa mềm căn hộ
- Cập nhật trạng thái căn hộ

### Thông tin thao tác

Khi tạo hoặc sửa căn hộ, manager nhập các trường:
- tầng
- mã căn hộ
- diện tích
- số phòng ngủ
- số phòng tắm
- giá thuê
- mô tả

### Trạng thái căn hộ

- `Còn trống`
- `Đã thuê`
- `Đang bảo trì`

Lưu ý: trạng thái căn hộ còn có thể được backend tự động cập nhật khi tạo hoặc xóa hợp đồng.

## 4. Chi tiết căn hộ và LoD4

### Màn hình

- Route: `/buildings/:id/apartments/:apartmentId`

### Chức năng dành cho Manager

- Xem toàn bộ thông tin tenant và hợp đồng hiện tại
- Quản lý access grant theo từng căn hộ
- Xem danh sách không gian LoD4 của căn hộ
- Tạo, sửa, xóa không gian
- Quản lý layout nội thất
- Thêm, sửa, xóa item nội thất trong layout
- Quản lý thư viện furniture catalog

### Ghi chú

Backend đã hỗ trợ phân quyền theo từng căn hộ qua access grant. Tuy nhiên với manager, dữ liệu tenant và hợp đồng luôn hiển thị đầy đủ.
Manager cũng có thể cấp, sửa và thu hồi access grant ngay trong trang chi tiết căn hộ.
Chi tiết luồng thao tác với LoD4, layout, workspace kéo thả và access grant xem tại [building-apartment-3d-2d-guide.md](D:\Workspace\IE402\docs\user-guide\building-apartment-3d-2d-guide.md).

## 5. Quản lý hợp đồng

### Màn hình

- Route: `/contracts`

### Chức năng

- Xem danh sách hợp đồng
- Thêm hợp đồng mới
- Chỉnh sửa hợp đồng
- Xóa mềm hợp đồng
- Xem chi tiết hợp đồng

### Nghiệp vụ quan trọng

- Khi tạo hợp đồng, backend tự động chuyển trạng thái căn hộ sang `Đã thuê`
- Khi xóa hợp đồng, backend tự động chuyển trạng thái căn hộ về `Còn trống`
- Giá thuê có thể được auto-fill từ căn hộ đã chọn

## 6. Quản lý người thuê

### Màn hình

- Route: `/tenants`

### Chức năng

- Xem danh sách người thuê
- Thêm mới
- Chỉnh sửa
- Xóa mềm

### Dữ liệu chính

- Họ tên
- Số điện thoại
- CCCD
- Email
- Địa chỉ

### Kiểm tra dữ liệu

- Số điện thoại theo định dạng Việt Nam
- CCCD đủ 12 chữ số

## 7. Quản lý thanh toán

### Màn hình

- Route: `/payments`

### Chức năng

- Xem danh sách thanh toán
- Thêm thanh toán cho hợp đồng
- Chỉnh sửa thanh toán
- Xóa mềm thanh toán

### Trạng thái thanh toán

- `Chờ thanh toán`
- `Đã thanh toán`
- `Quá hạn`

Doanh thu ở dashboard được tính từ dữ liệu thanh toán backend tổng hợp.

## 8. Quản lý người dùng

### Màn hình

- Route: `/users`

### Chức năng

- Xem danh sách user hệ thống
- Tạo user mới
- Sửa thông tin user
- Xóa mềm user
- Kích hoạt user
- Vô hiệu hóa user

### Lưu ý

- Tài khoản bị vô hiệu hóa sẽ không đăng nhập được
- Trang này quản lý `users`, không phải danh sách `tenants`

## 9. Menu bên trái

Manager nhìn thấy đầy đủ 2 nhóm menu:

### Tổng quan

- `Bản đồ`
- `Dashboard`

### Quản lý

- `Căn hộ`
- `Hợp đồng`
- `Người thuê`
- `Thanh toán`
- `Người dùng`

## 10. Luồng nghiệp vụ điển hình

### Cho thuê căn hộ mới

```text
1. Tạo người thuê tại /tenants nếu người thuê chưa tồn tại
2. Tạo hợp đồng tại /contracts
3. Backend tự chuyển căn hộ sang trạng thái Da thue
4. Tạo các bản ghi thanh toán tại /payments
```

### Kết thúc hợp đồng

```text
1. Xóa mềm hợp đồng tại /contracts
2. Backend tự chuyển căn hộ về trạng thái Con trong
```

### Kiểm tra thực địa từ bản đồ

```text
/map -> Chọn tòa nhà -> /buildings/:id -> Chọn căn hộ -> /buildings/:id/apartments/:apartmentId
```
