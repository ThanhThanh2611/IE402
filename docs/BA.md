2.5 Use Case Diagram

2.5.1 Tổng quan Use Case Diagram của hệ thống

Use Case Diagram được sử dụng để mô tả các chức năng chính của hệ thống và cách các tác nhân (actors) tương tác với hệ thống. Sơ đồ này giúp xác định các chức năng nghiệp vụ mà hệ thống cần cung cấp cũng như mối quan hệ giữa người dùng và các chức năng đó.

Trong hệ thống 3D GIS Apartment Management System, các tác nhân chính bao gồm:

- **User**: Người dùng thông thường, có thể truy cập bản đồ, xem thông tin tòa nhà, căn hộ và thống kê dữ liệu.

- **Manager**: Người quản lý hệ thống, có quyền quản lý thông tin căn hộ, hợp đồng thuê và cập nhật trạng thái dữ liệu.

Hệ thống được chia thành các nhóm chức năng chính:

- Chức năng bản đồ GIS

- Chức năng hiển thị mô hình tòa nhà 3D

- Chức năng xem thông tin căn hộ

- Chức năng quản lý căn hộ

- Chức năng quản lý hợp đồng thuê

- Chức năng dashboard và thống kê dữ liệu

Các chức năng này được mô hình hóa thông qua các Use Case để thể hiện rõ cách người dùng tương tác với hệ thống.

_(Hình 2.x: Use Case Diagram tổng thể của hệ thống)_

---

2.5.2 Danh sách Actors

| Actor    | Mô tả                                                                       |
| -------- | --------------------------------------------------------------------------- |
| **User** | Người sử dụng hệ thống để xem bản đồ, thông tin tòa nhà, căn hộ và thống kê |

|
| **Manager** | Người quản lý hệ thống, có quyền cập nhật và quản lý dữ liệu

|

---

2.5.3 Danh sách Use Cases của hệ thống

**Nhóm chức năng bản đồ GIS**

| ID   | Use Case      | Mô tả                     |
| ---- | ------------- | ------------------------- |
| UC01 | View City Map | Hiển thị bản đồ thành phố |

|
| UC02 | View Building Locations | Hiển thị vị trí các tòa nhà trên bản đồ

|
| UC03 | Filter Buildings | Lọc các tòa nhà theo tiêu chí

|
| UC04 | View Occupancy Rate | Xem tỷ lệ lấp đầy của tòa nhà

|
| UC05 | Select Building | Chọn tòa nhà để xem chi tiết

|

**Nhóm chức năng hiển thị tòa nhà 3D**

| ID   | Use Case               | Mô tả                           |
| ---- | ---------------------- | ------------------------------- |
| UC06 | View 3D Building Model | Hiển thị mô hình 3D của tòa nhà |

|
| UC07 | View Floors | Hiển thị các tầng trong tòa nhà

|
| UC08 | View Apartment Units | Hiển thị các căn hộ

|
| UC09 | Zoom / Rotate 3D Model | Phóng to hoặc xoay mô hình 3D

|

**Nhóm chức năng thông tin căn hộ**

| ID   | Use Case               | Mô tả                         |
| ---- | ---------------------- | ----------------------------- |
| UC10 | View Apartment Details | Xem thông tin chi tiết căn hộ |

|
| UC11 | View Apartment Status | Xem trạng thái căn hộ

|
| UC12 | View Rental Price | Xem giá thuê căn hộ

|
| UC13 | View Tenant Information | Xem thông tin người thuê

|

**Nhóm chức năng quản lý căn hộ**

| ID   | Use Case      | Mô tả           |
| ---- | ------------- | --------------- |
| UC14 | Add Apartment | Thêm căn hộ mới |

|
| UC15 | Update Apartment Information | Cập nhật thông tin căn hộ

|
| UC16 | Delete Apartment | Xóa căn hộ

|
| UC17 | Update Apartment Status | Cập nhật trạng thái căn hộ

|

**Nhóm chức năng quản lý hợp đồng thuê**

| ID   | Use Case            | Mô tả              |
| ---- | ------------------- | ------------------ |
| UC18 | Add Rental Contract | Thêm hợp đồng thuê |

|
| UC19 | Edit Rental Contract | Chỉnh sửa hợp đồng

|
| UC20 | Delete Rental Contract | Xóa hợp đồng

|
| UC21 | View Contract Information | Xem thông tin hợp đồng

|

**Nhóm chức năng dashboard và thống kê**

| ID   | Use Case       | Mô tả              |
| ---- | -------------- | ------------------ |
| UC22 | View Dashboard | Hiển thị dashboard |

