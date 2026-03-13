---

2.5 Use Case Diagram

2.5.1 Tổng quan Use Case Diagram của hệ thống

Use Case Diagram được sử dụng để mô tả các chức năng chính của hệ thống và cách các tác nhân (actors) tương tác với hệ thống. Sơ đồ này giúp xác định các chức năng nghiệp vụ mà hệ thống cần cung cấp cũng như mối quan hệ giữa người dùng và các chức năng đó.

Trong hệ thống 3D GIS Apartment Management System, các tác nhân chính bao gồm:

*
**User**: Người dùng thông thường, có thể truy cập bản đồ, xem thông tin tòa nhà, căn hộ và thống kê dữ liệu.


*
**Manager**: Người quản lý hệ thống, có quyền quản lý thông tin căn hộ, hợp đồng thuê và cập nhật trạng thái dữ liệu.



Hệ thống được chia thành các nhóm chức năng chính:

* Chức năng bản đồ GIS


* Chức năng hiển thị mô hình tòa nhà 3D


* Chức năng xem thông tin căn hộ


* Chức năng quản lý căn hộ


* Chức năng quản lý hợp đồng thuê


* Chức năng dashboard và thống kê dữ liệu



Các chức năng này được mô hình hóa thông qua các Use Case để thể hiện rõ cách người dùng tương tác với hệ thống. *(Hình 2.x: Use Case Diagram tổng thể của hệ thống)*

2.5.2 Danh sách Actors

| Actor | Mô tả |
| --- | --- |
| **User** | Người sử dụng hệ thống để xem bản đồ, thông tin tòa nhà, căn hộ và thống kê

 |
| **Manager** | Người quản lý hệ thống, có quyền cập nhật và quản lý dữ liệu

 |

2.5.3 Danh sách Use Cases của hệ thống

**Nhóm chức năng bản đồ GIS**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC01 | View City Map | Hiển thị bản đồ thành phố  |
| UC02 | View Building Locations | Hiển thị vị trí các tòa nhà trên bản đồ  |
| UC03 | Filter Buildings | Lọc các tòa nhà theo tiêu chí  |
| UC04 | View Occupancy Rate | Xem tỷ lệ lấp đầy của tòa nhà  |
| UC05 | Select Building | Chọn tòa nhà để xem chi tiết  |

**Nhóm chức năng hiển thị tòa nhà 3D**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC06 | View 3D Building Model | Hiển thị mô hình 3D của tòa nhà  |
| UC07 | View Floors | Hiển thị các tầng trong tòa nhà  |
| UC08 | View Apartment Units | Hiển thị các căn hộ  |
| UC09 | Zoom / Rotate 3D Model | Phóng to hoặc xoay mô hình 3D  |

**Nhóm chức năng thông tin căn hộ**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC10 | View Apartment Details | Xem thông tin chi tiết căn hộ  |
| UC11 | View Apartment Status | Xem trạng thái căn hộ  |
| UC12 | View Rental Price | Xem giá thuê căn hộ  |
| UC13 | View Tenant Information | Xem thông tin người thuê  |

**Nhóm chức năng quản lý căn hộ**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC14 | Add Apartment | Thêm căn hộ mới  |
| UC15 | Update Apartment Information | Cập nhật thông tin căn hộ  |
| UC16 | Delete Apartment | Xóa căn hộ  |
| UC17 | Update Apartment Status | Cập nhật trạng thái căn hộ  |

**Nhóm chức năng quản lý hợp đồng thuê**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC18 | Add Rental Contract | Thêm hợp đồng thuê  |
| UC19 | Edit Rental Contract | Chỉnh sửa hợp đồng  |
| UC20 | Delete Rental Contract | Xóa hợp đồng  |
| UC21 | View Contract Information | Xem thông tin hợp đồng  |

**Nhóm chức năng dashboard và thống kê**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC22 | View Dashboard | Hiển thị dashboard  |
| UC23 | View Occupancy Statistics | Thống kê tỷ lệ lấp đầy  |
| UC24 | View Revenue Statistics | Thống kê doanh thu  |
| UC25 | View Time Series Data | Hiển thị dữ liệu theo thời gian  |

**Nhóm chức năng quản lý người dùng**
| ID | Use Case | Mô tả |
| :--- | :--- | :--- |
| UC26 | View User List | Xem danh sách người dùng trong hệ thống  |
| UC27 | Add User | Thêm người dùng mới  |
| UC28 | Update User Information | Cập nhật thông tin người dùng  |
| UC29 | Delete User | Xóa người dùng  |
| UC30 | Activate User | Kích hoạt tài khoản người dùng  |
| UC31 | Deactivate User | Vô hiệu hóa tài khoản người dùng  |

---

2.5.4 Đặc tả Use Case

Phần này mô tả chi tiết các Use Case quan trọng của hệ thống 3D GIS Apartment Management System. Mỗi Use Case được đặc tả thông qua các thành phần: tác nhân, mô tả chức năng, điều kiện trước, điều kiện sau và luồng xử lý chính.

Use Case 1: Xem bản đồ thành phố (View City Map)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC01  |

|
| **Tên Use Case** | Xem bản đồ thành phố

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép người dùng truy cập và xem bản đồ tổng thể của thành phố trên hệ thống GIS.

|
| **Điều kiện trước** | Hệ thống đã được khởi động.

|
| **Điều kiện sau** | Bản đồ thành phố được hiển thị trên giao diện người dùng.

|

**Luồng chính**

1. Người dùng truy cập hệ thống.

2. Người dùng chọn chức năng Xem bản đồ thành phố.

3. Hệ thống tải dữ liệu bản đồ từ cơ sở dữ liệu.

4. Hệ thống hiển thị bản đồ thành phố trên giao diện.

Use Case 2: Xem vị trí các tòa nhà (View Building Locations)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC02  |

|
| **Tên Use Case** | Xem vị trí các tòa nhà

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị vị trí của các tòa nhà căn hộ trên bản đồ GIS.

|
| **Điều kiện trước** | Bản đồ thành phố đã được hiển thị.

|
| **Điều kiện sau** | Các tòa nhà được hiển thị dưới dạng điểm hoặc biểu tượng trên bản đồ.

|

**Luồng chính**

1. Người dùng mở bản đồ thành phố.

