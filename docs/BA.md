Dưới đây là nội dung tài liệu PDF đã được chuyển đổi sang định dạng Markdown chi tiết, kèm theo các trích dẫn nguồn theo đúng yêu cầu của bạn:

## [cite_start]2.5 Use Case Diagram [cite: 1]

### [cite_start]2.5.1 Tổng quan Use Case Diagram của hệ thống [cite: 2]

[cite_start]Use Case Diagram là một trong những sơ đồ quan trọng trong mô hình hóa hệ thống theo UML, được sử dụng nhằm mô tả các chức năng chính mà hệ thống cung cấp cũng như cách các tác nhân bên ngoài tương tác với hệ thống[cite: 3]. [cite_start]Thông qua sơ đồ này, có thể xác định được phạm vi chức năng của hệ thống, vai trò của từng đối tượng sử dụng và mối quan hệ giữa người dùng với các chức năng nghiệp vụ[cite: 4].

[cite_start]Trong đề tài 3D GIS Apartment Management System, Use Case Diagram được sử dụng để mô tả các chức năng cốt lõi của hệ thống quản lý căn hộ tích hợp bản đồ GIS và mô hình không gian 3D[cite: 5]. [cite_start]Hệ thống không chỉ hỗ trợ người dùng tra cứu thông tin căn hộ, tòa nhà và dữ liệu trực quan trên bản đồ mà còn cho phép quản lý dữ liệu căn hộ, hợp đồng thuê và không gian nội thất 3D[cite: 6].

[cite_start]Dựa trên đặc điểm vận hành của hệ thống, các chức năng được phân thành các nhóm chính như sau[cite: 7]:

- [cite_start]Nhóm chức năng xác thực và phân quyền người dùng [cite: 8]
- [cite_start]Nhóm chức năng bản đồ GIS [cite: 9]
- [cite_start]Nhóm chức năng hiển thị mô hình tòa nhà 3D [cite: 10]
- [cite_start]Nhóm chức năng tra cứu thông tin căn hộ [cite: 11]
- [cite_start]Nhóm chức năng quản lý căn hộ [cite: 12]
- [cite_start]Nhóm chức năng quản lý hợp đồng thuê [cite: 13]
- [cite_start]Nhóm chức năng dashboard và thống kê dữ liệu [cite: 14]
- [cite_start]Nhóm chức năng quản lý người dùng [cite: 15]
- [cite_start]Nhóm chức năng tương tác không gian nội thất 3D (LoD4) [cite: 16]

[cite_start]Việc phân chia các nhóm chức năng như trên giúp làm rõ phạm vi xử lý của hệ thống, đồng thời tạo cơ sở cho việc xây dựng các sơ đồ Use Case chi tiết ở các phần tiếp theo[cite: 17]. [cite_start]Hình 2.x minh họa Use Case Diagram tổng thể của hệ thống[cite: 18].

### [cite_start]2.5.2 Danh sách Actors [cite: 19]

[cite_start]Trong hệ thống, các tác nhân (Actors) là những đối tượng bên ngoài có tương tác trực tiếp với hệ thống nhằm thực hiện các chức năng khác nhau[cite: 20]. [cite_start]Dựa trên phạm vi nghiên cứu và yêu cầu của đề tài, hệ thống bao gồm hai tác nhân chính như sau[cite: 21]:

| Actor       | Mô tả                                                                                                                                                                     |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User**    | [cite_start]Người sử dụng hệ thống với mục đích tra cứu thông tin, xem bản đồ, mô hình 3D, thông tin căn hộ, dashboard và tương tác với không gian nội thất 3D [cite: 22] |
| **Manager** | [cite_start]Người quản lý hệ thống, có quyền cập nhật và quản lý dữ liệu căn hộ, hợp đồng thuê, người dùng và không gian nội thất [cite: 22]                              |

[cite_start]Trong đó, Manager là tác nhân có phạm vi quyền hạn cao hơn, cho phép thực hiện các thao tác quản trị và cập nhật dữ liệu hệ thống[cite: 23]. [cite_start]Ngược lại, User chủ yếu tương tác với hệ thống ở mức khai thác và tra cứu thông tin[cite: 24].

### [cite_start]2.5.3 Danh sách Use Cases của hệ thống [cite: 25]

[cite_start]Để thuận tiện cho việc phân tích, các Use Case của hệ thống được phân chia thành từng nhóm chức năng cụ thể như sau[cite: 26]:

**a. [cite_start]Nhóm chức năng xác thực và phân quyền** [cite: 27]

| ID    | Use Case             | Mô tả                                                         |
| :---- | :------------------- | :------------------------------------------------------------ |
| UC00  | Login                | [cite_start]Đăng nhập vào hệ thống [cite: 28]                 |
| UC00a | Logout               | [cite_start]Đăng xuất khỏi hệ thống [cite: 28]                |
| UC00b | Verify Authorization | [cite_start]Kiểm tra quyền truy cập của người dùng [cite: 28] |

**b. [cite_start]Nhóm chức năng bản đồ GIS** [cite: 29]

| ID   | Use Case                | Mô tả                                                             |
| :--- | :---------------------- | :---------------------------------------------------------------- |
| UC01 | View City Map           | [cite_start]Hiển thị bản đồ tổng thể khu vực/thành phố [cite: 30] |
| UC02 | View Building Locations | [cite_start]Hiển thị vị trí các tòa nhà trên bản đồ [cite: 30]    |
| UC03 | Filter Buildings        | [cite_start]Lọc các tòa nhà theo tiêu chí [cite: 30]              |
| UC04 | View Occupancy Rate     | [cite_start]Xem tỷ lệ lấp đầy của tòa nhà [cite: 30]              |
| UC05 | Select Building         | [cite_start]Chọn tòa nhà để xem chi tiết [cite: 30]               |

**c. [cite_start]Nhóm chức năng hiển thị tòa nhà 3D** [cite: 31]

| ID   | Use Case               | Mô tả                                                         |
| :--- | :--------------------- | :------------------------------------------------------------ |
| UC06 | View 3D Building Model | [cite_start]Hiển thị mô hình 3D của tòa nhà [cite: 32]        |
| UC07 | View Floors            | [cite_start]Hiển thị các tầng trong tòa nhà [cite: 32]        |
| UC08 | View Apartment Units   | [cite_start]Hiển thị các căn hộ trong tòa nhà [cite: 32]      |
| UC09 | Zoom / Rotate 3D Model | [cite_start]Phóng to, thu nhỏ hoặc xoay mô hình 3D [cite: 32] |

**d. [cite_start]Nhóm chức năng tra cứu thông tin căn hộ** [cite: 33]

| ID   | Use Case                       | Mô tả                                                                                                         |
| :--- | :----------------------------- | :------------------------------------------------------------------------------------------------------------ |
| UC10 | View Apartment Details         | [cite_start]Xem thông tin chi tiết căn hộ, bao gồm trạng thái, giá thuê và các thông tin liên quan [cite: 34] |
| UC11 | View Public Tenant Information | [cite_start]Xem thông tin người thuê ở mức công khai (nếu được cấp quyền) [cite: 34]                          |
| UC12 | View Contract Information      | [cite_start]Xem thông tin hợp đồng thuê (dành cho người dùng có quyền phù hợp) [cite: 34]                     |

> [cite_start]**Lưu ý:** Để đảm bảo tính bảo mật và quyền riêng tư, thông tin người thuê và hợp đồng thuê chỉ được hiển thị khi người dùng có quyền truy cập phù hợp[cite: 35, 36].

**e. [cite_start]Nhóm chức năng quản lý căn hộ** [cite: 37]

| ID   | Use Case                     | Mô tả                                               |
| :--- | :--------------------------- | :-------------------------------------------------- |
| UC13 | Add Apartment                | [cite_start]Thêm căn hộ mới vào hệ thống [cite: 38] |
| UC14 | Update Apartment Information | [cite_start]Cập nhật thông tin căn hộ [cite: 38]    |
| UC15 | Delete Apartment             | [cite_start]Xóa căn hộ khỏi hệ thống [cite: 38]     |
| UC16 | Update Apartment Status      | [cite_start]Cập nhật trạng thái căn hộ [cite: 38]   |

**f. [cite_start]Nhóm chức năng quản lý hợp đồng thuê** [cite: 39]

| ID   | Use Case                  | Mô tả                                                    |
| :--- | :------------------------ | :------------------------------------------------------- |
| UC17 | Add Rental Contract       | [cite_start]Thêm hợp đồng thuê mới [cite: 40]            |
| UC18 | Edit Rental Contract      | [cite_start]Chỉnh sửa thông tin hợp đồng thuê [cite: 40] |
| UC19 | Delete Rental Contract    | [cite_start]Xóa hợp đồng thuê [cite: 40]                 |
| UC20 | Manage Tenant Information | [cite_start]Quản lý thông tin người thuê [cite: 40]      |

**g. [cite_start]Nhóm chức năng dashboard và thống kê** [cite: 41]

| ID   | Use Case                  | Mô tả                                                  |
| :--- | :------------------------ | :----------------------------------------------------- |
| UC21 | View Dashboard            | [cite_start]Hiển thị dashboard tổng quan [cite: 42]    |
| UC22 | View Occupancy Statistics | [cite_start]Thống kê tỷ lệ lấp đầy [cite: 42]          |
| UC23 | View Revenue Statistics   | [cite_start]Thống kê doanh thu [cite: 42]              |
| UC24 | View Time Series Data     | [cite_start]Hiển thị dữ liệu theo thời gian [cite: 42] |

**h. [cite_start]Nhóm chức năng quản lý người dùng** [cite: 43]

| ID   | Use Case                | Mô tả                                                |
| :--- | :---------------------- | :--------------------------------------------------- |
| UC25 | View User List          | [cite_start]Xem danh sách người dùng [cite: 44]      |
| UC26 | Add User                | [cite_start]Thêm người dùng mới [cite: 44]           |
| UC27 | Update User Information | [cite_start]Cập nhật thông tin người dùng [cite: 44] |
| UC28 | Delete User             | [cite_start]Xóa người dùng [cite: 44]                |
| UC29 | Activate User           | [cite_start]Kích hoạt tài khoản [cite: 44]           |
| UC30 | Deactivate User         | [cite_start]Vô hiệu hóa tài khoản [cite: 44]         |

**i. [cite_start]Nhóm chức năng tương tác không gian 3D nội thất (LoD4)** [cite: 45]

| ID   | Use Case              | Mô tả                                                                          |
| :--- | :-------------------- | :----------------------------------------------------------------------------- |
| UC31 | View 3D Indoor Space  | [cite_start]Hiển thị không gian 3D bên trong căn hộ/phòng [cite: 46]           |
| UC32 | Drag & Drop Furniture | [cite_start]Kéo thả và bố trí vật dụng nội thất trong không gian 3D [cite: 46] |
| UC33 | Save Furniture Layout | [cite_start]Lưu cấu hình bố trí nội thất [cite: 46]                            |

### [cite_start]2.5.4 Mối quan hệ giữa các Use Case [cite: 47]

[cite_start]Bên cạnh việc xác định các chức năng chính, việc mô tả mối quan hệ giữa các Use Case giúp làm rõ hơn luồng xử lý nghiệp vụ cũng như tính liên kết giữa các chức năng trong hệ thống[cite: 48]. [cite_start]Trong phạm vi hệ thống, các mối quan hệ \<\<include\>\> và \<\<extend\>\> được sử dụng để biểu diễn sự phụ thuộc hoặc mở rộng chức năng[cite: 49].

**a. [cite_start]Quan hệ trong nhóm GIS** [cite: 50]

- [cite_start]View Building Locations \<\<include\>\> View City Map [cite: 51]
- [cite_start]Select Building \<\<extend\>\> View Building Locations [cite: 51]
- [cite_start]View Occupancy Rate \<\<include\>\> Select Building [cite: 51]
- [cite_start]Filter Buildings \<\<extend\>\> View Building Locations [cite: 51]

**b. [cite_start]Quan hệ trong nhóm hiển thị 3D** [cite: 52]

- [cite_start]View 3D Building Model \<\<include\>\> Select Building [cite: 53]
- [cite_start]View Floors \<\<include\>\> View 3D Building Model [cite: 54]
- [cite_start]View Apartment Units \<\<include\>\> View Floors [cite: 55]
- [cite_start]Zoom / Rotate 3D Model \<\<extend\>\> View 3D Building Model [cite: 56]