|
| UC23 | View Occupancy Statistics | Thống kê tỷ lệ lấp đầy

|
| UC24 | View Revenue Statistics | Thống kê doanh thu

|
| UC25 | View Time Series Data | Hiển thị dữ liệu theo thời gian

|

---

2.5.4 Đặc tả Use Case

Phần này mô tả chi tiết các Use Case quan trọng của hệ thống 3D GIS Apartment Management System. Mỗi Use Case được đặc tả thông qua các thành phần: tác nhân, mô tả chức năng, điều kiện trước, điều kiện sau và luồng xử lý chính.

Use Case 1: Xem bản đồ thành phố (View City Map)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC01  |

|
| Tên Use Case | Xem bản đồ thành phố

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép người dùng truy cập và xem bản đồ tổng thể của thành phố trên hệ thống GIS.

|
| Điều kiện trước | Hệ thống đã được khởi động.

|
| Điều kiện sau | Bản đồ thành phố được hiển thị trên giao diện người dùng.

|

**Luồng chính**

1. Người dùng truy cập hệ thống.

2. Người dùng chọn chức năng Xem bản đồ thành phố.

3. Hệ thống tải dữ liệu bản đồ từ cơ sở dữ liệu.

4. Hệ thống hiển thị bản đồ thành phố trên giao diện.

Use Case 2: Xem vị trí các tòa nhà (View Building Locations)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC02  |

|
| Tên Use Case | Xem vị trí các tòa nhà

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị vị trí của các tòa nhà căn hộ trên bản đồ GIS.

|
| Điều kiện trước | Bản đồ thành phố đã được hiển thị.

|
| Điều kiện sau | Các tòa nhà được hiển thị dưới dạng điểm hoặc biểu tượng trên bản đồ.

|

**Luồng chính**

1. Người dùng mở bản đồ thành phố.

2. Hệ thống truy xuất dữ liệu vị trí tòa nhà.

3. Hệ thống hiển thị các tòa nhà trên bản đồ.

Use Case 3: Lọc các tòa nhà (Filter Buildings)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC03  |

|
| Tên Use Case | Lọc các tòa nhà

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép người dùng lọc các tòa nhà dựa trên các tiêu chí như khu vực, giá thuê hoặc tỷ lệ lấp đầy.

|
| Điều kiện trước | Danh sách tòa nhà đã được hiển thị trên bản đồ.

|
| Điều kiện sau | Các tòa nhà thỏa điều kiện lọc được hiển thị.

|

**Luồng chính**

1. Người dùng chọn chức năng Lọc tòa nhà.

2. Người dùng nhập các tiêu chí lọc.

3. Hệ thống xử lý điều kiện lọc.

4. Hệ thống hiển thị danh sách tòa nhà phù hợp.

Use Case 4: Xem tỷ lệ lấp đầy (View Occupancy Rate)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC04  |

|
| Tên Use Case | Xem tỷ lệ lấp đầy

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị tỷ lệ căn hộ đã được thuê trong một tòa nhà.

|
| Điều kiện trước | Người dùng đã chọn một tòa nhà.

|
| Điều kiện sau | Thông tin tỷ lệ lấp đầy được hiển thị.

|

**Luồng chính**

1. Người dùng chọn một tòa nhà.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống tính toán tỷ lệ lấp đầy.

4. Hệ thống hiển thị kết quả.

Use Case 5: Chọn tòa nhà (Select Building)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC05  |

|
| Tên Use Case | Chọn tòa nhà

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép người dùng chọn một tòa nhà trên bản đồ để xem chi tiết.

|
| Điều kiện trước | Bản đồ đã hiển thị các tòa nhà.

|
| Điều kiện sau | Tòa nhà được chọn và thông tin chi tiết có thể được truy cập.

|

**Luồng chính**

1. Người dùng nhấp vào một tòa nhà trên bản đồ.

2. Hệ thống nhận diện tòa nhà được chọn.

3. Hệ thống hiển thị thông tin cơ bản của tòa nhà.

Use Case 6: Xem mô hình tòa nhà 3D (View 3D Building Model)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC06  |

|
| Tên Use Case | Xem mô hình tòa nhà 3D

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép người dùng xem mô hình 3D của tòa nhà đã chọn.

|
| Điều kiện trước | Người dùng đã chọn một tòa nhà.

|
| Điều kiện sau | Mô hình 3D của tòa nhà được hiển thị.

|

**Luồng chính**

1. Người dùng chọn một tòa nhà.

2. Hệ thống tải dữ liệu mô hình 3D.