2. Hệ thống truy xuất dữ liệu vị trí tòa nhà.

3. Hệ thống hiển thị các tòa nhà trên bản đồ.

Use Case 3: Lọc các tòa nhà (Filter Buildings)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC03  |

|
| **Tên Use Case** | Lọc các tòa nhà

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép người dùng lọc các tòa nhà dựa trên các tiêu chí như khu vực, giá thuê hoặc tỷ lệ lấp đầy.

|
| **Điều kiện trước** | Danh sách tòa nhà đã được hiển thị trên bản đồ.

|
| **Điều kiện sau** | Các tòa nhà thỏa điều kiện lọc được hiển thị.

|

**Luồng chính**

1. Người dùng chọn chức năng Lọc tòa nhà.

2. Người dùng nhập các tiêu chí lọc.

3. Hệ thống xử lý điều kiện lọc.

4. Hệ thống hiển thị danh sách tòa nhà phù hợp.

Use Case 4: Xem tỷ lệ lấp đầy (View Occupancy Rate)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC04  |

|
| **Tên Use Case** | Xem tỷ lệ lấp đầy

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị tỷ lệ căn hộ đã được thuê trong một tòa nhà.

|
| **Điều kiện trước** | Người dùng đã chọn một tòa nhà.

|
| **Điều kiện sau** | Thông tin tỷ lệ lấp đầy được hiển thị.

|

**Luồng chính**

1. Người dùng chọn một tòa nhà.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống tính toán tỷ lệ lấp đầy.

4. Hệ thống hiển thị kết quả.

Use Case 5: Chọn tòa nhà (Select Building)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC05  |

|
| **Tên Use Case** | Chọn tòa nhà

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép người dùng chọn một tòa nhà trên bản đồ để xem chi tiết.

|
| **Điều kiện trước** | Bản đồ đã hiển thị các tòa nhà.

|
| **Điều kiện sau** | Tòa nhà được chọn và thông tin chi tiết có thể được truy cập.

|

**Luồng chính**

1. Người dùng nhấp vào một tòa nhà trên bản đồ.

2. Hệ thống nhận diện tòa nhà được chọn.

3. Hệ thống hiển thị thông tin cơ bản của tòa nhà.

Use Case 6: Xem mô hình tòa nhà 3D (View 3D Building Model)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC06  |

|
| **Tên Use Case** | Xem mô hình tòa nhà 3D

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép người dùng xem mô hình 3D của tòa nhà đã chọn.

|
| **Điều kiện trước** | Người dùng đã chọn một tòa nhà.

|
| **Điều kiện sau** | Mô hình 3D của tòa nhà được hiển thị.

|

**Luồng chính**

1. Người dùng chọn một tòa nhà.

2. Hệ thống tải dữ liệu mô hình 3D.

3. Hệ thống hiển thị mô hình 3D.

Use Case 7: Xem các tầng (View Floors)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC07  |

|
| **Tên Use Case** | Xem các tầng

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị cấu trúc các tầng trong tòa nhà.

|
| **Điều kiện trước** | Mô hình tòa nhà 3D đã được hiển thị.

|
| **Điều kiện sau** | Danh sách các tầng được hiển thị.

|

**Luồng chính**

1. Người dùng chọn chức năng xem tầng.

2. Hệ thống truy xuất dữ liệu tầng.

3. Hệ thống hiển thị danh sách các tầng.

Use Case 8: Xem các căn hộ (View Apartment Units)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC08  |

|
| **Tên Use Case** | Xem các căn hộ

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị các căn hộ trong một tầng của tòa nhà.

|
| **Điều kiện trước** | Người dùng đã chọn một tầng.

|
| **Điều kiện sau** | Các căn hộ được hiển thị trên giao diện.

|

**Luồng chính**

1. Người dùng chọn một tầng.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống hiển thị danh sách căn hộ.

Use Case 9: Phóng to / Xoay mô hình 3D (Zoom / Rotate 3D Model)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC09  |

|
| **Tên Use Case** | Phóng to / xoay mô hình 3D

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép người dùng tương tác với mô hình 3D bằng cách phóng to, thu nhỏ hoặc xoay.

|
| **Điều kiện trước** | Mô hình 3D đã được hiển thị.

|
| **Điều kiện sau** | Góc nhìn mô hình được thay đổi.

|

**Luồng chính**

1. Người dùng sử dụng công cụ điều khiển.

2. Hệ thống cập nhật góc nhìn mô hình.

3. Mô hình 3D được hiển thị theo góc nhìn mới.

Use Case 10: Xem thông tin chi tiết căn hộ (View Apartment Details)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC10  |

|
| **Tên Use Case** | Xem thông tin chi tiết căn hộ

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép người dùng xem thông tin chi tiết của một căn hộ.

|
| **Điều kiện trước** | Người dùng đã chọn căn hộ.

|
| **Điều kiện sau** | Thông tin chi tiết được hiển thị.

|

**Luồng chính**

1. Người dùng chọn một căn hộ.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống hiển thị thông tin chi tiết.

Use Case 11: Xem trạng thái căn hộ (View Apartment Status)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC11  |

|
| **Tên Use Case** | Xem trạng thái căn hộ

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị trạng thái của căn hộ (đã thuê hoặc còn trống).

|
| **Điều kiện trước** | Căn hộ đã được chọn.

|
| **Điều kiện sau** | Trạng thái căn hộ được hiển thị.

|

**Luồng chính**

1. Người dùng chọn căn hộ.

2. Hệ thống truy xuất trạng thái căn hộ.

3. Hệ thống hiển thị trạng thái.

Use Case 12: Xem giá thuê căn hộ (View Rental Price)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC12  |

|
| **Tên Use Case** | Xem giá thuê căn hộ

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị giá thuê của căn hộ.

|
| **Điều kiện trước** | Căn hộ đã được chọn.

|
| **Điều kiện sau** | Giá thuê được hiển thị.

|

**Luồng chính**

1. Người dùng chọn căn hộ.

2. Hệ thống truy xuất dữ liệu giá thuê.

3. Hệ thống hiển thị giá thuê.

Use Case 13: Xem thông tin người thuê (View Tenant Information)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC13  |

|
| **Tên Use Case** | Xem thông tin người thuê

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Cho phép xem thông tin của người đang thuê căn hộ.