**c. [cite_start]Quan hệ trong nhóm tra cứu căn hộ** [cite: 57]

- [cite_start]View Apartment Details \<\<include\>\> View Apartment Units [cite: 58]
- [cite_start]View Public Tenant Information \<\<extend\>\> View Apartment Details [cite: 58]
- [cite_start]View Contract Information \<\<extend\>\> View Apartment Details [cite: 59]

**d. [cite_start]Quan hệ trong nhóm nội thất 3D** [cite: 60]

- [cite_start]Drag & Drop Furniture \<\<extend\>\> View 3D Indoor Space [cite: 61]
- [cite_start]Save Furniture Layout \<\<include\>\> Drag & Drop Furniture [cite: 61]

**e. [cite_start]Quan hệ trong nhóm quản trị** [cite: 62]

- [cite_start]Các Use Case thuộc nhóm quản lý căn hộ, quản lý hợp đồng, quản lý người dùng đều \<\<include\>\> Verify Authorization[cite: 63].
- [cite_start]Các chức năng quản trị đều yêu cầu thực hiện Login trước khi truy cập[cite: 64].

[cite_start]Việc thiết lập các mối quan hệ này giúp sơ đồ Use Case phản ánh đúng hơn logic hoạt động của hệ thống, đồng thời hỗ trợ tốt cho quá trình thiết kế và triển khai hệ thống ở các bước tiếp theo[cite: 65].

### [cite_start]2.5.5 Đặc tả Use Case [cite: 66]

[cite_start]Phần này trình bày đặc tả chi tiết toàn bộ các Use Case của hệ thống 3D GIS Apartment Management System[cite: 67]. [cite_start]Mỗi Use Case được mô tả dựa trên các thành phần cơ bản bao gồm mã Use Case, tên chức năng, tác nhân tham gia, mô tả chức năng, điều kiện trước, điều kiện sau, luồng chính và luồng thay thế[cite: 68]. [cite_start]Việc đặc tả đầy đủ các Use Case giúp làm rõ phạm vi hoạt động của hệ thống, đồng thời hỗ trợ quá trình thiết kế, xây dựng và kiểm thử hệ thống trong các giai đoạn tiếp theo[cite: 69].

#### [cite_start]A. Nhóm chức năng xác thực và phân quyền [cite: 70]

[cite_start]**Use Case UC00: Đăng nhập hệ thống (Login)** [cite: 71]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                                                              |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC00 [cite: 72]                                                                                                                                                                                                                                                                                                                        |
| **Tên Use Case**    | [cite_start]Đăng nhập hệ thống [cite: 72]                                                                                                                                                                                                                                                                                                          |
| **Tác nhân**        | [cite_start]User, Manager [cite: 72]                                                                                                                                                                                                                                                                                                               |
| **Mô tả**           | [cite_start]Cho phép người dùng đăng nhập vào hệ thống để truy cập các chức năng phù hợp với vai trò được cấp [cite: 72]                                                                                                                                                                                                                           |
| **Điều kiện trước** | [cite_start]Người dùng đã có tài khoản hợp lệ trong hệ thống [cite: 72]                                                                                                                                                                                                                                                                            |
| **Điều kiện sau**   | [cite_start]Người dùng đăng nhập thành công và được chuyển đến giao diện phù hợp [cite: 73]                                                                                                                                                                                                                                                        |
| **Luồng chính**     | 1. Người dùng truy cập chức năng đăng nhập.<br>2. Người dùng nhập tên đăng nhập và mật khẩu.<br>3. Hệ thống tiếp nhận thông tin xác thực.<br>4. Hệ thống kiểm tra dữ liệu trong cơ sở dữ liệu.<br>5. Hệ thống xác định vai trò của người dùng.<br>6. [cite_start]Hệ thống tạo phiên đăng nhập và chuyển người dùng đến giao diện chính. [cite: 73] |
| **Luồng thay thế**  | [cite_start]A1: Tên đăng nhập hoặc mật khẩu không chính xác → Hệ thống hiển thị thông báo lỗi.<br>A2: Tài khoản bị vô hiệu hóa → Hệ thống từ chối đăng nhập. [cite: 73]                                                                                                                                                                            |

[cite_start]**Use Case UC00a: Đăng xuất hệ thống (Logout)** [cite: 74]

| Thuộc tính          | Mô tả                                                                                                                                                                                                           |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC00a [cite: 75]                                                                                                                                                                                    |
| **Tên Use Case**    | [cite_start]Đăng xuất hệ thống [cite: 75]                                                                                                                                                                       |
| **Tác nhân**        | [cite_start]User, Manager [cite: 75]                                                                                                                                                                            |
| **Mô tả**           | [cite_start]Cho phép người dùng kết thúc phiên làm việc hiện tại và thoát khỏi hệ thống [cite: 75]                                                                                                              |
| **Điều kiện trước** | [cite_start]Người dùng đang đăng nhập vào hệ thống [cite: 75]                                                                                                                                                   |
| **Điều kiện sau**   | [cite_start]Phiên làm việc bị hủy và người dùng được chuyển về màn hình đăng nhập [cite: 75]                                                                                                                    |
| **Luồng chính**     | 1. Người dùng chọn chức năng đăng xuất.<br>2. Hệ thống tiếp nhận yêu cầu đăng xuất.<br>3. Hệ thống hủy phiên làm việc hiện tại.<br>4. [cite_start]Hệ thống chuyển người dùng về giao diện đăng nhập. [cite: 75] |
| **Luồng thay thế**  | [cite_start]A1: Phiên làm việc đã hết hạn Hệ thống tự động đưa người dùng về màn hình đăng nhập. [cite: 75]                                                                                                     |

[cite_start]**Use Case UC00b: Xác thực quyền truy cập (Verify Authorization)** [cite: 76]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                           |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC00b [cite: 77]                                                                                                                                                                                                                                    |
| **Tên Use Case**    | [cite_start]Xác thực quyền truy cập [cite: 77]                                                                                                                                                                                                                  |
| **Tác nhân**        | [cite_start]Hệ thống [cite: 77]                                                                                                                                                                                                                                 |
| **Mô tả**           | [cite_start]Kiểm tra vai trò và quyền hạn của người dùng trước khi cho phép thực hiện các chức năng bị giới hạn [cite: 77]                                                                                                                                      |
| **Điều kiện trước** | [cite_start]Người dùng đã đăng nhập và gửi yêu cầu thực hiện chức năng [cite: 77]                                                                                                                                                                               |
| **Điều kiện sau**   | [cite_start]Quyền truy cập được xác định và hệ thống cho phép hoặc từ chối thao tác [cite: 77]                                                                                                                                                                  |
| **Luồng chính**     | 1. Người dùng truy cập một chức năng yêu cầu phân quyền.<br>2. Hệ thống truy xuất vai trò và quyền hạn của người dùng.<br>3. Hệ thống đối chiếu quyền truy cập với chức năng yêu cầu.<br>4. [cite_start]Hệ thống cho phép tiếp tục nếu quyền hợp lệ. [cite: 77] |
| **Luồng thay thế**  | [cite_start]A1: Người dùng không có quyền truy cập Hệ thống từ chối thao tác và hiển thị thông báo lỗi quyền hạn. [cite: 77]                                                                                                                                    |

#### [cite_start]B. Nhóm chức năng bản đồ GIS [cite: 78]

[cite_start]**Use Case UC01: Xem bản đồ thành phố (View City Map)** [cite: 79]

| Thuộc tính          | Mô tả                                                                                                                                                                                     |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC01 [cite: 80]                                                                                                                                                               |
| **Tên Use Case**    | [cite_start]Xem bản đồ thành phố [cite: 80]                                                                                                                                               |
| **Tác nhân**        | [cite_start]User [cite: 80]                                                                                                                                                               |
| **Mô tả**           | [cite_start]Hiển thị bản đồ tổng thể khu vực/thành phố trên hệ thống GIS [cite: 81]                                                                                                       |
| **Điều kiện trước** | [cite_start]Hệ thống đã được khởi động [cite: 81]                                                                                                                                         |
| **Điều kiện sau**   | [cite_start]Bản đồ được hiển thị thành công trên giao diện [cite: 81]                                                                                                                     |
| **Luồng chính**     | 1. Người dùng truy cập hệ thống.<br>2. Người dùng chọn chức năng xem bản đồ.<br>3. Hệ thống tải dữ liệu bản đồ nền.<br>4. [cite_start]Hệ thống hiển thị bản đồ trên giao diện. [cite: 81] |
| **Luồng thay thế**  | [cite_start]A1: Không tải được dữ liệu bản đồ Hệ thống hiển thị thông báo lỗi tải bản đồ. [cite: 81]                                                                                      |

[cite_start]**Use Case UC02: Xem vị trí các tòa nhà (View Building Locations)** [cite: 82]

| Thuộc tính          | Mô tả                                                                                                                                                                         |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC02 [cite: 83]                                                                                                                                                   |
| **Tên Use Case**    | [cite_start]Xem vị trí các tòa nhà [cite: 83]                                                                                                                                 |
| **Tác nhân**        | [cite_start]User [cite: 83]                                                                                                                                                   |
| **Mô tả**           | [cite_start]Hiển thị vị trí các tòa nhà căn hộ trên bản đồ GIS [cite: 83]                                                                                                     |
| **Điều kiện trước** | [cite_start]Bản đồ đã được hiển thị [cite: 83]                                                                                                                                |
| **Điều kiện sau**   | [cite_start]Các vị trí tòa nhà được hiển thị trên bản đồ [cite: 83]                                                                                                           |
| **Luồng chính**     | 1. Người dùng truy cập bản đồ.<br>2. Hệ thống truy xuất dữ liệu vị trí các tòa nhà.<br>3. [cite_start]Hệ thống hiển thị các điểm/tầng dữ liệu tòa nhà trên bản đồ. [cite: 83] |
| **Luồng thay thế**  | [cite_start]A1: Không có dữ liệu vị trí tòa nhà Hệ thống hiển thị thông báo không có dữ liệu. [cite: 83]                                                                      |

[cite_start]**Use Case UC03: Lọc các tòa nhà (Filter Buildings)** [cite: 84]

| Thuộc tính          | Mô tả                                                                                                                                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC03 [cite: 85]                                                                                                                                                                              |
| **Tên Use Case**    | [cite_start]Lọc các tòa nhà [cite: 85]                                                                                                                                                                   |
| **Tác nhân**        | [cite_start]User [cite: 85]                                                                                                                                                                              |
| **Mô tả**           | [cite_start]Cho phép người dùng lọc danh sách tòa nhà theo các tiêu chí như khu vực, giá thuê, trạng thái hoặc tỷ lệ lấp đầy [cite: 85]                                                                  |
| **Điều kiện trước** | [cite_start]Dữ liệu tòa nhà đã được tải trên bản đồ [cite: 85]                                                                                                                                           |
| **Điều kiện sau**   | [cite_start]Các tòa nhà phù hợp được hiển thị sau khi lọc [cite: 85]                                                                                                                                     |
| **Luồng chính**     | 1. Người dùng chọn chức năng lọc.<br>2. Người dùng nhập hoặc chọn các tiêu chí lọc.<br>3. Hệ thống xử lý điều kiện lọc.<br>4. [cite_start]Hệ thống cập nhật các tòa nhà hiển thị trên bản đồ. [cite: 85] |
| **Luồng thay thế**  | [cite_start]A1: Không có tòa nhà phù hợp Hệ thống hiển thị trạng thái không có kết quả. [cite: 85]                                                                                                       |