3. Hệ thống hiển thị mô hình 3D.

Use Case 7: Xem các tầng (View Floors)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC07  |

|
| Tên Use Case | Xem các tầng

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị cấu trúc các tầng trong tòa nhà.

|
| Điều kiện trước | Mô hình tòa nhà 3D đã được hiển thị.

|
| Điều kiện sau | Danh sách các tầng được hiển thị.

|

**Luồng chính**

1. Người dùng chọn chức năng xem tầng.

2. Hệ thống truy xuất dữ liệu tầng.

3. Hệ thống hiển thị danh sách các tầng.

Use Case 8: Xem các căn hộ (View Apartment Units)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC08  |

|
| Tên Use Case | Xem các căn hộ

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị các căn hộ trong một tầng của tòa nhà.

|
| Điều kiện trước | Người dùng đã chọn một tầng.

|
| Điều kiện sau | Các căn hộ được hiển thị trên giao diện.

|

**Luồng chính**

1. Người dùng chọn một tầng.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống hiển thị danh sách căn hộ.

Use Case 9: Phóng to / Xoay mô hình 3D (Zoom / Rotate 3D Model)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC09  |

|
| Tên Use Case | Phóng to / xoay mô hình 3D

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép người dùng tương tác với mô hình 3D bằng cách phóng to, thu nhỏ hoặc xoay.

|
| Điều kiện trước | Mô hình 3D đã được hiển thị.

|
| Điều kiện sau | Góc nhìn mô hình được thay đổi.

|

**Luồng chính**

1. Người dùng sử dụng công cụ điều khiển.

2. Hệ thống cập nhật góc nhìn mô hình.

3. Mô hình 3D được hiển thị theo góc nhìn mới.

Use Case 10: Xem thông tin chi tiết căn hộ (View Apartment Details)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC10  |

|
| Tên Use Case | Xem thông tin chi tiết căn hộ

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép người dùng xem thông tin chi tiết của một căn hộ.

|
| Điều kiện trước | Người dùng đã chọn căn hộ.

|
| Điều kiện sau | Thông tin chi tiết được hiển thị.

|

**Luồng chính**

1. Người dùng chọn một căn hộ.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống hiển thị thông tin chi tiết.

Use Case 11: Xem trạng thái căn hộ (View Apartment Status)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC11  |

|
| Tên Use Case | Xem trạng thái căn hộ

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị trạng thái của căn hộ (đã thuê hoặc còn trống).

|
| Điều kiện trước | Căn hộ đã được chọn.

|
| Điều kiện sau | Trạng thái căn hộ được hiển thị.

|

**Luồng chính**

1. Người dùng chọn căn hộ.

2. Hệ thống truy xuất trạng thái căn hộ.

3. Hệ thống hiển thị trạng thái.

Use Case 12: Xem giá thuê căn hộ (View Rental Price)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC12  |

|
| Tên Use Case | Xem giá thuê căn hộ

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị giá thuê của căn hộ.

|
| Điều kiện trước | Căn hộ đã được chọn.

|
| Điều kiện sau | Giá thuê được hiển thị.

|

**Luồng chính**

1. Người dùng chọn căn hộ.

2. Hệ thống truy xuất dữ liệu giá thuê.

3. Hệ thống hiển thị giá thuê.

Use Case 13: Xem thông tin người thuê (View Tenant Information)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC13  |

|
| Tên Use Case | Xem thông tin người thuê

|
| Tác nhân | Người dùng

|
| Mô tả | Cho phép xem thông tin của người đang thuê căn hộ.

|
| Điều kiện trước | Căn hộ đã có người thuê.

|
| Điều kiện sau | Thông tin người thuê được hiển thị.

|

**Luồng chính**

1. Người dùng chọn căn hộ.

2. Hệ thống truy xuất dữ liệu người thuê.

3. Hệ thống hiển thị thông tin người thuê.

Use Case 14: Thêm căn hộ (Add Apartment)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC14  |

|
| Tên Use Case | Thêm căn hộ

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý thêm một căn hộ mới vào hệ thống quản lý.

|
| Điều kiện trước | Quản lý đã đăng nhập vào hệ thống.

|
| Điều kiện sau | Thông tin căn hộ mới được lưu vào cơ sở dữ liệu.

|

**Luồng chính**

1. Quản lý chọn chức năng Thêm căn hộ.

2. Hệ thống hiển thị biểu mẫu nhập thông tin căn hộ.

3. Quản lý nhập các thông tin cần thiết (mã căn hộ, tầng, diện tích, giá thuê, trạng thái).