|
| **Điều kiện trước** | Căn hộ đã có người thuê.

|
| **Điều kiện sau** | Thông tin người thuê được hiển thị.

|

**Luồng chính**

1. Người dùng chọn căn hộ.

2. Hệ thống truy xuất dữ liệu người thuê.

3. Hệ thống hiển thị thông tin người thuê.

Use Case 14: Thêm căn hộ (Add Apartment)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC14  |

|
| **Tên Use Case** | Thêm căn hộ

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý thêm một căn hộ mới vào hệ thống quản lý.

|
| **Điều kiện trước** | Quản lý đã đăng nhập vào hệ thống.

|
| **Điều kiện sau** | Thông tin căn hộ mới được lưu vào cơ sở dữ liệu.

|

**Luồng chính**

1. Quản lý chọn chức năng Thêm căn hộ.

2. Hệ thống hiển thị biểu mẫu nhập thông tin căn hộ.

3. Quản lý nhập các thông tin cần thiết (mã căn hộ, tầng, diện tích, giá thuê, trạng thái).

4. Quản lý xác nhận lưu thông tin.

5. Hệ thống kiểm tra tính hợp lệ của dữ liệu.

6. Hệ thống lưu thông tin căn hộ vào cơ sở dữ liệu.

Use Case 15: Cập nhật thông tin căn hộ (Update Apartment Information)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC15  |

|
| **Tên Use Case** | Cập nhật thông tin căn hộ

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý chỉnh sửa hoặc cập nhật thông tin của căn hộ.

|
| **Điều kiện trước** | Căn hộ đã tồn tại trong hệ thống.

|
| **Điều kiện sau** | Thông tin căn hộ được cập nhật thành công.

|

**Luồng chính**

1. Quản lý chọn căn hộ cần cập nhật.

2. Hệ thống hiển thị thông tin hiện tại của căn hộ.

3. Quản lý chỉnh sửa các thông tin cần thay đổi.

4. Quản lý xác nhận cập nhật.

5. Hệ thống kiểm tra dữ liệu.

6. Hệ thống lưu thông tin đã cập nhật.

Use Case 16: Xóa căn hộ (Delete Apartment)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC16  |

|
| **Tên Use Case** | Xóa căn hộ

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý xóa một căn hộ khỏi hệ thống.

|
| **Điều kiện trước** | Căn hộ tồn tại trong hệ thống.

|
| **Điều kiện sau** | Căn hộ bị xóa khỏi cơ sở dữ liệu.

|

**Luồng chính**

1. Quản lý chọn căn hộ cần xóa.

2. Hệ thống hiển thị thông tin căn hộ.

3. Quản lý xác nhận xóa.

4. Hệ thống kiểm tra các ràng buộc dữ liệu.

5. Hệ thống xóa thông tin căn hộ khỏi cơ sở dữ liệu.

Use Case 17: Cập nhật trạng thái căn hộ (Update Apartment Status)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC17  |

|
| **Tên Use Case** | Cập nhật trạng thái căn hộ

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý thay đổi trạng thái của căn hộ (đã thuê, còn trống, đang bảo trì).

|
| **Điều kiện trước** | Căn hộ tồn tại trong hệ thống.

|
| **Điều kiện sau** | Trạng thái căn hộ được cập nhật.

|

**Luồng chính**

1. Quản lý chọn căn hộ.

2. Quản lý chọn chức năng Cập nhật trạng thái.

3. Quản lý chọn trạng thái mới.

4. Hệ thống lưu trạng thái mới vào cơ sở dữ liệu.

5. Hệ thống hiển thị thông báo cập nhật thành công.

Use Case 18: Thêm hợp đồng thuê (Add Rental Contract)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC18  |

|
| **Tên Use Case** | Thêm hợp đồng thuê

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý tạo hợp đồng thuê cho một căn hộ.

|
| **Điều kiện trước** | Căn hộ tồn tại và chưa có hợp đồng thuê đang hoạt động.

|
| **Điều kiện sau** | Hợp đồng thuê được lưu vào hệ thống.

|

**Luồng chính**

1. Quản lý chọn chức năng Thêm hợp đồng thuê.

2. Hệ thống hiển thị biểu mẫu nhập thông tin hợp đồng.

3. Quản lý nhập thông tin người thuê và thời gian thuê.

4. Quản lý xác nhận lưu hợp đồng.

5. Hệ thống kiểm tra dữ liệu.

6. Hệ thống lưu hợp đồng vào cơ sở dữ liệu.

Use Case 19: Chỉnh sửa hợp đồng thuê (Edit Rental Contract)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC19  |

|
| **Tên Use Case** | Chỉnh sửa hợp đồng thuê

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý chỉnh sửa thông tin của hợp đồng thuê.

|
| **Điều kiện trước** | Hợp đồng thuê tồn tại trong hệ thống.

|
| **Điều kiện sau** | Thông tin hợp đồng được cập nhật.

|

**Luồng chính**

1. Quản lý chọn hợp đồng cần chỉnh sửa.

2. Hệ thống hiển thị thông tin hợp đồng.

3. Quản lý chỉnh sửa thông tin.

4. Quản lý xác nhận cập nhật.

5. Hệ thống lưu thông tin mới vào cơ sở dữ liệu.

Use Case 20: Xóa hợp đồng thuê (Delete Rental Contract)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC20  |

|
| **Tên Use Case** | Xóa hợp đồng thuê

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Cho phép quản lý xóa một hợp đồng thuê khỏi hệ thống.

|
| **Điều kiện trước** | Hợp đồng tồn tại trong hệ thống.

|
| **Điều kiện sau** | Hợp đồng bị xóa khỏi cơ sở dữ liệu.

|

**Luồng chính**

1. Quản lý chọn hợp đồng cần xóa.

2. Hệ thống hiển thị thông tin hợp đồng.

3. Quản lý xác nhận xóa.

4. Hệ thống xóa hợp đồng khỏi cơ sở dữ liệu.

Use Case 21: Xem thông tin hợp đồng (View Contract Information)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC21  |

|
| **Tên Use Case** | Xem thông tin hợp đồng

|
| **Tác nhân** | Người dùng, Quản lý

|
| **Mô tả** | Cho phép xem chi tiết thông tin của hợp đồng thuê.