[cite_start]**Use Case UC04: Xem tỷ lệ lấp đầy (View Occupancy Rate)** [cite: 86]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                   |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC04 [cite: 87]                                                                                                                                                                                                                                             |
| **Tên Use Case**    | [cite_start]Xem tỷ lệ lấp đầy [cite: 87]                                                                                                                                                                                                                                |
| **Tác nhân**        | [cite_start]User [cite: 87]                                                                                                                                                                                                                                             |
| **Mô tả**           | [cite_start]Cho phép người dùng xem tỷ lệ lấp đầy của tòa nhà hoặc nhóm tòa nhà [cite: 87]                                                                                                                                                                              |
| **Điều kiện trước** | [cite_start]Dữ liệu căn hộ và trạng thái thuê đã tồn tại trong hệ thống [cite: 87]                                                                                                                                                                                      |
| **Điều kiện sau**   | [cite_start]Tỷ lệ lấp đầy được hiển thị trên giao diện [cite: 88]                                                                                                                                                                                                       |
| **Luồng chính**     | 1. Người dùng chọn một tòa nhà hoặc nhóm tòa nhà.<br>2. Người dùng chọn chức năng xem tỷ lệ lấp đầy.<br>3. Hệ thống truy xuất dữ liệu trạng thái căn hộ.<br>4. Hệ thống tính toán tỷ lệ lấp đầy.<br>5. [cite_start]Hệ thống hiển thị kết quả cho người dùng. [cite: 88] |
| **Luồng thay thế**  | [cite_start]A1: Thiếu dữ liệu trạng thái căn hộ Hệ thống hiển thị thông báo không đủ dữ liệu để tính toán. [cite: 88]                                                                                                                                                   |

[cite_start]**Use Case UC05: Chọn tòa nhà (Select Building)** [cite: 89]

| Thuộc tính          | Mô tả                                                                                                                                                                       |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC05 [cite: 90]                                                                                                                                                 |
| **Tên Use Case**    | [cite_start]Chọn tòa nhà [cite: 90]                                                                                                                                         |
| **Tác nhân**        | [cite_start]User [cite: 90]                                                                                                                                                 |
| **Mô tả**           | [cite_start]Cho phép người dùng chọn một tòa nhà cụ thể để xem thông tin chi tiết [cite: 90]                                                                                |
| **Điều kiện trước** | [cite_start]Bản đồ đã hiển thị dữ liệu các tòa nhà [cite: 90]                                                                                                               |
| **Điều kiện sau**   | [cite_start]Tòa nhà được chọn và thông tin liên quan được kích hoạt để truy xuất [cite: 90]                                                                                 |
| **Luồng chính**     | 1. Người dùng nhấp chọn một tòa nhà trên bản đồ.<br>2. Hệ thống nhận diện đối tượng được chọn.<br>3. [cite_start]Hệ thống hiển thị thông tin cơ bản của tòa nhà. [cite: 90] |
| **Luồng thay thế**  | [cite_start]A1: Không nhận diện được đối tượng Hệ thống yêu cầu người dùng thao tác lại. [cite: 90]                                                                         |

#### [cite_start]C. Nhóm chức năng hiển thị mô hình 3D tòa nhà [cite: 91]

[cite_start]**Use Case UC06: Xem mô hình tòa nhà 3D (View 3D Building Model)** [cite: 92]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                              |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC06 [cite: 93]                                                                                                                                                                                                        |
| **Tên Use Case**    | [cite_start]Xem mô hình tòa nhà 3D [cite: 93]                                                                                                                                                                                      |
| **Tác nhân**        | [cite_start]User [cite: 93]                                                                                                                                                                                                        |
| **Mô tả**           | [cite_start]Hiển thị mô hình 3D của tòa nhà được chọn [cite: 93]                                                                                                                                                                   |
| **Điều kiện trước** | [cite_start]Người dùng đã chọn một tòa nhà [cite: 93]                                                                                                                                                                              |
| **Điều kiện sau**   | [cite_start]Mô hình 3D được hiển thị trên giao diện [cite: 93]                                                                                                                                                                     |
| **Luồng chính**     | 1. Người dùng chọn một tòa nhà trên bản đồ.<br>2. Người dùng chọn chức năng hiển thị mô hình 3D.<br>3. Hệ thống tải dữ liệu mô hình 3D của tòa nhà.<br>4. [cite_start]Hệ thống dựng và hiển thị mô hình trên giao diện. [cite: 93] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu mô hình không tồn tại → Hệ thống hiển thị lỗi.<br>A2: Mô hình hiển thị thất bại Hệ thống cho phép tải lại. [cite: 93]                                                                                      |

[cite_start]**Use Case UC07: Xem các tầng trong tòa nhà (View Floors)** [cite: 94]

| Thuộc tính          | Mô tả                                                                                                                                                                              |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC07 [cite: 95]                                                                                                                                                        |
| **Tên Use Case**    | [cite_start]Xem các tầng trong tòa nhà [cite: 95]                                                                                                                                  |
| **Tác nhân**        | [cite_start]User [cite: 95]                                                                                                                                                        |
| **Mô tả**           | [cite_start]Hiển thị các tầng của tòa nhà trong mô hình 3D [cite: 95]                                                                                                              |
| **Điều kiện trước** | [cite_start]Mô hình 3D của tòa nhà đã được hiển thị [cite: 95]                                                                                                                     |
| **Điều kiện sau**   | [cite_start]Các tầng của tòa nhà được hiển thị để người dùng quan sát [cite: 96]                                                                                                   |
| **Luồng chính**     | 1. Người dùng mở chế độ xem tầng.<br>2. Hệ thống truy xuất cấu trúc tầng của tòa nhà.<br>3. [cite_start]Hệ thống hiển thị các tầng trên mô hình 3D hoặc danh sách tầng. [cite: 96] |
| **Luồng thay thế**  | [cite_start]A1: Không có dữ liệu tầng → Hệ thống thông báo không tìm thấy dữ liệu. [cite: 96]                                                                                      |

[cite_start]**Use Case UC08: Xem các căn hộ trong tòa nhà (View Apartment Units)** [cite: 97]

| Thuộc tính          | Mô tả                                                                                                                                                                                                 |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC08 [cite: 98]                                                                                                                                                                           |
| **Tên Use Case**    | [cite_start]Xem các căn hộ trong tòa nhà [cite: 98]                                                                                                                                                   |
| **Tác nhân**        | [cite_start]User [cite: 98]                                                                                                                                                                           |
| **Mô tả**           | [cite_start]Hiển thị các căn hộ thuộc tầng hoặc tòa nhà được chọn [cite: 98]                                                                                                                          |
| **Điều kiện trước** | [cite_start]Người dùng đã chọn tòa nhà hoặc tầng cụ thể [cite: 98]                                                                                                                                    |
| **Điều kiện sau**   | [cite_start]Danh sách hoặc vị trí các căn hộ được hiển thị [cite: 98]                                                                                                                                 |
| **Luồng chính**     | 1. Người dùng chọn tầng hoặc khu vực trong mô hình 3D.<br>2. Hệ thống truy xuất dữ liệu căn hộ tương ứng.<br>3. [cite_start]Hệ thống hiển thị các căn hộ trên mô hình hoặc bảng thông tin. [cite: 98] |
| **Luồng thay thế**  | [cite_start]A1: Không có căn hộ tại tầng được chọn Hệ thống hiển thị thông báo tương ứng. [cite: 98]                                                                                                  |

[cite_start]**Use Case UC09: Phóng to / xoay mô hình 3D (Zoom / Rotate 3D Model)** [cite: 99]

| Thuộc tính          | Mô tả                                                                                                                                                                                                       |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC09 [cite: 102]                                                                                                                                                                                |
| **Tên Use Case**    | [cite_start]Phóng to / xoay mô hình 3D [cite: 102]                                                                                                                                                          |
| **Tác nhân**        | [cite_start]User [cite: 102]                                                                                                                                                                                |
| **Mô tả**           | [cite_start]Cho phép người dùng tương tác trực quan với mô hình 3D thông qua các thao tác zoom, pan và rotate [cite: 102]                                                                                   |
| **Điều kiện trước** | [cite_start]Mô hình 3D đang được hiển thị [cite: 102]                                                                                                                                                       |
| **Điều kiện sau**   | [cite_start]Góc nhìn và tỷ lệ hiển thị mô hình được cập nhật [cite: 102]                                                                                                                                    |
| **Luồng chính**     | 1. Người dùng sử dụng chuột hoặc công cụ điều khiển.<br>2. Hệ thống tiếp nhận thao tác zoom, xoay hoặc kéo mô hình.<br>3. [cite_start]Hệ thống cập nhật góc nhìn và hiển thị mô hình tương ứng. [cite: 102] |
| **Luồng thay thế**  | [cite_start]A1: Trình duyệt hoặc thiết bị không hỗ trợ đầy đủ hiển thị 3D → Hệ thống giới hạn chế độ tương tác. [cite: 102]                                                                                 |

#### [cite_start]D. Nhóm chức năng tra cứu thông tin căn hộ [cite: 103]

[cite_start]**Use Case UC10: Xem thông tin chi tiết căn hộ (View Apartment Details)** [cite: 104]

| Thuộc tính          | Mô tả                                                                                                                                                                                             |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mã Use Case**     | [cite_start]UC10 [cite: 105]                                                                                                                                                                      |
| **Tên Use Case**    | [cite_start]Xem thông tin chi tiết căn hộ [cite: 105]                                                                                                                                             |
| **Tác nhân**        | [cite_start]User [cite: 105]                                                                                                                                                                      |
| **Mô tả**           | [cite_start]Cho phép người dùng xem thông tin chi tiết của căn hộ như mã căn hộ, diện tích, giá thuê, trạng thái và mô tả [cite: 105]                                                             |
| **Điều kiện trước** | [cite_start]Người dùng đã chọn một căn hộ cụ thể [cite: 105]                                                                                                                                      |
| **Điều kiện sau**   | [cite_start]Thông tin căn hộ được hiển thị đầy đủ [cite: 106]                                                                                                                                     |
| **Luồng chính**     | 1. Người dùng chọn căn hộ từ bản đồ hoặc mô hình 3D.<br>2. Hệ thống truy xuất dữ liệu căn hộ từ cơ sở dữ liệu.<br>3. [cite_start]Hệ thống hiển thị thông tin chi tiết trên giao diện. [cite: 106] |
| **Luồng thay thế**  | [cite_start]A1: Không tìm thấy dữ liệu căn hộ → Hệ thống hiển thị thông báo lỗi. [cite: 106]                                                                                                      |

[cite_start]**Use Case UC11: Xem thông tin người thuê công khai (View Public Tenant Information)** [cite: 107]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC11 [cite: 108]                                                                                                                                                                                                         |
| **Tên Use Case**    | [cite_start]Xem thông tin người thuê công khai [cite: 108]                                                                                                                                                                           |
| **Tác nhân**        | [cite_start]User [cite: 108]                                                                                                                                                                                                         |
| **Mô tả**           | [cite_start]Hiển thị thông tin người thuê ở mức công khai nếu dữ liệu được phép chia sẻ [cite: 108]                                                                                                                                  |
| **Điều kiện trước** | [cite_start]Người dùng đã truy cập thông tin căn hộ có người thuê [cite: 108]                                                                                                                                                        |
| **Điều kiện sau**   | [cite_start]Thông tin người thuê công khai được hiển thị [cite: 108]                                                                                                                                                                 |
| **Luồng chính**     | 1. Người dùng mở chi tiết căn hộ.<br>2. Hệ thống kiểm tra quyền hiển thị thông tin người thuê.<br>3. Hệ thống truy xuất dữ liệu công khai của người thuê.<br>4. [cite_start]Hệ thống hiển thị dữ liệu được phép công bố. [cite: 108] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu người thuê bị giới hạn quyền truy cập Hệ thống ẩn thông tin.<br>A2: Căn hộ chưa có người thuê → Hệ thống hiển thị trạng thái chưa có dữ liệu. [cite: 108]                                                    |

[cite_start]**Use Case UC12: Xem thông tin hợp đồng thuê (View Contract Information)** [cite: 109]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                             |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC12 [cite: 110]                                                                                                                                                                                                      |
| **Tên Use Case**    | [cite_start]Xem thông tin hợp đồng thuê [cite: 110]                                                                                                                                                                               |
| **Tác nhân**        | [cite_start]User (có quyền), Manager [cite: 110]                                                                                                                                                                                  |
| **Mô tả**           | [cite_start]Hiển thị thông tin hợp đồng thuê của căn hộ theo quyền truy cập được cấp [cite: 110]                                                                                                                                  |
| **Điều kiện trước** | [cite_start]Căn hộ có hợp đồng thuê hợp lệ và người dùng có quyền xem [cite: 110]                                                                                                                                                 |
| **Điều kiện sau**   | [cite_start]Thông tin hợp đồng được hiển thị [cite: 110]                                                                                                                                                                          |
| **Luồng chính**     | 1. Người dùng chọn chức năng xem hợp đồng.<br>2. Hệ thống kiểm tra quyền truy cập.<br>3. Hệ thống truy xuất thông tin hợp đồng từ cơ sở dữ liệu.<br>4. [cite_start]Hệ thống hiển thị dữ liệu hợp đồng trên giao diện. [cite: 110] |
| **Luồng thay thế**  | [cite_start]A1: Không có quyền xem hợp đồng - Hệ thống từ chối truy cập.<br>A2: Không tồn tại hợp đồng → Hệ thống hiển thị thông báo tương ứng. [cite: 110]                                                                       |