4. Quản lý xác nhận lưu thông tin.

5. Hệ thống kiểm tra tính hợp lệ của dữ liệu.

6. Hệ thống lưu thông tin căn hộ vào cơ sở dữ liệu.

Use Case 15: Cập nhật thông tin căn hộ (Update Apartment Information)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC15  |

|
| Tên Use Case | Cập nhật thông tin căn hộ

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý chỉnh sửa hoặc cập nhật thông tin của căn hộ.

|
| Điều kiện trước | Căn hộ đã tồn tại trong hệ thống.

|
| Điều kiện sau | Thông tin căn hộ được cập nhật thành công.

|

**Luồng chính**

1. Quản lý chọn căn hộ cần cập nhật.

2. Hệ thống hiển thị thông tin hiện tại của căn hộ.

3. Quản lý chỉnh sửa các thông tin cần thay đổi.

4. Quản lý xác nhận cập nhật.

5. Hệ thống kiểm tra dữ liệu.

6. Hệ thống lưu thông tin đã cập nhật.

Use Case 16: Xóa căn hộ (Delete Apartment)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC16  |

|
| Tên Use Case | Xóa căn hộ

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý xóa một căn hộ khỏi hệ thống.

|
| Điều kiện trước | Căn hộ tồn tại trong hệ thống.

|
| Điều kiện sau | Căn hộ bị xóa khỏi cơ sở dữ liệu.

|

**Luồng chính**

1. Quản lý chọn căn hộ cần xóa.

2. Hệ thống hiển thị thông tin căn hộ.

3. Quản lý xác nhận xóa.

4. Hệ thống kiểm tra các ràng buộc dữ liệu.

5. Hệ thống xóa thông tin căn hộ khỏi cơ sở dữ liệu.

Use Case 17: Cập nhật trạng thái căn hộ (Update Apartment Status)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC17  |

|
| Tên Use Case | Cập nhật trạng thái căn hộ

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý thay đổi trạng thái của căn hộ (đã thuê, còn trống, đang bảo trì).

|
| Điều kiện trước | Căn hộ tồn tại trong hệ thống.

|
| Điều kiện sau | Trạng thái căn hộ được cập nhật.

|

**Luồng chính**

1. Quản lý chọn căn hộ.

2. Quản lý chọn chức năng Cập nhật trạng thái.

3. Quản lý chọn trạng thái mới.

4. Hệ thống lưu trạng thái mới vào cơ sở dữ liệu.

5. Hệ thống hiển thị thông báo cập nhật thành công.

Use Case 18: Thêm hợp đồng thuê (Add Rental Contract)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC18  |

|
| Tên Use Case | Thêm hợp đồng thuê

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý tạo hợp đồng thuê cho một căn hộ.

|
| Điều kiện trước | Căn hộ tồn tại và chưa có hợp đồng thuê đang hoạt động.

|
| Điều kiện sau | Hợp đồng thuê được lưu vào hệ thống.

|

**Luồng chính**

1. Quản lý chọn chức năng Thêm hợp đồng thuê.

2. Hệ thống hiển thị biểu mẫu nhập thông tin hợp đồng.

3. Quản lý nhập thông tin người thuê và thời gian thuê.

4. Quản lý xác nhận lưu hợp đồng.

5. Hệ thống kiểm tra dữ liệu.

6. Hệ thống lưu hợp đồng vào cơ sở dữ liệu.

Use Case 19: Chỉnh sửa hợp đồng thuê (Edit Rental Contract)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC19  |

|
| Tên Use Case | Chỉnh sửa hợp đồng thuê

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý chỉnh sửa thông tin của hợp đồng thuê.

|
| Điều kiện trước | Hợp đồng thuê tồn tại trong hệ thống.

|
| Điều kiện sau | Thông tin hợp đồng được cập nhật.

|

**Luồng chính**

1. Quản lý chọn hợp đồng cần chỉnh sửa.

2. Hệ thống hiển thị thông tin hợp đồng.

3. Quản lý chỉnh sửa thông tin.

4. Quản lý xác nhận cập nhật.

5. Hệ thống lưu thông tin mới vào cơ sở dữ liệu.

Use Case 20: Xóa hợp đồng thuê (Delete Rental Contract)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC20  |

|
| Tên Use Case | Xóa hợp đồng thuê

|
| Tác nhân | Quản lý

|
| Mô tả | Cho phép quản lý xóa một hợp đồng thuê khỏi hệ thống.

|
| Điều kiện trước | Hợp đồng tồn tại trong hệ thống.