|
| **Điều kiện trước** | Hợp đồng tồn tại trong hệ thống.

|
| **Điều kiện sau** | Thông tin hợp đồng được hiển thị.

|

**Luồng chính**

1. Người dùng chọn hợp đồng.

2. Hệ thống truy xuất dữ liệu hợp đồng.

3. Hệ thống hiển thị thông tin chi tiết.

Use Case 22: Xem Dashboard (View Dashboard)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC22  |

|
| **Tên Use Case** | Xem Dashboard

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị các thông tin tổng hợp và dữ liệu phân tích của hệ thống.

|
| **Điều kiện trước** | Người dùng truy cập hệ thống.

|
| **Điều kiện sau** | Dashboard hiển thị các biểu đồ và số liệu thống kê.

|

**Luồng chính**

1. Người dùng chọn chức năng Dashboard.

2. Hệ thống tải dữ liệu thống kê.

3. Hệ thống hiển thị các biểu đồ.

Use Case 23: Xem thống kê tỷ lệ lấp đầy (View Occupancy Statistics)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC23  |

|
| **Tên Use Case** | Xem thống kê tỷ lệ lấp đầy

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị thống kê tỷ lệ căn hộ đã được thuê theo từng tòa nhà.

|
| **Điều kiện trước** | Hệ thống có dữ liệu căn hộ và hợp đồng thuê.

|
| **Điều kiện sau** | Thống kê được hiển thị dưới dạng biểu đồ.

|

**Luồng chính**

1. Người dùng chọn mục Thống kê tỷ lệ lấp đầy.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống tính toán tỷ lệ.

4. Hệ thống hiển thị biểu đồ thống kê.

Use Case 24: Xem thống kê doanh thu (View Revenue Statistics)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC24  |

|
| **Tên Use Case** | Xem thống kê doanh thu

|
| **Tác nhân** | Quản lý

|
| **Mô tả** | Hiển thị dữ liệu doanh thu từ các hợp đồng thuê.

|
| **Điều kiện trước** | Hệ thống có dữ liệu hợp đồng thuê.

|
| **Điều kiện sau** | Biểu đồ doanh thu được hiển thị.

|

**Luồng chính**

1. Quản lý chọn mục Thống kê doanh thu.

2. Hệ thống truy xuất dữ liệu hợp đồng.

3. Hệ thống tính toán tổng doanh thu.

4. Hệ thống hiển thị biểu đồ doanh thu.

Use Case 25: Xem dữ liệu theo thời gian (View Time Series Data)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC25  |

|
| **Tên Use Case** | Xem dữ liệu theo thời gian

|
| **Tác nhân** | Người dùng

|
| **Mô tả** | Hiển thị dữ liệu thống kê theo từng khoảng thời gian.

|
| **Điều kiện trước** | Hệ thống có dữ liệu lịch sử.

|
| **Điều kiện sau** | Dữ liệu được hiển thị dưới dạng biểu đồ thời gian.

|

**Luồng chính**

1. Người dùng chọn khoảng thời gian cần xem.

2. Hệ thống truy xuất dữ liệu tương ứng.

3. Hệ thống hiển thị biểu đồ theo thời gian.

Use Case 26: Xem danh sách người dùng (View User List)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC26  |

|
| **Tên Use Case** | Xem danh sách người dùng

|
| **Tác nhân** | Manager

|
| **Mô tả** | Cho phép người quản lý xem danh sách tất cả người dùng trong hệ thống

|
| **Điều kiện trước** | Manager đã đăng nhập vào hệ thống

|
| **Điều kiện sau** | Danh sách người dùng được hiển thị

|

**Luồng chính**

1. Manager truy cập chức năng Quản lý người dùng

2. Hệ thống truy xuất dữ liệu từ User Database

3. Hệ thống hiển thị danh sách người dùng

Use Case 27: Thêm người dùng (Add User)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC27  |

|
| **Tên Use Case** | Thêm người dùng

|
| **Tác nhân** | Manager

|
| **Mô tả** | Cho phép Manager tạo tài khoản người dùng mới

|
| **Điều kiện trước** | Manager đã đăng nhập

|
| **Điều kiện sau** | Tài khoản người dùng mới được lưu vào hệ thống

|

**Luồng chính**

1. Manager chọn chức năng Thêm người dùng

2. Hệ thống hiển thị form nhập thông tin

3. Manager nhập thông tin người dùng (username, email, role)

4. Manager xác nhận tạo tài khoản

5. Hệ thống kiểm tra dữ liệu

6. Hệ thống lưu thông tin vào User Database

Use Case 28: Cập nhật thông tin người dùng (Update User Information)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC28  |

|
| **Tên Use Case** | Cập nhật thông tin người dùng

|
| **Tác nhân** | Manager

|
| **Mô tả** | Cho phép Manager chỉnh sửa thông tin của người dùng

|
| **Điều kiện trước** | Người dùng tồn tại

|
| **Điều kiện sau** | Thông tin người dùng được cập nhật

|

**Luồng chính**

1. Manager chọn người dùng

2. Hệ thống hiển thị thông tin hiện tại

3. Manager chỉnh sửa thông tin

4. Manager xác nhận cập nhật

5. Hệ thống lưu dữ liệu mới

Use Case 29: Xóa người dùng (Delete User)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC29  |

|
| **Tên Use Case** | Xóa người dùng

|
| **Tác nhân** | Manager

|
| **Mô tả** | Cho phép Manager xóa tài khoản người dùng

|
| **Điều kiện trước** | Người dùng tồn tại

|
| **Điều kiện sau** | Tài khoản bị xóa khỏi hệ thống

|

**Luồng chính**

1. Manager chọn người dùng

2. Manager chọn Delete

3. Hệ thống yêu cầu xác nhận

4. Manager xác nhận xóa

5. Hệ thống xóa dữ liệu trong User Database

Use Case 30: Kích hoạt tài khoản (Activate User)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC30  |

|
| **Tên Use Case** | Kích hoạt người dùng

|
| **Tác nhân** | Manager

|
| **Mô tả** | Cho phép Manager kích hoạt tài khoản người dùng

|
| **Điều kiện trước** | Tài khoản đang bị vô hiệu hóa

|
| **Điều kiện sau** | Tài khoản được kích hoạt

|

**Luồng chính**