#### [cite_start]E. Nhóm chức năng quản lý căn hộ [cite: 111]

[cite_start]**Use Case UC13: Thêm căn hộ (Add Apartment)** [cite: 112]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC13 [cite: 113]                                                                                                                                                                                                                                                                 |
| **Tên Use Case**    | [cite_start]Thêm căn hộ [cite: 113]                                                                                                                                                                                                                                                          |
| **Tác nhân**        | [cite_start]Manager [cite: 113]                                                                                                                                                                                                                                                              |
| **Mô tả**           | [cite_start]Cho phép người quản lý thêm mới căn hộ vào hệ thống [cite: 113]                                                                                                                                                                                                                  |
| **Điều kiện trước** | [cite_start]Manager đã đăng nhập và có quyền quản lý căn hộ [cite: 114]                                                                                                                                                                                                                      |
| **Điều kiện sau**   | [cite_start]Căn hộ mới được lưu vào cơ sở dữ liệu [cite: 114]                                                                                                                                                                                                                                |
| **Luồng chính**     | 1. Manager chọn chức năng thêm căn hộ.<br>2. Hệ thống hiển thị biểu mẫu nhập dữ liệu.<br>3. Manager nhập thông tin căn hộ.<br>4. Hệ thống kiểm tra dữ liệu đầu vào.<br>5. Hệ thống lưu thông tin căn hộ vào cơ sở dữ liệu.<br>6. [cite_start]Hệ thống thông báo thêm thành công. [cite: 114] |
| **Luồng thay thế**  | [cite_start]A1: Thiếu thông tin bắt buộc Hệ thống yêu cầu bổ sung.<br>A2: Mã căn hộ đã tồn tại → Hệ thống từ chối lưu dữ liệu. [cite: 114]                                                                                                                                                   |

[cite_start]**Use Case UC14: Cập nhật thông tin căn hộ (Update Apartment Information)** [cite: 115]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                         |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC14 [cite: 116]                                                                                                                                                                                                                                                  |
| **Tên Use Case**    | [cite_start]Cập nhật thông tin căn hộ [cite: 116]                                                                                                                                                                                                                             |
| **Tác nhân**        | [cite_start]Manager [cite: 116]                                                                                                                                                                                                                                               |
| **Mô tả**           | [cite_start]Cho phép người quản lý chỉnh sửa thông tin căn hộ hiện có [cite: 116]                                                                                                                                                                                             |
| **Điều kiện trước** | [cite_start]Căn hộ đã tồn tại trong hệ thống [cite: 116]                                                                                                                                                                                                                      |
| **Điều kiện sau**   | [cite_start]Thông tin căn hộ được cập nhật thành công [cite: 116]                                                                                                                                                                                                             |
| **Luồng chính**     | 1. Manager chọn căn hộ cần cập nhật.<br>2. Hệ thống hiển thị thông hiện tại.<br>3. Manager chỉnh sửa dữ liệu.<br>4. Hệ thống kiểm tra tính hợp lệ.<br>5. Hệ thống cập nhật dữ liệu trong cơ sở dữ liệu.<br>6. [cite_start]Hệ thống hiển thị thông báo thành công. [cite: 116] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu nhập không hợp lệ → Hệ thống yêu cầu chỉnh sửa.<br>A2: Không tìm thấy căn hộ Hệ thống từ chối thao tác. [cite: 116]                                                                                                                                   |

[cite_start]**Use Case UC15: Xóa căn hộ (Delete Apartment)** [cite: 117]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                         |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC15 [cite: 118]                                                                                                                                                                                                                                                                  |
| **Tên Use Case**    | [cite_start]Xóa căn hộ [cite: 118]                                                                                                                                                                                                                                                            |
| **Tác nhân**        | [cite_start]Manager [cite: 118]                                                                                                                                                                                                                                                               |
| **Mô tả**           | [cite_start]Cho phép người quản lý xóa căn hộ khỏi hệ thống [cite: 118]                                                                                                                                                                                                                       |
| **Điều kiện trước** | [cite_start]Căn hộ tồn tại và không bị ràng buộc dữ liệu nghiệp vụ không cho phép xóa [cite: 118]                                                                                                                                                                                             |
| **Điều kiện sau**   | [cite_start]Căn hộ bị xóa hoặc được đánh dấu không còn hoạt động [cite: 118]                                                                                                                                                                                                                  |
| **Luồng chính**     | 1. Manager chọn căn hộ cần xóa.<br>2. Hệ thống hiển thị thông tin xác nhận xóa.<br>3. Manager xác nhận thao tác.<br>4. Hệ thống kiểm tra ràng buộc dữ liệu liên quan.<br>5. Hệ thống xóa hoặc vô hiệu hóa bản ghi căn hộ.<br>6. [cite_start]Hệ thống thông báo hoàn tất thao tác. [cite: 118] |
| **Luồng thay thế**  | [cite_start]A1: Căn hộ đang có hợp đồng hoạt động → Hệ thống từ chối xóa.<br>A2: Manager hủy thao tác → Hệ thống quay lại màn hình quản lý. [cite: 118]                                                                                                                                       |

[cite_start]**Use Case UC16: Cập nhật trạng thái căn hộ (Update Apartment Status)** [cite: 119]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                       |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC16 [cite: 120]                                                                                                                                                                                                                                                |
| **Tên Use Case**    | [cite_start]Cập nhật trạng thái căn hộ [cite: 120]                                                                                                                                                                                                                          |
| **Tác nhân**        | [cite_start]Manager [cite: 121]                                                                                                                                                                                                                                             |
| **Mô tả**           | [cite_start]Cho phép người quản lý thay đổi trạng thái của căn hộ như trống, đang thuê, bảo trì hoặc ngưng khai thác [cite: 121]                                                                                                                                            |
| **Điều kiện trước** | [cite_start]Căn hộ đã tồn tại trong hệ thống [cite: 121]                                                                                                                                                                                                                    |
| **Điều kiện sau**   | [cite_start]Trạng thái căn hộ được cập nhật thành công [cite: 121]                                                                                                                                                                                                          |
| **Luồng chính**     | 1. Manager chọn căn hộ cần cập nhật trạng thái.<br>2. Hệ thống hiển thị trạng thái hiện tại.<br>3. Manager chọn trạng thái mới.<br>4. Hệ thống kiểm tra tính hợp lệ của trạng thái chuyển đổi.<br>5. [cite_start]Hệ thống lưu trạng thái mới vào cơ sở dữ liệu. [cite: 121] |
| **Luồng thay thế**  | [cite_start]A1: Trạng thái mới không phù hợp với dữ liệu hợp đồng hiện tại Hệ thống từ chối cập nhật. [cite: 121]                                                                                                                                                           |

#### [cite_start]F. Nhóm chức năng quản lý hợp đồng thuê [cite: 122]

[cite_start]**Use Case UC17: Thêm hợp đồng thuê (Add Rental Contract)** [cite: 123]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mã Use Case**     | [cite_start]UC17 [cite: 124]                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Tên Use Case**    | [cite_start]Thêm hợp đồng thuê [cite: 124]                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Tác nhân**        | [cite_start]Manager [cite: 124]                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Mô tả**           | [cite_start]Cho phép người quản lý tạo mới hợp đồng thuê cho một căn hộ [cite: 124]                                                                                                                                                                                                                                                                                                                                                               |
| **Điều kiện trước** | [cite_start]Manager đã đăng nhập; căn hộ tồn tại và chưa có hợp đồng đang hoạt động [cite: 124]                                                                                                                                                                                                                                                                                                                                                   |
| **Điều kiện sau**   | [cite_start]Hợp đồng mới được lưu vào hệ thống [cite: 125]                                                                                                                                                                                                                                                                                                                                                                                        |
| **Luồng chính**     | 1. Manager chọn chức năng thêm hợp đồng thuê.<br>2. Hệ thống hiển thị biểu mẫu hợp đồng.<br>3. Manager nhập thông tin người thuê, thời gian thuê, giá thuê và điều khoản liên quan.<br>4. Hệ thống kiểm tra dữ liệu đầu vào.<br>5. Hệ thống kiểm tra trạng thái căn hộ.<br>6. Hệ thống lưu hợp đồng vào cơ sở dữ liệu.<br>7. Hệ thống cập nhật trạng thái căn hộ tương ứng.<br>8. [cite_start]Hệ thống hiển thị thông báo thành công. [cite: 125] |
| **Luồng thay thế**  | [cite_start]A1: Căn hộ đã có hợp đồng hoạt động Hệ thống từ chối tạo hợp đồng mới.<br>A2: Thiếu dữ liệu hoặc sai định dạng → Hệ thống yêu cầu nhập lại. [cite: 125]                                                                                                                                                                                                                                                                               |

[cite_start]**Use Case UC18: Chỉnh sửa hợp đồng thuê (Edit Rental Contract)** [cite: 126]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                         |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mã Use Case**     | [cite_start]UC18 [cite: 127]                                                                                                                                                                                                                                                                                  |
| **Tên Use Case**    | [cite_start]Chỉnh sửa hợp đồng thuê [cite: 127]                                                                                                                                                                                                                                                               |
| **Tác nhân**        | [cite_start]Manager [cite: 127]                                                                                                                                                                                                                                                                               |
| **Mô tả**           | [cite_start]Cho phép người quản lý cập nhật nội dung hợp đồng thuê đã tồn tại [cite: 127]                                                                                                                                                                                                                     |
| **Điều kiện trước** | [cite_start]Hợp đồng đã tồn tại trong hệ thống [cite: 127]                                                                                                                                                                                                                                                    |
| **Điều kiện sau**   | [cite_start]Dữ liệu hợp đồng được cập nhật [cite: 127]                                                                                                                                                                                                                                                        |
| **Luồng chính**     | 1. Manager chọn hợp đồng cần chỉnh sửa.<br>2. Hệ thống hiển thị thông tin hiện tại của hợp đồng.<br>3. Manager chỉnh sửa dữ liệu.<br>4. Hệ thống kiểm tra tính hợp lệ.<br>5. Hệ thống cập nhật dữ liệu vào cơ sở dữ liệu.<br>6. [cite_start]Hệ thống hiển thị thông báo cập nhật thành công. [cite: 127, 128] |
| **Luồng thay thế**  | [cite_start]A1: Hợp đồng không tồn tại → Hệ thống hiển thị lỗi.<br>A2: Dữ liệu chỉnh sửa không hợp lệ → Hệ thống yêu cầu điều chỉnh. [cite: 128]                                                                                                                                                              |

[cite_start]**Use Case UC19: Xóa hợp đồng thuê (Delete Rental Contract)** [cite: 129]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                                 |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC19 [cite: 130]                                                                                                                                                                                                                                                                                          |
| **Tên Use Case**    | [cite_start]Xóa hợp đồng thuê [cite: 130]                                                                                                                                                                                                                                                                             |
| **Tác nhân**        | [cite_start]Manager [cite: 130]                                                                                                                                                                                                                                                                                       |
| **Mô tả**           | [cite_start]Cho phép người quản lý xóa hoặc hủy hiệu lực hợp đồng thuê trong hệ thống [cite: 130]                                                                                                                                                                                                                     |
| **Điều kiện trước** | [cite_start]Hợp đồng tồn tại và người quản lý có quyền thao tác [cite: 130]                                                                                                                                                                                                                                           |
| **Điều kiện sau**   | [cite_start]Hợp đồng bị xóa hoặc chuyển sang trạng thái không còn hiệu lực [cite: 130]                                                                                                                                                                                                                                |
| **Luồng chính**     | 1. Manager chọn hợp đồng cần xóa.<br>2. Hệ thống hiển thị thông tin xác nhận thao tác.<br>3. Manager xác nhận xóa hợp đồng.<br>4. Hệ thống kiểm tra ràng buộc dữ liệu liên quan.<br>5. Hệ thống xóa hoặc cập nhật trạng thái hợp đồng.<br>6. [cite_start]Hệ thống cập nhật lại trạng thái căn hộ nếu cần. [cite: 130] |
| **Luồng thay thế**  | [cite_start]A1: Hợp đồng đang được khóa hoặc không thể chỉnh sửa Hệ thống từ chối thao tác.<br>A2: Manager hủy thao tác → Hệ thống quay lại danh sách hợp đồng. [cite: 130]                                                                                                                                           |