|
| Điều kiện sau | Hợp đồng bị xóa khỏi cơ sở dữ liệu.

|

**Luồng chính**

1. Quản lý chọn hợp đồng cần xóa.

2. Hệ thống hiển thị thông tin hợp đồng.

3. Quản lý xác nhận xóa.

4. Hệ thống xóa hợp đồng khỏi cơ sở dữ liệu.

Use Case 21: Xem thông tin hợp đồng (View Contract Information)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC21  |

|
| Tên Use Case | Xem thông tin hợp đồng

|
| Tác nhân | Người dùng, Quản lý

|
| Mô tả | Cho phép xem chi tiết thông tin của hợp đồng thuê.

|
| Điều kiện trước | Hợp đồng tồn tại trong hệ thống.

|
| Điều kiện sau | Thông tin hợp đồng được hiển thị.

|

**Luồng chính**

1. Người dùng chọn hợp đồng.

2. Hệ thống truy xuất dữ liệu hợp đồng.

3. Hệ thống hiển thị thông tin chi tiết.

Use Case 22: Xem Dashboard (View Dashboard)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC22  |

|
| Tên Use Case | Xem Dashboard

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị các thông tin tổng hợp và dữ liệu phân tích của hệ thống.

|
| Điều kiện trước | Người dùng truy cập hệ thống.

|
| Điều kiện sau | Dashboard hiển thị các biểu đồ và số liệu thống kê.

|

**Luồng chính**

1. Người dùng chọn chức năng Dashboard.

2. Hệ thống tải dữ liệu thống kê.

3. Hệ thống hiển thị các biểu đồ.

Use Case 23: Xem thống kê tỷ lệ lấp đầy (View Occupancy Statistics)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC23  |

|
| Tên Use Case | Xem thống kê tỷ lệ lấp đầy

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị thống kê tỷ lệ căn hộ đã được thuê theo từng tòa nhà.

|
| Điều kiện trước | Hệ thống có dữ liệu căn hộ và hợp đồng thuê.

|
| Điều kiện sau | Thống kê được hiển thị dưới dạng biểu đồ.

|

**Luồng chính**

1. Người dùng chọn mục Thống kê tỷ lệ lấp đầy.

2. Hệ thống truy xuất dữ liệu căn hộ.

3. Hệ thống tính toán tỷ lệ.

4. Hệ thống hiển thị biểu đồ thống kê.

Use Case 24: Xem thống kê doanh thu (View Revenue Statistics)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC24  |

|
| Tên Use Case | Xem thống kê doanh thu

|
| Tác nhân | Quản lý

|
| Mô tả | Hiển thị dữ liệu doanh thu từ các hợp đồng thuê.

|
| Điều kiện trước | Hệ thống có dữ liệu hợp đồng thuê.

|
| Điều kiện sau | Biểu đồ doanh thu được hiển thị.

|

**Luồng chính**

1. Quản lý chọn mục Thống kê doanh thu.

2. Hệ thống truy xuất dữ liệu hợp đồng.

3. Hệ thống tính toán tổng doanh thu.

4. Hệ thống hiển thị biểu đồ doanh thu.

Use Case 25: Xem dữ liệu theo thời gian (View Time Series Data)

| Thuộc tính  | Mô tả |
| ----------- | ----- |
| Mã Use Case | UC25  |

|
| Tên Use Case | Xem dữ liệu theo thời gian

|
| Tác nhân | Người dùng

|
| Mô tả | Hiển thị dữ liệu thống kê theo từng khoảng thời gian.

|
| Điều kiện trước | Hệ thống có dữ liệu lịch sử.

|
| Điều kiện sau | Dữ liệu được hiển thị dưới dạng biểu đồ thời gian.

|

**Luồng chính**

1. Người dùng chọn khoảng thời gian cần xem.

2. Hệ thống truy xuất dữ liệu tương ứng.

3. Hệ thống hiển thị biểu đồ theo thời gian.

---

2.6 Sơ đồ luồng dữ liệu của ứng dụng (Data Flow Diagram – DFD)

Sơ đồ luồng dữ liệu (Data Flow Diagram – DFD) là một công cụ quan trọng trong quá trình phân tích và thiết kế hệ thống thông tin. DFD được sử dụng nhằm mô tả cách dữ liệu được xử lý, lưu trữ và luân chuyển giữa các thành phần khác nhau trong hệ thống. Thông qua việc sử dụng DFD, các nhà phát triển có thể hiểu rõ quá trình xử lý dữ liệu trong hệ thống, từ đó hỗ trợ việc thiết kế và triển khai hệ thống một cách hiệu quả.