1. Manager chọn người dùng

2. Manager chọn Activate

3. Hệ thống cập nhật trạng thái Active

4. Hệ thống lưu dữ liệu

Use Case 31: Vô hiệu hóa tài khoản (Deactivate User)

| Thuộc tính      | Mô tả |
| --------------- | ----- |
| **Mã Use Case** | UC31  |

|
| **Tên Use Case** | Vô hiệu hóa người dùng

|
| **Tác nhân** | Manager

|
| **Mô tả** | Cho phép Manager khóa tài khoản người dùng

|
| **Điều kiện trước** | Người dùng đang hoạt động

|
| **Điều kiện sau** | Tài khoản bị vô hiệu hóa

|

**Luồng chính**

1. Manager chọn người dùng

2. Manager chọn Deactivate

3. Hệ thống cập nhật trạng thái Inactive

4. Hệ thống lưu dữ liệu

---

2.6 Sơ đồ luồng dữ liệu của ứng dụng (Data Flow Diagram – DFD)

Sơ đồ luồng dữ liệu (Data Flow Diagram – DFD) là một công cụ quan trọng trong quá trình phân tích và thiết kế hệ thống thông tin. DFD được sử dụng nhằm mô tả cách dữ liệu được xử lý, lưu trữ và luân chuyển giữa các thành phần khác nhau trong hệ thống. Thông qua việc sử dụng DFD, các nhà phát triển có thể hiểu rõ quá trình xử lý dữ liệu trong hệ thống, từ đó hỗ trợ việc thiết kế và triển khai hệ thống một cách hiệu quả.

Trong mô hình DFD, hệ thống được mô tả thông qua bốn thành phần cơ bản:

- **External Entity (Tác nhân ngoài):** là các đối tượng bên ngoài hệ thống nhưng có sự tương tác với hệ thống thông qua việc gửi hoặc nhận dữ liệu.

- **Process (Tiến trình):** biểu diễn các hoạt động xử lý dữ liệu trong hệ thống.

- **Data Store (Kho dữ liệu):** nơi lưu trữ dữ liệu của hệ thống, thường là cơ sở dữ liệu.

- **Data Flow (Luồng dữ liệu):** thể hiện sự di chuyển của dữ liệu giữa các thành phần trong hệ thống.

Đối với hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS, DFD được sử dụng để mô tả cách dữ liệu được trao đổi giữa người dùng, người quản lý và các thành phần xử lý trong hệ thống. Hệ thống cho phép người dùng xem bản đồ, tra cứu thông tin căn hộ và tòa nhà, đồng thời hỗ trợ người quản lý thực hiện các chức năng quản lý căn hộ và hợp đồng thuê.

Để mô tả hệ thống một cách rõ ràng, DFD được xây dựng theo ba cấp độ bao gồm:

- **DFD Level 0 (Context Diagram):** mô tả hệ thống ở mức tổng quan.

- **DFD Level 1:** phân rã hệ thống thành các chức năng chính.

- **DFD Level 2:** mô tả chi tiết các tiến trình xử lý dữ liệu.

  2.6.1 Sơ đồ ngữ cảnh của hệ thống (DFD Level 0)

Sơ đồ luồng dữ liệu mức 0 (DFD Level 0), còn gọi là Context Diagram, mô tả tổng quan hệ thống và cách hệ thống tương tác với các tác nhân bên ngoài. Trong hệ thống quản lý cho thuê chung cư, toàn bộ hệ thống được biểu diễn bằng một tiến trình duy nhất là Apartment Rental Management System. Hệ thống nhận các yêu cầu từ người dùng và quản trị viên, sau đó xử lý và trả lại các thông tin tương ứng.

Các tác nhân bên ngoài bao gồm:

- **User:** Người dùng có thể gửi yêu cầu tra cứu thông tin căn hộ, xem bản đồ tòa nhà hoặc tra cứu thông tin hợp đồng thuê.

- **Manager/Admin:** Quản trị viên có quyền quản lý thông tin căn hộ, quản lý hợp đồng thuê, quản lý người dùng và xem các báo cáo thống kê của hệ thống.

Thông qua các tương tác này, hệ thống tiếp nhận dữ liệu đầu vào từ các tác nhân bên ngoài, thực hiện xử lý và cung cấp các thông tin đầu ra phù hợp. _(Hình 2.x minh họa sơ đồ ngữ cảnh của hệ thống quản lý cho thuê chung cư)._

2.6.2 Sơ đồ luồng dữ liệu mức 1 (DFD Level 1)

Sơ đồ DFD Level 1 được xây dựng bằng cách phân rã tiến trình tổng thể của hệ thống thành các tiến trình xử lý chính nhằm mô tả chi tiết hơn cách dữ liệu được xử lý và luân chuyển trong hệ thống. Trong hệ thống 3D GIS Apartment Management System, tiến trình trung tâm được phân rã thành năm tiến trình chính như sau:

- **1.0 Quản lý bản đồ và tòa nhà:** Tiến trình này chịu trách nhiệm xử lý các yêu cầu liên quan đến việc hiển thị bản đồ và thông tin các tòa nhà trên bản đồ GIS. Khi người dùng gửi yêu cầu xem bản đồ hoặc vị trí tòa nhà, hệ thống sẽ truy vấn dữ liệu từ Map Database và Building Database. Sau đó hệ thống xử lý dữ liệu và hiển thị kết quả trên giao diện người dùng.

- **2.0 Quản lý thông tin căn hộ:** Tiến trình này cho phép người dùng tra cứu thông tin căn hộ và cho phép Manager/Admin thực hiện các thao tác quản lý dữ liệu căn hộ như thêm mới, cập nhật hoặc xóa căn hộ. Các dữ liệu liên quan sẽ được truy xuất hoặc cập nhật trong Apartment Database.

- **3.0 Quản lý hợp đồng thuê:** Tiến trình này xử lý các nghiệp vụ liên quan đến hợp đồng thuê căn hộ, bao gồm tạo hợp đồng thuê mới, chỉnh sửa hợp đồng, xóa hợp đồng hoặc tra cứu thông tin hợp đồng. Các dữ liệu hợp đồng được lưu trữ và quản lý trong Rental Contract Database.