[cite_start]**Use Case UC20: Quản lý thông tin người thuê (Manage Tenant Information)** [cite: 131]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                      |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC20 [cite: 132]                                                                                                                                                                                                                                                                               |
| **Tên Use Case**    | [cite_start]Quản lý thông tin người thuê [cite: 132]                                                                                                                                                                                                                                                       |
| **Tác nhân**        | [cite_start]Manager [cite: 132]                                                                                                                                                                                                                                                                            |
| **Mô tả**           | [cite_start]Cho phép người quản lý thêm, chỉnh sửa hoặc cập nhật thông tin người thuê liên quan đến hợp đồng thuê [cite: 132]                                                                                                                                                                              |
| **Điều kiện trước** | [cite_start]Manager đã đăng nhập và có quyền quản lý dữ liệu người thuê [cite: 132]                                                                                                                                                                                                                        |
| **Điều kiện sau**   | [cite_start]Thông tin người thuê được cập nhật trong hệ thống [cite: 132]                                                                                                                                                                                                                                  |
| **Luồng chính**     | 1. Manager truy cập chức năng quản lý người thuê.<br>2. Hệ thống hiển thị danh sách người thuê hoặc biểu mẫu dữ liệu.<br>3. Manager thêm mới hoặc chỉnh sửa thông tin người thuê.<br>4. Hệ thống kiểm tra tính hợp lệ của dữ liệu.<br>5. [cite_start]Hệ thống lưu thông tin vào cơ sở dữ liệu. [cite: 132] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu không hợp lệ → Hệ thống hiển thị lỗi.<br>A2: Thông tin bị trùng hoặc xung đột Hệ thống yêu cầu xác nhận hoặc chỉnh sửa. [cite: 132]                                                                                                                                                |

#### [cite_start]G. Nhóm chức năng Dashboard và thống kê [cite: 133]

[cite_start]**Use Case UC21: Xem Dashboard (View Dashboard)** [cite: 134]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                           |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mã Use Case**     | [cite_start]UC21 [cite: 135]                                                                                                                                                                                                    |
| **Tên Use Case**    | [cite_start]Xem Dashboard [cite: 135]                                                                                                                                                                                           |
| **Tác nhân**        | [cite_start]User, Manager [cite: 136]                                                                                                                                                                                           |
| **Mô tả**           | [cite_start]Hiển thị bảng điều khiển tổng quan với các chỉ số và biểu đồ chính của hệ thống [cite: 136]                                                                                                                         |
| **Điều kiện trước** | [cite_start]Hệ thống có dữ liệu thống kê [cite: 136]                                                                                                                                                                            |
| **Điều kiện sau**   | [cite_start]Dashboard được hiển thị trên giao diện [cite: 136]                                                                                                                                                                  |
| **Luồng chính**     | 1. Người dùng chọn chức năng Dashboard.<br>2. Hệ thống truy xuất dữ liệu tổng quan từ cơ sở dữ liệu.<br>3. Hệ thống xử lý và tổng hợp dữ liệu.<br>4. [cite_start]Hệ thống hiển thị các chỉ số và biểu đồ tương ứng. [cite: 136] |
| **Luồng thay thế**  | [cite_start]A1: Không có dữ liệu thống kê → Hệ thống hiển thị trạng thái chưa có dữ liệu. [cite: 136]                                                                                                                           |

[cite_start]**Use Case UC22: Xem thống kê tỷ lệ lấp đầy (View Occupancy Statistics)** [cite: 137]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                   |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC22 [cite: 138]                                                                                                                                                                                                            |
| **Tên Use Case**    | [cite_start]Xem thống kê tỷ lệ lấp đầy [cite: 138]                                                                                                                                                                                      |
| **Tác nhân**        | [cite_start]User, Manager [cite: 138]                                                                                                                                                                                                   |
| **Mô tả**           | [cite_start]Hiển thị dữ liệu thống kê liên quan đến số lượng căn hộ đã thuê, còn trống hoặc đang bảo trì [cite: 138]                                                                                                                    |
| **Điều kiện trước** | [cite_start]Hệ thống có dữ liệu trạng thái căn hộ [cite: 138]                                                                                                                                                                           |
| **Điều kiện sau**   | [cite_start]Biểu đồ hoặc bảng thống kê tỷ lệ lấp đầy được hiển thị [cite: 138]                                                                                                                                                          |
| **Luồng chính**     | 1. Người dùng chọn chức năng thống kê tỷ lệ lấp đầy.<br>2. Hệ thống truy xuất dữ liệu trạng thái căn hộ.<br>3. Hệ thống tính toán và tổng hợp dữ liệu thống kê.<br>4. [cite_start]Hệ thống hiển thị kết quả trên giao diện. [cite: 138] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu trạng thái không đầy đủ → Hệ thống hiển thị cảnh báo thiếu dữ liệu. [cite: 139, 140]                                                                                                                            |

[cite_start]**Use Case UC23: Xem thống kê doanh thu (View Revenue Statistics)** [cite: 141]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                 |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC23 [cite: 142]                                                                                                                                                                                                                                          |
| **Tên Use Case**    | [cite_start]Xem thống kê doanh thu [cite: 142]                                                                                                                                                                                                                        |
| **Tác nhân**        | [cite_start]Manager [cite: 142]                                                                                                                                                                                                                                       |
| **Mô tả**           | [cite_start]Hiển thị dữ liệu doanh thu phát sinh từ các hợp đồng thuê theo từng khoảng thời gian [cite: 142]                                                                                                                                                          |
| **Điều kiện trước** | [cite_start]Hệ thống có dữ liệu hợp đồng và doanh thu [cite: 142]                                                                                                                                                                                                     |
| **Điều kiện sau**   | [cite_start]Dữ liệu doanh thu được hiển thị [cite: 142]                                                                                                                                                                                                               |
| **Luồng chính**     | 1. Manager chọn chức năng thống kê doanh thu.<br>2. Hệ thống truy xuất dữ liệu hợp đồng và khoản thu liên quan.<br>3. Hệ thống tổng hợp doanh thu theo thời gian hoặc nhóm căn hộ.<br>4. [cite_start]Hệ thống hiển thị biểu đồ và bảng dữ liệu doanh thu. [cite: 142] |
| **Luồng thay thế**  | [cite_start]A1: Không có dữ liệu doanh thu → Hệ thống hiển thị thông báo chưa có dữ liệu. [cite: 142]                                                                                                                                                                 |

[cite_start]**Use Case UC24: Xem dữ liệu theo chuỗi thời gian (View Time Series Data)** [cite: 143]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC24 [cite: 144]                                                                                                                                                                                                                                 |
| **Tên Use Case**    | [cite_start]Xem dữ liệu theo chuỗi thời gian [cite: 145]                                                                                                                                                                                                     |
| **Tác nhân**        | [cite_start]User, Manager [cite: 145]                                                                                                                                                                                                                        |
| **Mô tả**           | [cite_start]Cho phép người dùng xem dữ liệu biến động theo thời gian như tỷ lệ lấp đầy, doanh thu hoặc trạng thái khai thác [cite: 145]                                                                                                                      |
| **Điều kiện trước** | [cite_start]Hệ thống có dữ liệu lịch sử [cite: 145]                                                                                                                                                                                                          |
| **Điều kiện sau**   | [cite_start]Biểu đồ chuỗi thời gian được hiển thị [cite: 145]                                                                                                                                                                                                |
| **Luồng chính**     | 1. Người dùng chọn loại dữ liệu và khoảng thời gian cần xem.<br>2. Hệ thống truy xuất dữ liệu lịch sử.<br>3. Hệ thống xử lý và chuẩn hóa dữ liệu theo mốc thời gian.<br>4. [cite_start]Hệ thống hiển thị biểu đồ chuỗi thời gian trên giao diện. [cite: 145] |
| **Luồng thay thế**  | [cite_start]A1: Khoảng thời gian được chọn không có dữ liệu Hệ thống hiển thị thông báo tương ứng. [cite: 145]                                                                                                                                               |

#### [cite_start]H. Nhóm chức năng quản lý người dùng [cite: 146]

[cite_start]**Use Case UC25: Xem danh sách người dùng (View User List)** [cite: 147]

| Thuộc tính          | Mô tả                                                                                                                                                                                                |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC25 [cite: 148]                                                                                                                                                                         |
| **Tên Use Case**    | [cite_start]Xem danh sách người dùng [cite: 148]                                                                                                                                                     |
| **Tác nhân**        | [cite_start]Manager [cite: 148]                                                                                                                                                                      |
| **Mô tả**           | [cite_start]Cho phép người quản lý xem toàn bộ danh sách người dùng trong hệ thống [cite: 148]                                                                                                       |
| **Điều kiện trước** | [cite_start]Manager đã đăng nhập và có quyền quản lý người dùng [cite: 148]                                                                                                                          |
| **Điều kiện sau**   | [cite_start]Danh sách người dùng được hiển thị [cite: 148]                                                                                                                                           |
| **Luồng chính**     | 1. Manager truy cập chức năng quản lý người dùng.<br>2. Hệ thống truy xuất dữ liệu người dùng từ cơ sở dữ liệu.<br>3. [cite_start]Hệ thống hiển thị danh sách người dùng trên giao diện. [cite: 149] |
| **Luồng thay thế**  | [cite_start]A1: Không có dữ liệu người dùng → Hệ thống hiển thị danh sách rỗng. [cite: 149]                                                                                                          |

[cite_start]**Use Case UC26: Thêm người dùng (Add User)** [cite: 150]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                                              |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC26 [cite: 151]                                                                                                                                                                                                                                                                                                       |
| **Tên Use Case**    | [cite_start]Thêm người dùng [cite: 151]                                                                                                                                                                                                                                                                                            |
| **Tác nhân**        | [cite_start]Manager [cite: 151]                                                                                                                                                                                                                                                                                                    |
| **Mô tả**           | [cite_start]Cho phép người quản lý tạo tài khoản mới cho người dùng trong hệ thống [cite: 151]                                                                                                                                                                                                                                     |
| **Điều kiện trước** | [cite_start]Manager có quyền tạo tài khoản [cite: 151]                                                                                                                                                                                                                                                                             |
| **Điều kiện sau**   | [cite_start]Tài khoản người dùng mới được lưu vào hệ thống [cite: 151]                                                                                                                                                                                                                                                             |
| **Luồng chính**     | 1. Manager chọn chức năng thêm người dùng.<br>2. Hệ thống hiển thị biểu mẫu tạo tài khoản.<br>3. Manager nhập thông tin người dùng và vai trò tương ứng.<br>4. Hệ thống kiểm tra dữ liệu đầu vào.<br>5. Hệ thống tạo tài khoản mới và lưu vào cơ sở dữ liệu.<br>6. [cite_start]Hệ thống hiển thị thông báo thành công. [cite: 151] |
| **Luồng thay thế**  | [cite_start]A1: Tên đăng nhập hoặc email đã tồn tại → Hệ thống từ chối tạo tài khoản.<br>A2: Thiếu dữ liệu bắt buộc → Hệ thống yêu cầu bổ sung. [cite: 151]                                                                                                                                                                        |

[cite_start]**Use Case UC27: Cập nhật thông tin người dùng (Update User Information)** [cite: 152]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                    |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC27 [cite: 153]                                                                                                                                                                                                             |
| **Tên Use Case**    | [cite_start]Cập nhật thông tin người dùng [cite: 153]                                                                                                                                                                                    |
| **Tác nhân**        | [cite_start]Manager [cite: 153]                                                                                                                                                                                                          |
| **Mô tả**           | [cite_start]Cho phép người quản lý chỉnh sửa thông tin tài khoản người dùng [cite: 153]                                                                                                                                                  |
| **Điều kiện trước** | [cite_start]Tài khoản người dùng đã tồn tại trong hệ thống [cite: 153]                                                                                                                                                                   |
| **Điều kiện sau**   | [cite_start]Thông tin người dùng được cập nhật [cite: 153]                                                                                                                                                                               |
| **Luồng chính**     | 1. Manager chọn người dùng cần chỉnh sửa.<br>2. Hệ thống hiển thị thông tin hiện tại.<br>3. Manager chỉnh sửa dữ liệu.<br>4. Hệ thống kiểm tra tính hợp lệ.<br>5. [cite_start]Hệ thống cập nhật dữ liệu trong cơ sở dữ liệu. [cite: 153] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu cập nhật không hợp lệ → Hệ thống hiển thị lỗi.<br>A2: Không tìm thấy tài khoản Hệ thống từ chối thao tác. [cite: 153]                                                                                            |