Trong mô hình DFD, hệ thống được mô tả thông qua bốn thành phần cơ bản:

- **External Entity (Tác nhân ngoài)**: là các đối tượng bên ngoài hệ thống nhưng có sự tương tác với hệ thống thông qua việc gửi hoặc nhận dữ liệu.

- **Process (Tiến trình)**: biểu diễn các hoạt động xử lý dữ liệu trong hệ thống.

- **Data Store (Kho dữ liệu)**: nơi lưu trữ dữ liệu của hệ thống, thường là cơ sở dữ liệu.

- **Data Flow (Luồng dữ liệu)**: thể hiện sự di chuyển của dữ liệu giữa các thành phần trong hệ thống.

Đối với hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS, DFD được sử dụng để mô tả cách dữ liệu được trao đổi giữa người dùng, người quản lý và các thành phần xử lý trong hệ thống. Hệ thống cho phép người dùng xem bản đồ, tra cứu thông tin căn hộ và tòa nhà, đồng thời hỗ trợ người quản lý thực hiện các chức năng quản lý căn hộ và hợp đồng thuê.

Để mô tả hệ thống một cách rõ ràng, DFD được xây dựng theo ba cấp độ bao gồm:

- **DFD Level 0 (Context Diagram)**: mô tả hệ thống ở mức tổng quan.

- **DFD Level 1**: phân rã hệ thống thành các chức năng chính.

- **DFD Level 2**: mô tả chi tiết các tiến trình xử lý dữ liệu.

  2.6.1 Sơ đồ ngữ cảnh của hệ thống (DFD Level 0)

Sơ đồ ngữ cảnh (Context Diagram) là cấp độ cao nhất của sơ đồ luồng dữ liệu, trong đó toàn bộ hệ thống được biểu diễn dưới dạng một tiến trình duy nhất. Sơ đồ này giúp xác định phạm vi của hệ thống và các tương tác giữa hệ thống với các tác nhân bên ngoài.

Trong hệ thống quản lý cho thuê chung cư, tiến trình trung tâm là Hệ thống Quản lý Cho thuê Chung cư. Hệ thống tương tác với hai tác nhân chính là User và Manager/Admin.

- **User**: là người sử dụng hệ thống để thực hiện các chức năng như xem bản đồ, xem thông tin tòa nhà hoặc tra cứu thông tin căn hộ. Người dùng gửi các yêu cầu truy vấn dữ liệu đến hệ thống và nhận kết quả hiển thị từ hệ thống.

- **Manager/Admin**: là người quản lý hệ thống, có quyền thực hiện các thao tác quản lý dữ liệu như cập nhật thông tin căn hộ, quản lý hợp đồng thuê và yêu cầu báo cáo thống kê. Các yêu cầu này sẽ được hệ thống xử lý và trả về kết quả tương ứng.

Sau khi nhận các yêu cầu từ các tác nhân, hệ thống sẽ thực hiện việc xử lý dữ liệu và đọc/ghi dữ liệu từ Database để lưu trữ hoặc truy xuất thông tin cần thiết.

_(Hình 2.x minh họa sơ đồ ngữ cảnh của hệ thống quản lý cho thuê chung cư.)_

2.6.2 Sơ đồ luồng dữ liệu mức 1 (DFD Level 1)

Sơ đồ DFD Level 1 được xây dựng bằng cách phân rã tiến trình tổng thể của hệ thống thành các tiến trình xử lý chính nhằm mô tả chi tiết hơn cách dữ liệu được xử lý trong hệ thống. Trong hệ thống quản lý cho thuê chung cư, hệ thống được phân rã thành bốn tiến trình chính bao gồm:

- **1.0 Quản lý bản đồ và tòa nhà** Tiến trình này chịu trách nhiệm xử lý các yêu cầu liên quan đến việc hiển thị bản đồ và thông tin tòa nhà. Khi người dùng gửi yêu cầu xem bản đồ hoặc thông tin tòa nhà, hệ thống sẽ truy vấn dữ liệu từ Map Database và Building Database. Sau đó, dữ liệu sẽ được xử lý và hiển thị lại cho người dùng.

- **2.0 Quản lý thông tin căn hộ** Tiến trình này cho phép người dùng tra cứu thông tin căn hộ và cho phép quản trị viên cập nhật thông tin căn hộ. Các dữ liệu liên quan đến căn hộ sẽ được truy xuất hoặc cập nhật trong Apartment Database.