- **4.0 Thống kê và báo cáo:** Tiến trình này thực hiện việc tổng hợp và phân tích dữ liệu từ các cơ sở dữ liệu của hệ thống như Apartment Database và Rental Contract Database nhằm tạo ra các báo cáo và thống kê phục vụ cho việc quản lý và ra quyết định của Manager/Admin. Các kết quả thống kê có thể được hiển thị dưới dạng biểu đồ hoặc dashboard.

- **5.0 Quản lý người dùng:** Tiến trình này cho phép Manager/Admin thực hiện các chức năng quản lý tài khoản người dùng trong hệ thống. Các chức năng bao gồm:

- Thêm người dùng mới

- Cập nhật thông tin người dùng

- Xóa tài khoản người dùng

- Kích hoạt tài khoản người dùng

- Vô hiệu hóa tài khoản người dùng

- Xem danh sách người dùng Tất cả các dữ liệu liên quan đến tài khoản sẽ được lưu trữ và quản lý trong User Database.

Các kho dữ liệu chính được sử dụng trong hệ thống bao gồm:

- **Map Database:** lưu trữ dữ liệu bản đồ GIS

- **Building Database:** lưu trữ thông tin các tòa nhà

- **Apartment Database:** lưu trữ thông tin chi tiết các căn hộ

- **Rental Contract Database:** lưu trữ dữ liệu hợp đồng thuê

- **User Database:** lưu trữ thông tin tài khoản người dùng

Thông qua các tiến trình này, hệ thống có thể xử lý các yêu cầu truy vấn thông tin của người dùng cũng như hỗ trợ người quản lý thực hiện các chức năng quản lý dữ liệu một cách hiệu quả. _(Hình 2.x minh họa sơ đồ DFD Level 1 của hệ thống)._

Dựa trên cấu trúc của sơ đồ luồng dữ liệu mức 1, các tương tác giữa tác nhân và hệ thống được cụ thể hóa thông qua bảng đặc tả đầu vào/đầu ra dưới đây. Việc phân tách rõ ràng các luồng dữ liệu giúp đảm bảo tính module hóa và dễ dàng trong việc triển khai cơ sở dữ liệu vật lý ở các bước tiếp theo.

**Bảng 2.1: Đặc tả chi tiết các tiến trình trong sơ đồ DFD Mức 1**
| STT | Tên tiến trình | Luồng dữ liệu vào (Input) | Luồng dữ liệu ra (Output) | Mô tả chức năng |
| :--- | :--- | :--- | :--- | :--- |
| 1.0 | Quản lý bản đồ & tòa nhà 3D | - Yêu cầu hiển thị từ User/Admin.

- Tọa độ nền từ CSDL Bản đồ.

- Mô hình hình học từ CSDL Tòa nhà. | - Giao diện bản đồ 2D trực quan.

- Mô hình 3D tòa nhà (LoD2/LoD3). | Tiếp nhận yêu cầu điều hướng không gian, truy xuất dữ liệu hình học và render mô hình 3D trên nền tảng GIS. |
  | 2.0 | Quản lý thông tin căn hộ | - Yêu cầu tra cứu của User.

- Lệnh cập nhật/chỉnh sửa của Admin.

- Dữ liệu thuộc tính từ CSDL Căn hộ. | - Thông tin chi tiết (Diện tích, trạng thái, giá).

- Trạng thái cập nhật thành công. | Xử lý các truy vấn liên quan đến thực thể căn hộ, cho phép quản lý vòng đời dữ liệu của từng đơn vị ở. |
  | 3.0 | Quản lý hợp đồng thuê | - Thông tin khách hàng, tiền cọc, thời hạn thuê.

- Dữ liệu hợp đồng cũ từ CSDL Hợp đồng. | - Hợp đồng mới được khởi tạo.

- Thông báo thay đổi trạng thái thuê. | Thực hiện các nghiệp vụ kinh doanh, lưu trữ và quản lý các điều khoản pháp lý giữa chủ sở hữu và người thuê. |
  | 4.0 | Thống kê và báo cáo | - Dữ liệu trạng thái từ CSDL Căn hộ.

- Dữ liệu tài chính từ CSDL Hợp đồng. | - Biểu đồ thống kê (Tỉ lệ lấp đầy).

- Báo cáo doanh thu theo thời gian. | Tổng hợp dữ liệu thô từ nhiều nguồn để chuyển hóa thành thông tin hỗ trợ ra quyết định (BI - Business Intelligence). |
  | 5.0 | Quản lý người dùng | - Thông tin đăng ký tài khoản.

- Yêu cầu phân quyền từ Admin. | - Danh sách tài khoản người dùng.

- Phản hồi phân quyền/vô hiệu hóa. | Kiểm soát quyền truy cập hệ thống, đảm bảo tính bảo mật và toàn vẹn dữ liệu cho từng nhóm đối tượng. |

**Bảng 2.2: Đặc tả các kho dữ liệu (Data Stores)**
| Mã kho | Tên kho dữ liệu | Nội dung lưu trữ chính |
| :--- | :--- | :--- |
| D1 | CSDL Bản đồ GIS | Dữ liệu không gian (Shapefile/GeoJSON), lớp nền giao thông, ranh giới hành chính. |
| D2 | CSDL Tòa nhà | Mô hình khối 3D, tọa độ tâm tòa nhà, độ cao tầng (Z-axis). |
| D3 | CSDL Căn hộ | Mã căn hộ, diện tích thông thủy, số phòng ngủ, hướng, tình trạng (Trống/Đã thuê). |
| D4 | CSDL Hợp đồng | Thông tin khách thuê, lịch sử giao dịch, đơn giá thuê, ngày bắt đầu và kết thúc. |
| D5 | CSDL Người dùng | Tên đăng nhập, mật khẩu mã hóa, vai trò (Role), nhật ký hệ thống. |

2.6.3 Sơ đồ luồng dữ liệu mức 2 (DFD Level 2)

Sơ đồ luồng dữ liệu mức 2 (DFD Level 2) được xây dựng nhằm mô tả chi tiết hơn các tiến trình đã được trình bày trong sơ đồ DFD Level 1. Ở mức này, các tiến trình chính của hệ thống được phân rã thành những tiến trình nhỏ hơn nhằm thể hiện rõ cách dữ liệu được xử lý và luân chuyển giữa các thành phần trong hệ thống. Trong hệ thống quản lý cho thuê chung cư, các tiến trình Quản lý thông tin căn hộ (2.0), Quản lý hợp đồng thuê (3.0) và Quản lý người dùng (5.0) được phân rã chi tiết như sau.

