# Tổng quan các chức năng - 3D GIS Apartment Management System

Hệ thống **3D GIS Apartment Management System** được thiết kế để cung cấp giải pháp quản lý căn hộ toàn diện, kết hợp bản đồ địa lý GIS và tương tác trực quan với không gian 3D (LoD4). Hệ thống phục vụ 2 nhóm người dùng chính: **User** (người thuê, khách hàng) và **Manager** (quản lý tòa nhà).

Dưới đây là tóm tắt các chức năng chính của hệ thống:

## 1. Bản đồ GIS (Geographic Information System)
- **Xem bản đồ thành phố**: Hiển thị bản đồ khu vực, định vị các tòa nhà quản lý trên bản đồ nền.
- **Tra cứu và bộ lọc**: Cho phép lọc tòa nhà theo khu vực, mức giá, tỷ lệ lấp đầy.
- **Xem tổng quan tòa nhà**: Cung cấp các thông tin thống kê nhanh như tỷ lệ lấp đầy trực tiếp trên bản đồ trước khi chọn xem chi tiết.

## 2. Mô hình 3D Tòa nhà (Building 3D Model)
- **Hiển thị tòa nhà 3D**: Trực quan hóa kiến trúc tòa nhà, cho phép thao tác xoay (rotate), phóng to/thu nhỏ (zoom), và di chuyển (pan).
- **Tương tác tầng & Căn hộ**: Tách lớp hiển thị theo từng tầng, cung cấp góc nhìn rõ ràng đến từng căn hộ bên trong.
- **Tra cứu trạng thái**: Đánh dấu màu sắc các căn hộ trên mô hình 3D (ví dụ: đang trống, đã thuê) giúp nhận diện nhanh chóng.

## 3. Không gian 3D Nội thất (LoD4 Indoor Space)
- **Xem không gian nội thất**: Trải nghiệm 3D bên trong từng căn hộ.
- **Thư viện nội thất 3D**: Cung cấp danh mục các mô hình vật dụng (giường, tủ, bàn ghế,...) có thể kéo thả trực tiếp vào không gian 3D.
- **Cấu hình Layout**: Bố trí nội thất, thay đổi vị trí, góc xoay của từng vật dụng.
- **Quản lý Template Layout**: 
  - Lưu cấu hình thiết kế nội thất thành Template để tái sử dụng hoặc chia sẻ.
  - Quản lý (Thêm/Sửa/Xóa) Layout cá nhân và Template hệ thống.
- **Trải nghiệm góc nhìn thứ nhất (First-person)**: Hỗ trợ người dùng "đi dạo" bên trong căn hộ để có trải nghiệm chân thực.

## 4. Quản lý Căn hộ & Hợp đồng (Apartment & Contract Management)
- **Tra cứu Căn hộ**: Xem thông tin chi tiết (giá thuê, diện tích, trang thiết bị).
- **Quản lý Căn hộ (Manager)**: Thực hiện thêm mới, chỉnh sửa thông tin và cập nhật trạng thái (Trống/Đã thuê/Đang bảo trì).
- **Quản lý Hợp đồng**: 
  - Tạo mới, cập nhật và hủy hợp đồng thuê.
  - Hệ thống tự động đồng bộ trạng thái căn hộ (sang "Đã thuê" khi có hợp đồng, và "Trống" khi hủy hợp đồng).
- **Quản lý Người thuê**: Ghi nhận và bảo mật thông tin người thuê (Tenant).

## 5. Dashboard & Thống kê (Analytics)
- **Tổng quan dữ liệu**: Dashboard trực quan hóa các chỉ số quan trọng của toàn hệ thống.
- **Thống kê lấp đầy**: Báo cáo tỷ lệ căn hộ có người thuê trên từng tòa nhà hoặc toàn hệ thống.
- **Doanh thu**: Biểu đồ thống kê và dự báo doanh thu.
- **Dữ liệu Time Series**: Theo dõi biến động về lấp đầy và doanh thu theo thời gian.

## 6. Phân quyền & Quản lý Người dùng (User Management)
- **Xác thực bảo mật**: Đăng nhập, đăng xuất an toàn.
- **Phân quyền chặt chẽ**: 
  - **User**: Được phép xem thông tin, xem bản đồ/3D, cấu hình nội thất cho căn hộ của mình.
  - **Manager**: Có toàn quyền thay đổi dữ liệu lõi (Căn hộ, Hợp đồng, Thư viện nội thất toàn cục) và quản lý người dùng.
- **Quản lý Tài khoản (Manager)**: Xem danh sách, thêm, sửa, xóa, khóa/mở khóa tài khoản người dùng trên hệ thống.

---
*Tài liệu này tổng hợp dựa trên yêu cầu nghiệp vụ và các tính năng đã được triển khai.*