[cite_start]**Use Case UC28: Xóa người dùng (Delete User)** [cite: 154]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                   |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mã Use Case**     | [cite_start]UC28 [cite: 155]                                                                                                                                                                                                                            |
| **Tên Use Case**    | [cite_start]Xóa người dùng [cite: 155]                                                                                                                                                                                                                  |
| **Tác nhân**        | [cite_start]Manager [cite: 155]                                                                                                                                                                                                                         |
| **Mô tả**           | [cite_start]Cho phép người quản lý xóa tài khoản người dùng khỏi hệ thống [cite: 155]                                                                                                                                                                   |
| **Điều kiện trước** | [cite_start]Tài khoản người dùng tồn tại và không vi phạm ràng buộc dữ liệu [cite: 155]                                                                                                                                                                 |
| **Điều kiện sau**   | [cite_start]Tài khoản bị xóa hoặc vô hiệu hóa [cite: 156]                                                                                                                                                                                               |
| **Luồng chính**     | 1. Manager chọn tài khoản cần xóa.<br>2. Hệ thống hiển thị yêu cầu xác nhận thao tác.<br>3. Manager xác nhận xóa tài khoản.<br>4. Hệ thống kiểm tra ràng buộc dữ liệu liên quan.<br>5. [cite_start]Hệ thống xóa hoặc vô hiệu hóa tài khoản. [cite: 156] |
| **Luồng thay thế**  | [cite_start]A1: Tài khoản đang liên kết với dữ liệu quan trọng → Hệ thống từ chối xóa trực tiếp.<br>A2: Manager hủy thao tác → Hệ thống quay lại danh sách người dùng. [cite: 156]                                                                      |

[cite_start]**Use Case UC29: Kích hoạt tài khoản (Activate User)** [cite: 157]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                       |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC29 [cite: 158]                                                                                                                                                                                                |
| **Tên Use Case**    | [cite_start]Kích hoạt tài khoản [cite: 158]                                                                                                                                                                                 |
| **Tác nhân**        | [cite_start]Manager [cite: 158]                                                                                                                                                                                             |
| **Mô tả**           | [cite_start]Cho phép người quản lý kích hoạt lại tài khoản người dùng đang bị vô hiệu hóa [cite: 158]                                                                                                                       |
| **Điều kiện trước** | [cite_start]Tài khoản đang ở trạng thái không hoạt động [cite: 158]                                                                                                                                                         |
| **Điều kiện sau**   | [cite_start]Tài khoản được kích hoạt và có thể đăng nhập lại [cite: 158]                                                                                                                                                    |
| **Luồng chính**     | 1. Manager chọn tài khoản cần kích hoạt.<br>2. Hệ thống hiển thị trạng thái tài khoản hiện tại.<br>3. Manager xác nhận kích hoạt.<br>4. [cite_start]Hệ thống cập nhật trạng thái tài khoản trong cơ sở dữ liệu. [cite: 158] |
| **Luồng thay thế**  | [cite_start]A1: Tài khoản đã ở trạng thái hoạt động → Hệ thống thông báo không cần cập nhật. [cite: 158]                                                                                                                    |

[cite_start]**Use Case UC30: Vô hiệu hóa tài khoản (Deactivate User)** [cite: 159]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                         |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC30 [cite: 160]                                                                                                                                                                                                  |
| **Tên Use Case**    | [cite_start]Vô hiệu hóa tài khoản [cite: 160]                                                                                                                                                                                 |
| **Tác nhân**        | [cite_start]Manager [cite: 160]                                                                                                                                                                                               |
| **Mô tả**           | [cite_start]Cho phép người quản lý khóa hoặc vô hiệu hóa tài khoản người dùng trong hệ thống [cite: 160]                                                                                                                      |
| **Điều kiện trước** | [cite_start]Tài khoản đang hoạt động [cite: 160]                                                                                                                                                                              |
| **Điều kiện sau**   | [cite_start]Tài khoản bị vô hiệu hóa và không thể tiếp tục đăng nhập [cite: 160]                                                                                                                                              |
| **Luồng chính**     | 1. Manager chọn tài khoản cần vô hiệu hóa.<br>2. Hệ thống hiển thị thông tin xác nhận thao tác.<br>3. Manager xác nhận vô hiệu hóa.<br>4. [cite_start]Hệ thống cập nhật trạng thái tài khoản trong cơ sở dữ liệu. [cite: 160] |
| **Luồng thay thế**  | [cite_start]A1: Tài khoản đã bị vô hiệu hóa trước đó Hệ thống hiển thị trạng thái hiện tại. [cite: 160]                                                                                                                       |

#### [cite_start]I. Nhóm chức năng tương tác không gian 3D nội thất (LoD4) [cite: 161]

[cite_start]**Use Case UC31: Hiển thị không gian 3D bên trong (View 3D Indoor Space)** [cite: 162]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                 |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC31 [cite: 163]                                                                                                                                                                                                                                                                          |
| **Tên Use Case**    | [cite_start]Hiển thị không gian 3D bên trong [cite: 163]                                                                                                                                                                                                                                              |
| **Tác nhân**        | [cite_start]User, Manager [cite: 164]                                                                                                                                                                                                                                                                 |
| **Mô tả**           | [cite_start]Cho phép người dùng quan sát không gian bên trong căn hộ dưới dạng mô hình 3D (LoD4), bao gồm các phòng và nội thất hiện có [cite: 164]                                                                                                                                                   |
| **Điều kiện trước** | [cite_start]Người dùng đã chọn một căn hộ cụ thể [cite: 164]                                                                                                                                                                                                                                          |
| **Điều kiện sau**   | [cite_start]Mô hình không gian 3D được hiển thị trên giao diện [cite: 164]                                                                                                                                                                                                                            |
| **Luồng chính**     | 1. Người dùng chọn căn hộ cần xem.<br>2. Người dùng chọn chức năng hiển thị không gian 3D.<br>3. Hệ thống truy xuất dữ liệu cấu trúc phòng và dữ liệu nội thất.<br>4. Hệ thống xử lý và dựng mô hình 3D không gian bên trong.<br>5. [cite_start]Hệ thống hiển thị mô hình trên giao diện. [cite: 164] |
| **Luồng thay thế**  | [cite_start]A1: Không có dữ liệu nội thất Hệ thống chỉ hiển thị cấu trúc phòng.<br>A2: Lỗi tải mô hình → Hệ thống thông báo lỗi và cho phép tải lại. [cite: 164]                                                                                                                                      |

[cite_start]**Use Case UC32: Kéo thả và bố trí nội thất (Drag & Drop Furniture)** [cite: 165]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                                                            |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC32 [cite: 166]                                                                                                                                                                                                                                                                                                                     |
| **Tên Use Case**    | [cite_start]Kéo thả và bố trí nội thất [cite: 166]                                                                                                                                                                                                                                                                                               |
| **Tác nhân**        | [cite_start]User, Manager [cite: 166]                                                                                                                                                                                                                                                                                                            |
| **Mô tả**           | [cite_start]Cho phép người dùng lựa chọn vật dụng từ thư viện và kéo thả vào không gian phòng 3D, đồng thời điều chỉnh vị trí và hướng của vật thể [cite: 166]                                                                                                                                                                                   |
| **Điều kiện trước** | [cite_start]Người dùng đang ở chế độ xem không gian 3D và thư viện nội thất đã được tải [cite: 166]                                                                                                                                                                                                                                              |
| **Điều kiện sau**   | [cite_start]Nội thất được đặt vào không gian với thông tin vị trí và góc xoay được cập nhật [cite: 166]                                                                                                                                                                                                                                          |
| **Luồng chính**     | 1. Người dùng mở thư viện nội thất.<br>2. Người dùng chọn một vật dụng cần bố trí.<br>3. Người dùng kéo vật dụng vào không gian phòng 3D.<br>4. Hệ thống hiển thị vật thể tại vị trí mới.<br>5. Người dùng điều chỉnh vị trí, hướng xoay hoặc kích thước hiển thị.<br>6. [cite_start]Hệ thống cập nhật thay đổi theo thời gian thực. [cite: 167] |
| **Luồng thay thế**  | [cite_start]A1: Vật thể vượt ra ngoài không gian hợp lệ → Hệ thống từ chối đặt.<br>A2: Vật thể va chạm với đối tượng khác Hệ thống cảnh báo xung đột.<br>A3: Không tải được mô hình nội thất Hệ thống hiển thị lỗi. [cite: 167]                                                                                                                  |

[cite_start]**Use Case UC33: Lưu bố cục nội thất (Save Furniture Layout)** [cite: 168]

| Thuộc tính          | Mô tả                                                                                                                                                                                                                                                                                                       |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã Use Case**     | [cite_start]UC33 [cite: 169]                                                                                                                                                                                                                                                                                |
| **Tên Use Case**    | [cite_start]Lưu bố cục nội thất [cite: 169]                                                                                                                                                                                                                                                                 |
| **Tác nhân**        | [cite_start]User, Manager [cite: 169]                                                                                                                                                                                                                                                                       |
| **Mô tả**           | [cite_start]Cho phép người dùng lưu cấu hình bố trí nội thất đã chỉnh sửa trong không gian 3D vào hệ thống [cite: 169]                                                                                                                                                                                      |
| **Điều kiện trước** | [cite_start]Người dùng đã thực hiện thay đổi bố cục nội thất [cite: 169]                                                                                                                                                                                                                                    |
| **Điều kiện sau**   | [cite_start]Dữ liệu bố trí nội thất được lưu vào cơ sở dữ liệu [cite: 169]                                                                                                                                                                                                                                  |
| **Luồng chính**     | 1. Người dùng chọn chức năng lưu bố cục.<br>2. Hệ thống thu thập dữ liệu vị trí, góc xoay và thuộc tính của các vật thể nội thất.<br>3. Hệ thống kiểm tra tính hợp lệ của dữ liệu.<br>4. Hệ thống lưu cấu hình vào cơ sở dữ liệu.<br>5. [cite_start]Hệ thống hiển thị thông báo lưu thành công. [cite: 169] |
| **Luồng thay thế**  | [cite_start]A1: Dữ liệu không hợp lệ Hệ thống yêu cầu chỉnh sửa trước khi lưu. [cite: 169][cite_start]<br>A2: Xảy ra lỗi hệ thống hoặc lỗi cơ sở dữ liệu → Hệ thống thông báo lưu thất bại. [cite: 170]                                                                                                     |

---

## [cite_start]2.6 Sơ đồ luồng dữ liệu của ứng dụng (Data Flow Diagram – DFD) [cite: 171]

[cite_start]Sơ đồ luồng dữ liệu (Data Flow Diagram - DFD) là một công cụ quan trọng trong quá trình phân tích và thiết kế hệ thống thông tin[cite: 172]. [cite_start]DFD được sử dụng nhằm mô tả cách dữ liệu được xử lý, lưu trữ và luân chuyển giữa các thành phần khác nhau trong hệ thống[cite: 173]. [cite_start]Thông qua việc sử dụng DFD, các nhà phát triển có thể hiểu rõ quá trình xử lý dữ liệu trong hệ thống, từ đó hỗ trợ việc thiết kế và triển khai hệ thống một cách hiệu quả[cite: 174].

[cite_start]Trong mô hình DFD, hệ thống được mô tả thông qua bốn thành phần cơ bản[cite: 175]:

- [cite_start]**External Entity (Tác nhân ngoài):** là các đối tượng bên ngoài hệ thống nhưng có sự tương tác với hệ thống thông qua việc gửi hoặc nhận dữ liệu[cite: 177].
- [cite_start]**Process (Tiến trình):** biểu diễn các hoạt động xử lý dữ liệu trong hệ thống[cite: 178].
- [cite_start]**Data Store (Kho dữ liệu):** nơi lưu trữ dữ liệu của hệ thống, thường là cơ sở dữ liệu[cite: 179].
- [cite_start]**Data Flow (Luồng dữ liệu):** thể hiện sự di chuyển của dữ liệu giữa các thành phần trong hệ thống[cite: 180].

[cite_start]Đối với hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS, DFD được sử dụng để mô tả cách dữ liệu được trao đổi giữa người dùng, người quản lý và các thành phần xử lý trong hệ thống[cite: 181]. [cite_start]Hệ thống cho phép người dùng xem bản đồ, tra cứu thông tin căn hộ và tòa nhà, đồng thời hỗ trợ người quản lý thực hiện các chức năng quản lý căn hộ và hợp đồng thuê[cite: 182].

[cite_start]Để mô tả hệ thống một cách rõ ràng, DFD được xây dựng theo ba cấp độ bao gồm[cite: 183]:

- [cite_start]DFD Level 0 (Context Diagram): mô tả hệ thống ở mức tổng quan[cite: 184].
- [cite_start]DFD Level 1: phân rã hệ thống thành các chức năng chính[cite: 185].
- [cite_start]DFD Level 2: mô tả chi tiết các tiến trình xử lý dữ liệu[cite: 186].

### [cite_start]2.6.1 Sơ đồ ngữ cảnh của hệ thống (DFD Level 0) [cite: 187]

[cite_start]Sơ đồ luồng dữ liệu mức 0 (DFD Level 0), hay còn gọi là Context Diagram, được sử dụng để mô tả hệ thống ở mức tổng quan nhất[cite: 188]. [cite_start]Ở mức này, toàn bộ hệ thống được xem như một tiến trình duy nhất, thể hiện cách hệ thống tương tác với các tác nhân bên ngoài thông qua các luồng dữ liệu vào và ra[cite: 189].

[cite_start]Trong phạm vi đề tài, hệ thống được biểu diễn dưới dạng một tiến trình trung tâm có tên là Apartment Rental Management System[cite: 190]. [cite_start]Tiến trình này chịu trách nhiệm tiếp nhận, xử lý và phản hồi tất cả các yêu cầu liên quan đến việc tra cứu, quản lý và hiển thị dữ liệu của hệ thống[cite: 191].

[cite_start]Hệ thống tương tác với hai tác nhân chính[cite: 192]:

- [cite_start]**User (Người dùng):** Là đối tượng sử dụng hệ thống với mục đích tra cứu thông tin[cite: 193, 194]. [cite_start]Người dùng có thể gửi các yêu cầu như xem bản đồ tòa nhà, tra cứu thông tin căn hộ, xem mô hình không gian 3D (LoD4) và tương tác thử với nội thất[cite: 195]. [cite_start]Sau khi xử lý, hệ thống trả về các thông tin tương ứng như dữ liệu căn hộ, thông tin hợp đồng (nếu được cấp quyền) và mô hình hiển thị trực quan[cite: 196].
- [cite_start]**Manager/Admin (Quản trị viên):** Là đối tượng có quyền quản lý và vận hành hệ thống[cite: 197, 198]. [cite_start]Quản trị viên có thể gửi các yêu cầu cập nhật dữ liệu như thêm, sửa, xóa thông tin căn hộ, quản lý hợp đồng thuê, quản lý khách thuê (Tenant) và cấu hình danh mục nội thất[cite: 199]. [cite_start]Ngoài ra, hệ thống cũng cung cấp các báo cáo và trạng thái xử lý để hỗ trợ công tác quản lý[cite: 200].

[cite_start]Thông qua các tác nhân trên, hệ thống tiếp nhận các luồng dữ liệu đầu vào như[cite: 201]:

- [cite_start]Yêu cầu tra cứu thông tin [cite: 202]
- [cite_start]Yêu cầu hiển thị bản đồ và mô hình 3D [cite: 203]
- [cite_start]Yêu cầu cập nhật dữ liệu quản lý [cite: 204]

[cite_start]Sau khi xử lý, hệ thống cung cấp các luồng dữ liệu đầu ra tương ứng bao gồm[cite: 205]:

- [cite_start]Thông tin chi tiết về tòa nhà và căn hộ [cite: 206]
- [cite_start]Dữ liệu bản đồ GIS và mô hình không gian 3D [cite: 207]
- [cite_start]Kết quả xử lý các thao tác quản lý [cite: 208]
- [cite_start]Trạng thái lưu trữ và cập nhật dữ liệu [cite: 209]

[cite_start]Sơ đồ ngữ cảnh giúp làm rõ phạm vi hệ thống và xác định ranh giới giữa hệ thống với môi trường bên ngoài[cite: 210]. [cite_start]Đây là cơ sở quan trọng để tiếp tục phân rã hệ thống ở các mức chi tiết hơn trong DFD Level 1 và Level 2[cite: 211].

> [cite_start]**Thông tin từ Sơ đồ ngữ cảnh (Hình 2.x)**[cite: 221]:
> [cite_start]\* **Tiến trình:** \<\<Process 0\>\> Hệ thống Quản lý Cho thuê Căn hộ (Apartment Rental Management System)[cite: 215, 216].
> [cite_start]\* **User (Người dùng)** gửi "Yêu cầu tra cứu thông tin, Bản đồ & Mô hình 3D (LoD4)"[cite: 213, 214].
> [cite_start]\* **Hệ thống** trả về cho User "Thông tin căn hộ hợp đồng, Dữ liệu GIS & Mô hình trực quan"[cite: 212].
> [cite_start]\* **Manager/Admin (Quản trị viên)** gửi "Cập nhật dữ liệu (Căn hộ, Khách thuê), Cấu hình nội thất & Hợp đồng"[cite: 219, 220].
> [cite_start]\* **Hệ thống** trả về cho Manager/Admin "Kết quả xử lý, Báo cáo & Trạng thái hệ thống"[cite: 217, 218].

### [cite_start]2.6.2 Sơ đồ luồng dữ liệu mức 1 (DFD Level 1) [cite: 222]

[cite_start]Sau khi đã xác định phạm vi hệ thống ở mức tổng quan trong DFD Level 0, sơ đồ luồng dữ liệu mức 1 (DFD Level 1) được xây dựng nhằm phân rã tiến trình trung tâm Apartment Rental Management System thành các tiến trình con chính[cite: 223]. [cite_start]Việc phân rã này giúp làm rõ các chức năng cốt lõi của hệ thống cũng như cách dữ liệu được xử lý và lưu trữ tại từng thành phần[cite: 224]. [cite_start]Ở mức này, hệ thống được chia thành các tiến trình chức năng chính bao gồm quản lý dữ liệu nghiệp vụ và xử lý dữ liệu không gian[cite: 225].

**a. [cite_start]Các tiến trình chính của hệ thống** [cite: 259]

| Mã tiến trình | Tên tiến trình                 | Mô tả chức năng                                                                                      |
| :------------ | :----------------------------- | :--------------------------------------------------------------------------------------------------- |
| 1.0           | Quản lý tòa nhà                | [cite_start]Xử lý thông tin liên quan đến tòa nhà như vị trí, cấu trúc tổng thể [cite: 258]          |
| 2.0           | Quản lý căn hộ                 | [cite_start]Quản lý thông tin chi tiết của từng căn hộ (diện tích, trạng thái, giá thuê) [cite: 258] |
| 3.0           | Quản lý khách thuê             | [cite_start]Lưu trữ và xử lý thông tin khách thuê (Tenant) [cite: 258]                               |
| 4.0           | Quản lý hợp đồng               | [cite_start]Quản lý dữ liệu hợp đồng thuê giữa khách thuê và căn hộ [cite: 258]                      |
| 5.0           | Hiển thị không gian 3D         | [cite_start]Xử lý và hiển thị dữ liệu bản đồ GIS và mô hình 3D của tòa nhà [cite: 258]               |
| 6.0           | Quản lý không gian nội thất 3D | [cite_start]Xử lý tương tác kéo thả nội thất và lưu trữ bố cục không gian (LoD4) [cite: 258]         |

**b. [cite_start]Các kho dữ liệu (Data Stores)** [cite: 260]

| Mã kho | Tên kho dữ liệu          | Nội dung lưu trữ                                                 |
| :----- | :----------------------- | :--------------------------------------------------------------- |
| D1     | CSDL Tòa nhà             | [cite_start]Thông tin tổng quan tòa nhà [cite: 261]              |
| D2     | CSDL Căn hộ              | [cite_start]Thông tin chi tiết căn hộ [cite: 261]                |
| D3     | CSDL Khách thuê          | [cite_start]Thông tin Tenant [cite: 261]                         |
| D4     | CSDL Hợp đồng            | [cite_start]Dữ liệu hợp đồng thuê [cite: 261]                    |
| D5     | CSDL Không gian GIS      | [cite_start]Dữ liệu bản đồ và cấu trúc không gian [cite: 261]    |
| D6     | CSDL Không gian nội thất | [cite_start]Dữ liệu nội thất 3D và tọa độ không gian [cite: 261] |

**c. [cite_start]Luồng dữ liệu giữa các thành phần** [cite: 262]
[cite_start]Hệ thống tiếp nhận các yêu cầu từ hai tác nhân chính là User và Manager, sau đó phân phối đến các tiến trình tương ứng[cite: 263]:

- [cite_start]User -\> 2.0/5.0/6.0: Gửi yêu cầu tra cứu căn hộ, xem bản đồ hoặc tương tác nội thất 3D[cite: 265, 266, 267].
- [cite_start]Manager -\> 1.0/2.0/3.0/4.0/6.0: Gửi yêu cầu cập nhật dữ liệu quản lý[cite: 268, 270].

[cite_start]Các tiến trình sau khi xử lý sẽ truy xuất hoặc cập nhật dữ liệu từ các kho dữ liệu tương ứng[cite: 271]:

- [cite_start]2.0 -\> D2: truy vấn và cập nhật thông tin căn hộ[cite: 273].
- [cite_start]3.0 -\> D3: quản lý thông tin khách thuê[cite: 274, 275].
- [cite_start]4.0 -\> D4: xử lý hợp đồng[cite: 276].
- [cite_start]5.0 -\> D5, D6: lấy dữ liệu GIS và nội thất để hiển thị 3D[cite: 277, 278].
- [cite_start]6.0 -\> D6: lưu trữ và cập nhật bố cục nội thất[cite: 279].

**d. [cite_start]Mô tả luồng xử lý tiêu biểu (3D + nội thất)** [cite: 280]
[cite_start]Một trong những luồng dữ liệu quan trọng của hệ thống là quá trình tương tác với không gian 3D[cite: 281, 282]:

1.  [cite_start]User gửi yêu cầu xem không gian căn hộ[cite: 283].
2.  [cite_start]Tiến trình 5.0 truy vấn dữ liệu từ D5 (GIS) và D6 (nội thất)[cite: 284].
3.  [cite_start]Hệ thống trả về mô hình 3D cho giao diện hiển thị[cite: 285].
4.  [cite_start]User thực hiện thao tác kéo thả nội thất[cite: 286].
5.  [cite_start]Tiến trình 6.0 tiếp nhận dữ liệu tọa độ (X, Y, Z, Rotation)[cite: 287].
6.  [cite_start]Dữ liệu được lưu vào kho D6[cite: 288].
7.  [cite_start]Hệ thống trả về trạng thái cập nhật thành công[cite: 289].

### [cite_start]2.6.3 Sơ đồ luồng dữ liệu mức 2 (DFD Level 2) [cite: 290]

[cite_start]Sơ đồ luồng dữ liệu mức 2 (Data Flow Diagram Level 2 - DFD Level 2) được xây dựng nhằm tiếp tục phân rã chi tiết các tiến trình ở mức 1, qua đó làm rõ hơn các bước xử lý dữ liệu bên trong từng tiến trình[cite: 291]. [cite_start]Việc phân rã này giúp mô hình hóa cụ thể các thao tác xử lý, luồng dữ liệu nội bộ cũng như mối liên hệ giữa các thành phần trong hệ thống ở mức chi tiết hơn[cite: 292].