1. Phân rã tiến trình quản lý thông tin căn hộ (Process 2.0) Tiến trình Quản lý thông tin căn hộ cho phép người dùng tra cứu thông tin căn hộ và cho phép quản trị viên thực hiện các thao tác quản lý dữ liệu căn hộ. Các tiến trình con bao gồm:

- **2.1 Tra cứu căn hộ:** Người dùng gửi yêu cầu tra cứu thông tin căn hộ. Hệ thống tiếp nhận yêu cầu, truy vấn dữ liệu từ Apartment Database và hiển thị kết quả cho người dùng.

- **2.2 Thêm căn hộ:** Quản trị viên nhập thông tin căn hộ mới vào hệ thống. Sau khi hệ thống kiểm tra tính hợp lệ của dữ liệu, thông tin căn hộ sẽ được lưu vào Apartment Database.

- **2.3 Cập nhật thông tin căn hộ:** Quản trị viên có thể chỉnh sửa thông tin của các căn hộ đã tồn tại trong hệ thống. Các thay đổi sẽ được cập nhật vào Apartment Database.

- **2.4 Xóa căn hộ:** Khi căn hộ không còn được sử dụng, quản trị viên có thể xóa thông tin căn hộ khỏi hệ thống. Hệ thống sẽ cập nhật dữ liệu tương ứng trong Apartment Database.

| Chức năng      | Đối tượng thực hiện | Dữ liệu đầu vào  | Kết quả đầu ra               |
| -------------- | ------------------- | ---------------- | ---------------------------- |
| Tra cứu căn hộ | Người dùng          | Từ khóa tìm kiếm | Danh sách và chi tiết căn hộ |

|
| Thêm căn hộ mới | Quản trị viên | Thông số căn hộ mới | Dữ liệu được lưu vào hệ thống

|
| Cập nhật thông tin | Quản trị viên | Các thay đổi (Giá, trạng thái) | Dữ liệu mới được ghi đè

|
| Xóa căn hộ | Quản trị viên | Mã định danh căn hộ | Căn hộ bị loại bỏ khỏi danh mục

|

2. Phân rã tiến trình quản lý hợp đồng thuê (Process 3.0) Tiến trình Quản lý hợp đồng thuê cho phép quản trị viên tạo và quản lý các hợp đồng thuê căn hộ trong hệ thống. Các tiến trình con bao gồm:

- **3.1 Tạo hợp đồng thuê:** Quản trị viên tạo hợp đồng thuê mới cho căn hộ. Thông tin hợp đồng được lưu vào Rental Contract Database.

- **3.2 Cập nhật hợp đồng thuê:** Quản trị viên có thể cập nhật thông tin của hợp đồng như thời hạn thuê, giá thuê hoặc trạng thái hợp đồng.

- **3.3 Hủy hợp đồng thuê:** Khi hợp đồng không còn hiệu lực, quản trị viên có thể thực hiện thao tác hủy hợp đồng. Hệ thống sẽ cập nhật trạng thái hợp đồng trong Rental Contract Database.

- **3.4 Tra cứu hợp đồng thuê:** Hệ thống cho phép tìm kiếm thông tin hợp đồng thuê dựa trên các tiêu chí như mã hợp đồng, căn hộ hoặc người thuê.

| Tiến trình        | Dữ liệu đầu vào (Input)                                                                             | Dữ liệu đầu ra (Output)                                                       | Mô tả hành động                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Tạo hợp đồng thuê | Mã căn hộ, Mã người thuê, Thời hạn (Từ ngày - Đến ngày), Giá thuê, Tiền cọc, Các điều khoản đi kèm. | Bản ghi hợp đồng mới (Trạng thái: Hiệu lực) lưu vào Rental Contract Database. | Hệ thống kiểm tra tính hợp lệ của căn hộ/người thuê trước khi khởi tạo bản ghi mới. |

|
| Cập nhật hợp đồng | Mã hợp đồng, Thông tin cần sửa (Giá thuê mới, Gia hạn thời gian, Thay đổi trạng thái). | Thông tin hợp đồng đã chỉnh sửa trong Rental Contract Database. | Quản trị viên truy xuất hợp đồng cũ, thay đổi thông tin và hệ thống ghi đè/lưu vết cập nhật.

|
| Hủy hợp đồng thuê | Mã hợp đồng, Lý do hủy, Ngày chấm dứt. | Trạng thái hợp đồng chuyển thành "Đã hủy" hoặc "Kết thúc trước hạn" trong Rental Contract Database. | Hệ thống cập nhật trạng thái để giải phóng căn hộ (trạng thái căn hộ chuyển về "Trống").

|
| Tra cứu hợp đồng | Tiêu chí tìm kiếm (Mã HD, Tên người thuê, Số căn hộ, Khoảng thời gian). | Danh sách hợp đồng thỏa mãn điều kiện hiển thị trên giao diện Admin. | Hệ thống truy vấn trong database và trả về các kết quả trùng khớp với bộ lọc.

|

3. Phân rã tiến trình quản lý người dùng (Process 5.0) Tiến trình Quản lý người dùng cho phép Manager/Admin quản lý tài khoản người dùng trong hệ thống. Các tiến trình bao gồm:

- **5.1 Tra cứu người dùng:** Manager/Admin có thể xem danh sách hoặc tìm kiếm thông tin người dùng trong hệ thống.

- **5.2 Thêm người dùng:** Manager/Admin nhập thông tin tài khoản mới và hệ thống lưu dữ liệu vào User Database.

- **5.3 Cập nhật thông tin người dùng:** Hệ thống cho phép chỉnh sửa các thông tin của người dùng như tên, email hoặc quyền truy cập.

- **5.4 Xóa người dùng:** Manager/Admin có thể xóa tài khoản người dùng không còn sử dụng.

- **5.5 Cập nhật trạng thái tài khoản:** Manager/Admin có thể kích hoạt (activate) hoặc vô hiệu hóa (deactivate) tài khoản người dùng.

  _(Note: Data flow for process 5.0 structurally resembles the previously listed table parameters.)_

  ***

  2.7 Sơ đồ trình tự (Sequence Diagram)

