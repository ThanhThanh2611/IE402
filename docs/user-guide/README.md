# Hướng dẫn sử dụng hệ thống

Hệ thống **3D GIS Apartment Management System** có 2 nhóm người dùng chính:

| Vai trò | Mô tả | Quyền chính |
|---|---|---|
| **User** | Người dùng thông thường | Xem dashboard, bản đồ, chi tiết tòa nhà, chi tiết căn hộ theo quyền được cấp |
| **Manager** | Người quản lý hệ thống | Toàn bộ quyền của User và các màn hình CRUD quản trị |

## Điểm vào hệ thống

- Trang đăng nhập: `/login`
- Sau khi đăng nhập thành công, hệ thống điều hướng về `/dashboard`
- Nếu token hết hạn hoặc tài khoản bị vô hiệu hóa, người dùng sẽ bị đưa về lại trang đăng nhập
- Nếu mở một route không tồn tại, hệ thống sẽ hiển thị trang `404`

## Điều hướng chính

### Menu chung

- `Bản đồ` -> `/map`
- `Dashboard` -> `/dashboard`

### Menu chỉ dành cho Manager

- `Căn hộ` -> `/apartments`
- `Hợp đồng` -> `/contracts`
- `Người thuê` -> `/tenants`
- `Thanh toán` -> `/payments`
- `Người dùng` -> `/users`

## Tài liệu theo vai trò

- [Hướng dẫn cho User](D:\Workspace\IE402\docs\user-guide\user.md)
- [Hướng dẫn cho Manager](D:\Workspace\IE402\docs\user-guide\manager.md)

## Ghi chú về quyền xem dữ liệu

Hệ thống không còn chỉ phân quyền theo `role` ở mức thô. Một số dữ liệu nhạy cảm như thông tin tenant hoặc hợp đồng tại trang chi tiết căn hộ còn phụ thuộc vào quyền truy cập theo từng căn hộ do backend cấp. Vì vậy:
- `Manager` nhìn thấy đầy đủ dữ liệu nghiệp vụ
- `User` có thể thấy hoặc không thấy tenant/hợp đồng tùy theo quyền backend trả về