- **3.0 Quản lý hợp đồng thuê** Tiến trình này xử lý các thao tác liên quan đến hợp đồng thuê căn hộ như tạo hợp đồng, cập nhật hợp đồng hoặc truy vấn hợp đồng thuê. Các dữ liệu hợp đồng được lưu trữ trong Rental Contract Database.

- **4.0 Thống kê và báo cáo** Tiến trình này thực hiện việc tổng hợp dữ liệu từ các cơ sở dữ liệu như Apartment Database và Rental Contract Database để tạo ra các báo cáo hoặc thống kê phục vụ cho việc quản lý của Manager/Admin.

Các kho dữ liệu chính được sử dụng trong hệ thống bao gồm:

- **Map Database**: lưu trữ dữ liệu bản đồ GIS.

- **Building Database**: lưu trữ thông tin các tòa nhà.

- **Apartment Database**: lưu trữ thông tin chi tiết các căn hộ.

- **Rental Contract Database**: lưu trữ dữ liệu hợp đồng thuê.

Thông qua các tiến trình này, hệ thống có thể xử lý các yêu cầu truy vấn thông tin của người dùng cũng như hỗ trợ người quản lý thực hiện các chức năng quản lý dữ liệu.

_(Hình 2.x minh họa sơ đồ DFD Level 1 của hệ thống.)_

2.6.3 Sơ đồ luồng dữ liệu mức 2 (DFD Level 2)

Sơ đồ DFD Level 2 được xây dựng nhằm mô tả chi tiết hơn các tiến trình đã được trình bày trong Level 1. Trong hệ thống này, tiến trình Quản lý thông tin căn hộ và Quản lý hợp đồng thuê được phân rã thành các tiến trình nhỏ hơn để thể hiện rõ cách dữ liệu được xử lý.

**Phân rã tiến trình quản lý căn hộ** Tiến trình quản lý căn hộ được chia thành các chức năng nhỏ bao gồm:

- **2.1 Tra cứu căn hộ**: người dùng gửi yêu cầu tra cứu thông tin căn hộ, hệ thống truy vấn dữ liệu từ Apartment Database và trả kết quả cho người dùng.

- **2.1.1 Thêm căn hộ**: quản trị viên nhập thông tin căn hộ mới và hệ thống lưu dữ liệu vào cơ sở dữ liệu.

- **2.1.2 Cập nhật căn hộ**: quản trị viên cập nhật thông tin của căn hộ hiện có trong hệ thống.

- **2.1.3 Xóa căn hộ**: quản trị viên có thể xóa thông tin căn hộ không còn sử dụng.

  **Phân rã tiến trình quản lý hợp đồng thuê** Tiến trình quản lý hợp đồng thuê được chia thành các bước xử lý bao gồm:

- **2.2.1 Tạo hợp đồng**: quản trị viên tạo hợp đồng thuê mới và hệ thống lưu thông tin vào Contract Database.

- **2.2.2 Cập nhật hợp đồng**: hệ thống cho phép cập nhật các thông tin của hợp đồng thuê.

- **2.2.3 Hủy hợp đồng**: khi hợp đồng không còn hiệu lực, quản trị viên có thể thực hiện thao tác hủy hợp đồng.

- **2.2.4 Tra cứu hợp đồng**: hệ thống cho phép tìm kiếm và hiển thị thông tin hợp đồng thuê.

Các tiến trình này tương tác trực tiếp với các kho dữ liệu tương ứng để đảm bảo dữ liệu được lưu trữ và truy xuất chính xác. Việc phân rã hệ thống thành nhiều cấp độ DFD giúp mô tả chi tiết cách dữ liệu được xử lý trong hệ thống, đồng thời hỗ trợ việc thiết kế và phát triển hệ thống một cách có cấu trúc và rõ ràng.

_(Hình 2.x minh họa sơ đồ DFD Level 2 của hệ thống quản lý cho thuê chung cư.)_

---

2.7 Sơ đồ trình tự (Sequence Diagram)

Sơ đồ trình tự (Sequence Diagram) được sử dụng để mô tả trình tự tương tác giữa các thành phần của hệ thống theo thời gian khi thực hiện một chức năng cụ thể. Thông qua sơ đồ này, có thể thấy được cách mà tác nhân (Actor), giao diện hệ thống, các dịch vụ xử lý và cơ sở dữ liệu trao đổi thông tin với nhau để hoàn thành một nghiệp vụ.

Trong hệ thống quản lý cho thuê chung cư sử dụng công nghệ GIS 3D, các sơ đồ trình tự được xây dựng cho một số chức năng quan trọng nhằm mô tả chi tiết cách hệ thống xử lý yêu cầu của người dùng. Các sơ đồ được xây dựng bao gồm:

- Xem bản đồ và chọn tòa nhà

- Xem mô hình 3D tòa nhà

- Xem thông tin chi tiết căn hộ

- Thêm căn hộ mới

- Tạo hợp đồng thuê

  2.7.1 Sơ đồ trình tự chức năng xem bản đồ và chọn tòa nhà

Chức năng này cho phép người dùng truy cập vào hệ thống để xem bản đồ tổng thể của thành phố và lựa chọn một tòa nhà cụ thể để xem thông tin chi tiết. Khi người dùng truy cập hệ thống, giao diện sẽ gửi yêu cầu đến dịch vụ GIS để tải dữ liệu bản đồ từ cơ sở dữ liệu. Sau khi dữ liệu bản đồ được tải, hệ thống hiển thị bản đồ lên giao diện người dùng. Người dùng có thể lựa chọn một tòa nhà trên bản đồ để xem thông tin liên quan. Quá trình tương tác giữa các thành phần bao gồm: người dùng, giao diện web, dịch vụ GIS và cơ sở dữ liệu.

_(Hình 2.20: Sequence Diagram – Xem bản đồ và chọn tòa nhà)_

2.7.2 Sơ đồ trình tự chức năng xem mô hình 3D tòa nhà

Chức năng này cho phép người dùng xem mô hình 3D của tòa nhà sau khi đã lựa chọn tòa nhà trên bản đồ. Khi người dùng yêu cầu hiển thị mô hình 3D, giao diện hệ thống sẽ gửi yêu cầu đến bộ xử lý đồ họa 3D để tải dữ liệu mô hình từ cơ sở dữ liệu. Sau đó hệ thống sẽ dựng mô hình 3D và hiển thị lên giao diện. Người dùng có thể thực hiện các thao tác tương tác như phóng to, thu nhỏ hoặc xoay mô hình để quan sát chi tiết hơn. Quá trình xử lý bao gồm các thành phần như người dùng, giao diện web, bộ xử lý mô hình 3D và cơ sở dữ liệu.

_(Hình 2.21: Sequence Diagram – Xem mô hình 3D tòa nhà)_

2.7.3 Sơ đồ trình tự chức năng xem thông tin căn hộ

Chức năng này cho phép người dùng xem thông tin chi tiết của một căn hộ cụ thể trong tòa nhà. Khi người dùng chọn một căn hộ trên mô hình 3D hoặc trên danh sách căn hộ, hệ thống sẽ gửi yêu cầu truy vấn đến dịch vụ quản lý căn hộ. Dịch vụ này sẽ truy xuất dữ liệu từ cơ sở dữ liệu và trả về thông tin chi tiết của căn hộ như diện tích, trạng thái, giá thuê và thông tin người thuê. Thông tin sau đó sẽ được hiển thị trên giao diện để người dùng có thể theo dõi và tra cứu.

_(Hình 2.22: Sequence Diagram – Xem thông tin căn hộ)_

2.7.4 Sơ đồ trình tự chức năng thêm căn hộ mới

Chức năng này được sử dụng bởi quản trị viên hoặc người quản lý hệ thống để thêm một căn hộ mới vào hệ thống quản lý. Người quản trị sẽ nhập các thông tin cần thiết của căn hộ trên giao diện quản lý. Sau đó hệ thống sẽ gửi yêu cầu đến dịch vụ quản lý căn hộ để kiểm tra dữ liệu và lưu thông tin vào cơ sở dữ liệu. Sau khi quá trình lưu dữ liệu thành công, hệ thống sẽ trả về thông báo cho người quản trị biết rằng căn hộ đã được thêm thành công.

_(Hình 2.23: Sequence Diagram – Thêm căn hộ mới)_

2.7.5 Sơ đồ trình tự chức năng tạo hợp đồng thuê

Chức năng tạo hợp đồng thuê cho phép người quản lý nhập thông tin hợp đồng thuê khi một căn hộ được cho thuê. Sau khi nhập thông tin hợp đồng, hệ thống sẽ kiểm tra trạng thái của căn hộ trong cơ sở dữ liệu để đảm bảo căn hộ chưa được thuê. Nếu căn hộ hợp lệ, hệ thống sẽ lưu thông tin hợp đồng thuê và cập nhật trạng thái căn hộ thành đã được thuê. Sau khi quá trình này hoàn tất, hệ thống sẽ thông báo kết quả cho người quản lý trên giao diện.

_(Hình 2.24: Sequence Diagram – Tạo hợp đồng thuê)_