[cite_start]Trong phạm vi hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS, DFD Level 2 tập trung phân tích sâu vào các tiến trình có mức độ phức tạp cao, đặc biệt là tiến trình 5.0 (Hiển thị không gian 3D) và tiến trình 6.0 (Quản lý không gian nội thất 3D)[cite: 293]. [cite_start]Đây là hai tiến trình đóng vai trò quan trọng trong việc xử lý dữ liệu không gian và tương tác trực quan với người dùng[cite: 294].

**a. [cite_start]Phân rã tiến trình 5.0 – Hiển thị không gian 3D** [cite: 295]
[cite_start]Tiến trình 5.0 được phân tách thành các tiến trình con nhằm xử lý tuần tự các bước từ truy vấn dữ liệu đến hiển thị mô hình 3D[cite: 296]:

| Mã tiến trình | Tên tiến trình              | Mô tả                                                                               |
| :------------ | :-------------------------- | :---------------------------------------------------------------------------------- |
| 5.1           | Tiếp nhận yêu cầu hiển thị  | [cite_start]Nhận yêu cầu từ User về việc xem không gian căn hộ [cite: 297]          |
| 5.2           | Truy vấn dữ liệu không gian | [cite_start]Truy xuất dữ liệu từ kho D5 (GIS) và D6 (nội thất) [cite: 297]          |
| 5.3           | Xử lý và đồng bộ dữ liệu    | [cite_start]Chuẩn hóa và kết hợp dữ liệu không gian và dữ liệu nội thất [cite: 297] |
| 5.4           | Sinh mô hình 3D             | [cite_start]Chuyển đổi dữ liệu thành mô hình 3D trực quan [cite: 297]               |
| 5.5           | Trả kết quả hiển thị        | [cite_start]Gửi mô hình 3D đến giao diện người dùng [cite: 297]                     |

[cite_start]_Luồng dữ liệu chính:_ [cite: 298]

- [cite_start]User -\> 5.1: gửi yêu cầu xem không gian[cite: 299].
- [cite_start]5.2 \<-\> D5, D6: truy vấn dữ liệu không gian và nội thất[cite: 300].
- [cite_start]5.3 -\> 5.4: xử lý và dựng mô hình[cite: 301].
- [cite_start]5.5 -\> User: trả kết quả hiển thị[cite: 302].

[cite_start]Tiến trình này đảm bảo dữ liệu được xử lý theo chuỗi logic từ truy vấn đến trực quan hóa, giúp nâng cao trải nghiệm người dùng thông qua mô hình hóa không gian[cite: 303, 304].

**b. [cite_start]Phân rã tiến trình 6.0 – Quản lý không gian nội thất 3D** [cite: 305]
[cite_start]Tiến trình 6.0 được phân rã nhằm mô tả chi tiết quá trình tương tác và cập nhật dữ liệu nội thất trong không gian 3D[cite: 306]:

| Mã tiến trình | Tên tiến trình                | Mô tả                                                                          |
| :------------ | :---------------------------- | :----------------------------------------------------------------------------- |
| 6.1           | Tiếp nhận thao tác người dùng | [cite_start]Nhận thao tác kéo thả nội thất từ User [cite: 307]                 |
| 6.2           | Xử lý tọa độ và trạng thái    | [cite_start]Xác định vị trí (X, Y, Z) và góc xoay của đối tượng [cite: 307]    |
| 6.3           | Kiểm tra tính hợp lệ          | [cite_start]Kiểm tra va chạm, ràng buộc không gian và logic bố trí [cite: 307] |
| 6.4           | Cập nhật dữ liệu nội thất     | [cite_start]Ghi nhận thay đổi vào kho dữ liệu [cite: 307]                      |
| 6.5           | Phản hồi kết quả              | [cite_start]Trả trạng thái cập nhật cho User [cite: 307]                       |

[cite_start]_Luồng dữ liệu chính:_ [cite: 308]

- [cite_start]User -\> 6.1: gửi thao tác tương tác[cite: 309, 310].
- [cite_start]6.2 -\> 6.3: xử lý và kiểm tra dữ liệu[cite: 310].
- [cite_start]6.4 -\> D6: cập nhật dữ liệu nội thất[cite: 311].
- [cite_start]6.5 -\> User: phản hồi trạng thái[cite: 312].

[cite_start]Tiến trình này đảm bảo rằng mọi thay đổi trong không gian nội thất đều được kiểm soát chặt chẽ, đồng thời duy trì tính nhất quán giữa dữ liệu và mô hình hiển thị[cite: 313, 314].

**c. [cite_start]Mối liên hệ giữa tiến trình 5.0 và 6.0** [cite: 315]
[cite_start]Hai tiến trình 5.0 và 6.0 có mối quan hệ tương hỗ chặt chẽ trong hệ thống[cite: 316]:

- [cite_start]Tiến trình 5.0 sử dụng dữ liệu từ D6 để hiển thị nội thất trong không gian 3D[cite: 317].
- [cite_start]Tiến trình 6.0 cập nhật dữ liệu vào D6, từ đó ảnh hưởng trực tiếp đến kết quả hiển thị của tiến trình 5.0[cite: 318].

[cite_start]Sự liên kết này tạo thành một vòng lặp xử lý dữ liệu liên tục giữa hiển thị và tương tác, đảm bảo hệ thống phản ánh chính xác trạng thái không gian theo thời gian thực[cite: 319].

---

## [cite_start]2.7 Sơ đồ trình tự (Sequence Diagram) [cite: 320]

[cite_start]Sơ đồ trình tự (Sequence Diagram) là một trong những loại sơ đồ quan trọng trong mô hình hóa hệ thống theo UML, được sử dụng nhằm mô tả sự tương tác giữa các đối tượng trong hệ thống theo trình tự thời gian[cite: 321]. [cite_start]Thông qua sơ đồ này, có thể biểu diễn rõ ràng thứ tự gửi và nhận thông điệp giữa các thành phần, từ đó giúp làm rõ luồng xử lý của từng chức năng cụ thể trong hệ thống[cite: 322].

[cite_start]Đối với hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS, sơ đồ trình tự được sử dụng để mô tả các kịch bản tương tác tiêu biểu giữa người dùng, hệ thống và cơ sở dữ liệu[cite: 323]. [cite_start]Các sơ đồ này tập trung vào những chức năng quan trọng, đặc biệt là các chức năng có liên quan đến xử lý dữ liệu không gian và tương tác 3D[cite: 324].

### [cite_start]2.7.1 Sơ đồ trình tự tra cứu căn hộ và hiển thị bản đồ [cite: 325]

[cite_start]Sơ đồ này mô tả quá trình người dùng thực hiện tra cứu thông tin căn hộ và xem vị trí trên bản đồ[cite: 326].

[cite_start]**Các đối tượng tham gia:** [cite: 327]

- [cite_start]User [cite: 328]
- [cite_start]Web/Application Interface [cite: 329]
- [cite_start]Apartment Service [cite: 330]
- [cite_start]GIS Service [cite: 331]
- [cite_start]Database [cite: 332]

[cite_start]**Luồng xử lý:** [cite: 333]

1.  [cite_start]Người dùng gửi yêu cầu tìm kiếm căn hộ với các tiêu chí (giá, vị trí, diện tích, v.v.)[cite: 334].
2.  [cite_start]Giao diện hệ thống tiếp nhận yêu cầu và chuyển đến Apartment Service[cite: 335].
3.  [cite_start]Apartment Service truy vấn dữ liệu từ cơ sở dữ liệu căn hộ[cite: 336].
4.  [cite_start]Đồng thời, hệ thống gửi yêu cầu đến GIS Service để lấy dữ liệu không gian tương ứng[cite: 337].
5.  [cite_start]Dữ liệu từ Database và GIS Service được tổng hợp và xử lý[cite: 338].
6.  [cite_start]Kết quả được trả về giao diện dưới dạng danh sách căn hộ và bản đồ hiển thị vị trí[cite: 339].
7.  [cite_start]Người dùng nhận kết quả và tiếp tục tương tác nếu cần[cite: 340].

### [cite_start]2.7.2 Sơ đồ trình tự hiển thị không gian 3D của căn hộ [cite: 361]

[cite_start]Sơ đồ này mô tả quá trình hệ thống xử lý và hiển thị mô hình 3D của căn hộ khi người dùng yêu cầu[cite: 362].

[cite_start]**Các đối tượng tham gia:** [cite: 363]

- [cite_start]User [cite: 366]
- [cite_start]UI Viewer (3D Interface) [cite: 367]
- [cite_start]3D Rendering Engine [cite: 368]
- [cite_start]GIS Data Service [cite: 369]
- [cite_start]Interior Data Service [cite: 370]
- [cite_start]Database [cite: 371]

[cite_start]**Luồng xử lý:** [cite: 372]

1.  [cite_start]Người dùng gửi yêu cầu xem không gian 3D của một căn hộ cụ thể[cite: 373].
2.  [cite_start]Giao diện 3D tiếp nhận yêu cầu và chuyển đến hệ thống xử lý[cite: 374].
3.  [cite_start]Hệ thống gọi GIS Data Service để lấy dữ liệu cấu trúc không gian[cite: 375].
4.  [cite_start]Đồng thời, gọi Interior Data Service để lấy dữ liệu nội thất[cite: 376].
5.  [cite_start]Dữ liệu được tổng hợp và chuyển đến 3D Rendering Engine[cite: 377].
6.  [cite_start]Engine tiến hành dựng mô hình 3D hoàn chỉnh[cite: 378].
7.  [cite_start]Kết quả được trả về giao diện và hiển thị cho người dùng[cite: 379].

### [cite_start]2.7.3 Sơ đồ trình tự tương tác và cập nhật nội thất 3D [cite: 402]

[cite_start]Sơ đồ này mô tả quá trình người dùng tương tác với không gian nội thất và hệ thống cập nhật dữ liệu[cite: 403].

[cite_start]**Các đối tượng tham gia:** [cite: 404]

- [cite_start]User [cite: 406]
- [cite_start]UI Viewer (3D Interface) [cite: 407]
- [cite_start]Interaction Handler [cite: 408]
- [cite_start]Interior Service [cite: 409]
- [cite_start]Database [cite: 410]

[cite_start]**Luồng xử lý:** [cite: 411]

1.  [cite_start]Người dùng thực hiện thao tác kéo thả nội thất trong không gian 3D[cite: 412].
2.  [cite_start]Giao diện ghi nhận thao tác và gửi dữ liệu (tọa độ X, Y, Z, góc xoay) đến Interaction Handler[cite: 413, 414].
3.  [cite_start]Interaction Handler xử lý và chuyển dữ liệu đến Interior Service[cite: 415].
4.  [cite_start]Interior Service kiểm tra tính hợp lệ của dữ liệu (va chạm, ràng buộc không gian)[cite: 416].
5.  [cite_start]Nếu hợp lệ, dữ liệu được lưu vào cơ sở dữ liệu[cite: 417].
6.  [cite_start]Hệ thống phản hồi trạng thái cập nhật về giao diện[cite: 418].
7.  [cite_start]Giao diện cập nhật lại mô hình hiển thị theo dữ liệu mới[cite: 419].

### [cite_start]2.7.4 Sơ đồ trình tự quản lý hợp đồng thuê [cite: 442]

[cite_start]Sơ đồ này mô tả quá trình quản trị viên tạo và quản lý hợp đồng thuê[cite: 443].

[cite_start]**Các đối tượng tham gia:** [cite: 444]

- [cite_start]Manager/Admin [cite: 445]
- [cite_start]Web Interface [cite: 445]
- [cite_start]Contract Service [cite: 446]
- [cite_start]Apartment Service [cite: 447]
- [cite_start]Tenant Service [cite: 448]
- [cite_start]Database [cite: 449]

[cite_start]**Luồng xử lý:** [cite: 450]

1.  [cite_start]Manager gửi yêu cầu tạo hợp đồng thuê[cite: 451].
2.  [cite_start]Giao diện chuyển yêu cầu đến Contract Service[cite: 452].
3.  [cite_start]Contract Service kiểm tra thông tin căn hộ thông qua Apartment Service[cite: 453].
4.  [cite_start]Đồng thời kiểm tra thông tin khách thuê qua Tenant Service[cite: 454].
5.  [cite_start]Sau khi xác thực, hợp đồng được lưu vào cơ sở dữ liệu[cite: 455].
6.  [cite_start]Hệ thống trả về thông báo tạo hợp đồng thành công hoặc lỗi[cite: 456].