Sơ đồ trình tự (Sequence Diagram) được sử dụng để mô tả trình tự tương tác giữa các thành phần của hệ thống theo thời gian khi thực hiện một chức năng cụ thể. Thông qua sơ đồ này, có thể thấy được cách mà tác nhân (Actor), giao diện hệ thống, các dịch vụ xử lý và cơ sở dữ liệu trao đổi thông tin với nhau để hoàn thành một nghiệp vụ.

Trong hệ thống quản lý cho thuê chung cư sử dụng công nghệ GIS 3D, các sơ đồ trình tự được xây dựng cho một số chức năng quan trọng nhằm mô tả chi tiết cách hệ thống xử lý yêu cầu của người dùng. Các sơ đồ được xây dựng bao gồm:

- Xem bản đồ và chọn tòa nhà

- Xem mô hình 3D tòa nhà

- Xem thông tin chi tiết căn hộ

- Thêm căn hộ mới

- Tạo hợp đồng thuê

  2.7.1 Sơ đồ trình tự chức năng xem bản đồ và chọn tòa nhà

Chức năng này cho phép người dùng truy cập vào hệ thống để xem bản đồ tổng thể của thành phố và lựa chọn một tòa nhà cụ thể để xem thông tin chi tiết. Khi người dùng truy cập hệ thống, giao diện sẽ gửi yêu cầu đến dịch vụ GIS để tải dữ liệu bản đồ từ cơ sở dữ liệu. Sau khi dữ liệu bản đồ được tải, hệ thống hiển thị bản đồ lên giao diện người dùng. Người dùng có thể lựa chọn một tòa nhà trên bản đồ để xem thông tin liên quan. Quá trình tương tác giữa các thành phần bao gồm: người dùng, giao diện web, dịch vụ GIS và cơ sở dữ liệu. _(Hình 2.20: Sequence Diagram – Xem bản đồ và chọn tòa nhà)_

2.7.2 Sơ đồ trình tự chức năng xem mô hình 3D tòa nhà

Chức năng này cho phép người dùng xem mô hình 3D của tòa nhà sau khi đã lựa chọn tòa nhà trên bản đồ. Khi người dùng yêu cầu hiển thị mô hình 3D, giao diện hệ thống sẽ gửi yêu cầu đến bộ xử lý đồ họa 3D để tải dữ liệu mô hình từ cơ sở dữ liệu. Sau đó hệ thống sẽ dựng mô hình 3D và hiển thị lên giao diện. Người dùng có thể thực hiện các thao tác tương tác như phóng to, thu nhỏ hoặc xoay mô hình để quan sát chi tiết hơn. Quá trình xử lý bao gồm các thành phần như người dùng, giao diện web, bộ xử lý mô hình 3D và cơ sở dữ liệu. _(Hình 2.21: Sequence Diagram – Xem mô hình 3D tòa nhà)_

2.7.3 Sơ đồ trình tự chức năng xem thông tin căn hộ

Chức năng này cho phép người dùng xem thông tin chi tiết của một căn hộ cụ thể trong tòa nhà. Khi người dùng chọn một căn hộ trên mô hình 3D hoặc trên danh sách căn hộ, hệ thống sẽ gửi yêu cầu truy vấn đến dịch vụ quản lý căn hộ. Dịch vụ này sẽ truy xuất dữ liệu từ cơ sở dữ liệu và trả về thông tin chi tiết của căn hộ như diện tích, trạng thái, giá thuê và thông tin người thuê. Thông tin sau đó sẽ được hiển thị trên giao diện để người dùng có thể theo dõi và tra cứu. _(Hình 2.22: Sequence Diagram – Xem thông tin căn hộ)_

2.7.4 Sơ đồ trình tự chức năng thêm căn hộ mới

Chức năng này được sử dụng bởi quản trị viên hoặc người quản lý hệ thống để thêm một căn hộ mới vào hệ thống quản lý. Người quản trị sẽ nhập các thông tin cần thiết của căn hộ trên giao diện quản lý. Sau đó hệ thống sẽ gửi yêu cầu đến dịch vụ quản lý căn hộ để kiểm tra dữ liệu và lưu thông tin vào cơ sở dữ liệu. Sau khi quá trình lưu dữ liệu thành công, hệ thống sẽ trả về thông báo cho người quản trị biết rằng căn hộ đã được thêm thành công. _(Hình 2.23: Sequence Diagram – Thêm căn hộ mới)_

2.7.5 Sơ đồ trình tự chức năng tạo hợp đồng thuê

Chức năng tạo hợp đồng thuê cho phép người quản lý nhập thông tin hợp đồng thuê khi một căn hộ được cho thuê. Sau khi nhập thông tin hợp đồng, hệ thống sẽ kiểm tra trạng thái của căn hộ trong cơ sở dữ liệu để đảm bảo căn hộ chưa được thuê. Nếu căn hộ hợp lệ, hệ thống sẽ lưu thông tin hợp đồng thuê và cập nhật trạng thái căn hộ thành đã được thuê. Sau khi quá trình này hoàn tất, hệ thống sẽ thông báo kết quả cho người quản lý trên giao diện. _(Hình 2.24: Sequence Diagram – Tạo hợp đồng thuê)_

2.7.6 Sơ đồ trình tự chức năng quản lý người dùng

Chức năng quản lý người dùng cho phép Manager/Admin quản lý các tài khoản người dùng trong hệ thống. Khi quản trị viên truy cập vào trang quản lý người dùng, giao diện hệ thống sẽ gửi yêu cầu đến dịch vụ quản lý người dùng để truy vấn danh sách tài khoản từ User Database. Hệ thống sau đó trả về danh sách người dùng và hiển thị trên giao diện. Quản trị viên có thể thực hiện các thao tác như thêm người dùng mới, cập nhật thông tin hoặc thay đổi trạng thái tài khoản. Khi các thao tác này được thực hiện, giao diện hệ thống sẽ gửi dữ liệu đến dịch vụ xử lý để kiểm tra và cập nhật thông tin trong cơ sở dữ liệu. Sau khi quá trình xử lý hoàn tất, hệ thống sẽ gửi kết quả về giao diện và hiển thị thông báo cho quản trị viên. _(Sequence Diagram – Quản lý người dùng)_
