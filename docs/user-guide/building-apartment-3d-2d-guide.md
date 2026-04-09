# Hướng dẫn chi tiết màn 3D và 2D cho tòa nhà, căn hộ

Tài liệu này mô tả cách dùng thực tế của 2 màn quan trọng nhất hiện tại:

- Trang chi tiết tòa nhà: `/buildings/:id`
- Trang chi tiết căn hộ: `/buildings/:id/apartments/:apartmentId`

Mục tiêu của tài liệu là giúp người dùng, manager, tester và người chuẩn bị demo hiểu rõ:

- mỗi chế độ xem đang dùng để làm gì
- cách thao tác đúng trên UI hiện tại
- dữ liệu nào ảnh hưởng tới việc màn hình có hiển thị đúng hay không

## 1. Trang chi tiết tòa nhà (`/buildings/:id`)

Trang này hiện có 2 chế độ chính:

- `3D tổng quan`
- `Mặt sàn theo tầng`

### 1.1. Khi nào dùng `3D tổng quan`

Chế độ này dùng để:

- xem mô hình tổng thể của tòa nhà
- xoay, zoom, pan toàn cảnh
- click mesh căn hộ nếu model đã map được căn hộ
- quay lại góc nhìn exterior sau khi đang xem từng tầng

### 1.2. Khi nào dùng `Mặt sàn theo tầng`

Chế độ này dùng để:

- xem từng tầng riêng lẻ
- xem hotspot `door`, `elevator`, `stairs`, `junction`
- bấm cửa để mở thông tin căn hộ
- bấm thang máy hoặc cầu thang để chuyển tầng
- kiểm tra topology indoor của tầng đang chọn

Nếu tầng chưa có model 3D riêng nhưng đã có hotspot local, hệ thống vẫn có thể hiển thị scene thử nghiệm để test luồng tương tác.

## 2. Cách dùng chế độ `3D tổng quan`

### 2.1. Cách mở

1. Vào `/map`
2. Chọn tòa nhà
3. Bấm `Xem chi tiết`
4. Trong trang `/buildings/:id`, bấm `3D tổng quan`

### 2.2. Các thao tác chuột

- Kéo chuột trái: xoay mô hình
- Cuộn chuột: zoom
- Kéo chuột phải: pan
- Bấm `Reset góc nhìn`: đưa camera về vị trí mặc định

### 2.3. Các tình huống có thể xảy ra

- Nếu tòa nhà có `model3dUrl`, hệ thống render model tổng quan
- Nếu file model lỗi hoặc thiếu asset, màn hình sẽ hiện card lỗi render
- Nếu tòa nhà chưa có model, màn hình sẽ hiện placeholder thay vì crash

### 2.4. Upload model tổng quan

Phần này dành cho `Manager`.

Khối upload có nhãn:

- `Upload mô hình 3D tổng quan tòa nhà (.glb/.gltf)`

Ý nghĩa:

- file upload ở đây chỉ dùng cho chế độ `3D tổng quan`
- file này không tự động trở thành model riêng của từng tầng

Khuyến nghị:

- ưu tiên dùng `.glb`
- nếu dùng `.gltf`, cần chắc chắn file `.bin` và `textures` đi kèm được phục vụ đúng

## 3. Cách dùng chế độ `Mặt sàn theo tầng`

### 3.1. Cách chuyển sang floor mode

1. Trong trang `/buildings/:id`, bấm `Mặt sàn theo tầng`
2. Ở sidebar trái, bấm vào dòng `Tầng x`

Khi đó hệ thống sẽ:

- lấy tầng đang chọn
- tìm `floors.model3dUrl` của tầng đó
- render model tầng nếu có
- nếu chưa có model nhưng có hotspot local, dùng scene thử nghiệm để test hotspot

### 3.2. Danh sách tầng ở sidebar trái

Mỗi dòng tầng hiện:

- số tầng
- số căn của tầng
- nút bật/tắt hiển thị tầng trong overview

Với `Manager`, ngay dưới mỗi tầng còn có:

- `Sửa tầng`
- `Xóa tầng`

### 3.3. Upload model riêng cho tầng

Phần này dành cho `Manager`.

Khối upload có nhãn:

- `Upload model 3D riêng cho tầng ...`

Ý nghĩa:

- file upload ở đây được gán vào `floors.model3dUrl`
- file này chỉ dùng cho `Mặt sàn theo tầng`
- đây là luồng riêng với model tổng quan của building

Khi upload xong:

- chọn lại đúng tầng
- giữ chế độ `Mặt sàn theo tầng`
- model tầng sẽ được render thay cho scene thử nghiệm

## 4. Hotspot trên mặt sàn tầng

Hotspot là các điểm tương tác nổi trên mặt sàn 3D.

### 4.1. Các loại hotspot

- `door`: cửa căn hộ hoặc cửa phòng
- `elevator`: thang máy
- `stairs`: cầu thang bộ
- `junction`: điểm giao trung gian trong graph

### 4.2. Người dùng dùng hotspot như thế nào

- Bấm `door`
  - mở popup căn hộ
  - có thể bấm tiếp `Mở trang chi tiết căn hộ`
- Bấm `elevator`
  - hiện danh sách tầng reachable bằng hệ thang máy đó
  - chọn tầng để chuyển nhanh
- Bấm `stairs`
  - hiện các tầng reachable trong hệ cầu thang đó
  - chọn tầng để chuyển nhanh

### 4.3. Một hotspot cần gì để hiển thị đúng

Tối thiểu cần:

- `nodeType`
- `floorId`
- `lng`
- `lat`
- `z`
- `localX`
- `localY`
- `localZ`

Quan trọng nhất cho việc hiển thị trên UI 3D:

- `localX`
- `localY`
- `localZ`

Ý nghĩa:

- `lng/lat/z`: tọa độ GIS nghiệp vụ
- `localX/localY/localZ`: tọa độ local trong model tầng

Nếu local rỗng hoặc sai:

- hotspot có thể không hiện
- hoặc hiện sai chỗ trên mô hình

### 4.4. Với hotspot loại `door`

Nếu muốn bấm cửa mở đúng căn hộ, hotspot `door` nên được liên kết với căn hộ.

Trên UI hiện tại, khi tạo/sửa `door`, có field:

- `Căn hộ liên kết`

Khi chọn căn hộ:

- hệ thống tự gán hotspot đó thành `entryNodeId` của căn hộ
- từ đó popup và route chi tiết căn hộ biết phải mở căn nào

## 5. Tab `Topology tầng`

Khối này nằm dưới sidebar trái và là trung tâm quản trị indoor navigation của tầng đang chọn.

### 5.1. Tab `Hotspot`

Hiển thị:

- tổng số hotspot của tầng
- số lượng `door`, `elevator`, `stairs`, `junction`
- danh sách từng hotspot

Với mỗi hotspot, manager có thể:

- `Sửa`
- `Xóa`
- bấm vào card hotspot để focus nhanh trên mặt sàn

### 5.2. Tab `Kết nối`

Hiển thị:

- danh sách edge liên quan tới tầng
- loại edge
- node bắt đầu
- node kết thúc
- khoảng cách, thời gian đi, khả năng tiếp cận

Manager có thể:

- `Thêm edge`
- `Sửa edge`
- `Xóa edge`

### 5.3. Gợi ý tạo edge tự động

Khi bạn vừa tạo hoặc sửa hotspot `elevator` hoặc `stairs`, nếu hệ thống phát hiện:

- có node cùng loại ở tầng khác
- nhưng chưa có edge nối

UI sẽ hiện khối:

- `Gợi ý tạo edge liên tầng`

Bạn chỉ cần bấm:

- `Tạo edge gợi ý`

## 6. Quản lý tầng ngay trên trang tòa nhà

Manager hiện có thể thao tác trực tiếp:

- `Thêm tầng mới`
- `Sửa tầng`
- `Xóa tầng`

Các trường chính của tầng:

- `floorNumber`
- `elevation`
- `floorPlanWkt`
- `description`

`floorPlanWkt` là dữ liệu sơ đồ 2D của tầng ở mức GIS, khác với model 3D render trên scene.

## 7. Popup căn hộ từ trang tòa nhà

Khi bấm `door` hoặc mesh căn hộ, nếu dữ liệu map đúng, hệ thống mở popup chứa:

- mã căn hộ
- diện tích
- giá thuê
- trạng thái
- tenant/hợp đồng nếu tài khoản có quyền

Nút quan trọng trong popup:

- `Mở trang chi tiết căn hộ`

Nút này dẫn tới:

- `/buildings/:id/apartments/:apartmentId`

## 8. Trang chi tiết căn hộ (`/buildings/:id/apartments/:apartmentId`)

Đây là màn hình nghiệp vụ chi tiết nhất của căn hộ. Trang này hiện kết hợp:

- thông tin căn hộ
- hợp đồng và tenant theo quyền
- LoD4 spaces
- layout nội thất
- workspace kéo thả 2D
- thư viện nội thất
- access grant

### 8.1. Khối thông tin cơ bản

Hiển thị:

- mã căn hộ
- diện tích
- số phòng ngủ
- số phòng tắm
- giá thuê
- trạng thái
- indoor LoD
- mô tả

### 8.2. Khối tenant và hợp đồng

Trang này không tự suy luận quyền chỉ từ role.

Nó dùng cờ backend trả về:

- `canViewTenant`
- `canViewContract`

Khi có quyền:

- hiện card tenant
- hiện card hợp đồng hiện tại

Khi không có quyền:

- hiện thông báo truy cập hạn chế

## 9. Không gian LoD4 trên trang căn hộ

### 9.1. Không gian LoD4 dùng để làm gì

LoD4 giúp mô tả cấu trúc bên trong căn hộ:

- `unit`: toàn bộ căn hộ
- `room`: một phòng
- `zone`: một vùng nhỏ bên trong phòng

Tác dụng:

- phân chia căn hộ thành các khu vực có nghĩa
- làm chỗ bám cho furniture item
- giúp workspace 2D biết phòng nào nằm ở đâu
- là nền dữ liệu để sau này nâng lên indoor 3D thật

### 9.2. Cách thêm không gian

Trong card `Không gian LoD4`, bấm:

- `Thêm không gian`

Form hiện có các trường:

- `Tên không gian`
- `Loại không gian`
- `Room type`
- `Không gian cha`
- `Model 3D URL`
- `Boundary (WKT PolygonZ)`
- `Metadata (JSON)`

### 9.3. Ý nghĩa từng trường

- `Tên không gian`: tên hiển thị, ví dụ `Phòng khách`
- `Loại không gian`: `unit`, `room`, `zone`
- `Room type`: ví dụ `living_room`, `bedroom`, `kitchen`
- `Không gian cha`: dùng để tạo quan hệ cha/con
- `Model 3D URL`: hiện chủ yếu là dữ liệu tham chiếu, chưa render thành 3D room viewer thật
- `Boundary`: polygon để workspace 2D vẽ sơ đồ phòng
- `Metadata`: JSON mở rộng

### 9.4. Tối thiểu cần gì để thấy kết quả trên workspace

Nếu muốn thấy phòng hiển thị lên workspace 2D, cần ưu tiên:

- `Tên không gian`
- `Loại không gian`
- `Boundary`

Nếu `Boundary` hợp lệ:

- workspace sẽ vẽ ranh giới phòng
- hiện nhãn phòng
- dùng boundary đó để tự gắn item vào đúng space khi thả đồ

## 10. Layout nội thất

`Layout` là một phương án bố trí nội thất của cùng một căn hộ.

Ví dụ:

- `Layout cơ bản`
- `Layout gia đình`
- `Layout tối giản`

Mỗi layout có:

- tên
- trạng thái
- version
- danh sách item nội thất riêng

### 10.1. Cách dùng đúng

1. Tạo hoặc chọn một layout
2. Chọn layout muốn thao tác
3. Mọi item nội thất thêm vào sau đó sẽ thuộc layout này

Nếu chưa chọn layout:

- workspace kéo thả không thể dùng đầy đủ

## 11. Workspace kéo thả nội thất

Đây là workspace 2D, không phải scene interior 3D thật.

### 11.1. Dùng để làm gì

- kéo item từ thư viện vào layout
- đổi vị trí item trong layout
- nhìn nhanh item đang nằm ở khu vực nào của căn hộ
- kiểm tra item đã được gắn đúng space LoD4 chưa

### 11.2. Quy trình thao tác

1. Chọn một layout
2. Kéo item từ `Thư viện nội thất`
3. Thả vào `Workspace kéo thả nội thất`
4. Hệ thống tạo item mới trong layout
5. Nếu điểm thả nằm trong boundary của một space, item tự được gắn `spaceId`

### 11.3. Điều gì ảnh hưởng đến trải nghiệm workspace

- Nếu chưa có layout: không kéo thả hiệu quả được
- Nếu chưa có `boundary`: workspace vẫn dùng được, nhưng không thấy sơ đồ phòng
- Nếu đã có `boundary`: workspace sẽ trực quan hơn nhiều vì thấy luôn các phòng/vùng

### 11.4. Vị trí item đang được lưu thế nào

Backend lưu vị trí theo `POINT Z`.

UI hiện:

- render item trong workspace
- hiển thị vị trí ở bảng item theo dạng dễ đọc hơn
- tránh hiển thị geometry hex khó hiểu

## 12. Thư viện nội thất

Card `Thư viện nội thất` là nơi quản lý các mẫu nội thất dùng cho kéo thả.

Manager có thể:

- thêm mẫu mới
- sửa mẫu
- xóa mẫu
- bật/tắt trạng thái kích hoạt

Các trường chính:

- mã
- tên
- loại nội thất
- model URL
- kích thước mặc định
- metadata

Lưu ý:

- `model URL` hiện chủ yếu là dữ liệu tham chiếu
- trong trang này tương tác chính vẫn là workspace 2D

## 13. Access grant theo căn hộ

Card `Phân quyền xem tenant và hợp đồng` chỉ dành cho manager.

Chức năng:

- cấp grant mới
- sửa grant
- thu hồi grant
- bật/tắt riêng:
  - `Xem tenant`
  - `Xem contract`

Trường trong form:

- user
- `canViewTenant`
- `canViewContract`
- `expiresAt`
- `note`

Mục tiêu:

- cho user thường xem tenant/hợp đồng theo từng căn hộ
- không phải mở toàn bộ dữ liệu nhạy cảm cho cả hệ thống

## 14. Khuyến nghị luồng demo

### 14.1. Demo tòa nhà

1. Vào `/map`
2. Chọn tòa nhà
3. Mở `/buildings/:id`
4. Xem `3D tổng quan`
5. Chuyển sang `Mặt sàn theo tầng`
6. Chọn tầng
7. Bấm `door` để mở popup căn hộ
8. Bấm `elevator` hoặc `stairs` để chuyển tầng

### 14.2. Demo căn hộ

1. Từ popup căn hộ, bấm `Mở trang chi tiết căn hộ`
2. Xem thông tin căn hộ, tenant, hợp đồng
3. Tạo một `space` LoD4 có `boundary`
4. Tạo một `layout`
5. Kéo item từ `Thư viện nội thất` vào workspace
6. Kiểm tra item đã gắn đúng space chưa
7. Nếu là manager, mở phần `Access grant` để cấp quyền xem dữ liệu

## 15. Các hiểu nhầm thường gặp

### 15.1. `Model 3D URL` ở space/furniture có phải đang render thành 3D thật không

Chưa.

Hiện tại:

- model 3D của building và floor có thể render thật
- nhưng trong trang căn hộ, workspace vẫn là 2D
- `model3dUrl` ở `space` và `catalog` hiện chủ yếu là dữ liệu tham chiếu

### 15.2. `lng/lat/z` và `localX/localY/localZ` khác nhau thế nào

- `lng/lat/z`: tọa độ GIS nghiệp vụ
- `localX/localY/localZ`: tọa độ local để render hotspot trên model tầng

Muốn hotspot hiện đúng chỗ trên UI:

- ưu tiên chỉnh `localX/localY/localZ`

### 15.3. `navigation_edges` có tự sinh không

Không tự sinh hoàn toàn.

Hiện tại:

- seed có thể tạo sẵn một số edge mẫu
- UI có gợi ý tạo edge nhanh cho `elevator/stairs`
- nhưng nhìn chung topology vẫn là dữ liệu phải kiểm soát chủ động

## 16. Tài liệu liên quan

- [Bản đồ GIS và Mô hình 3D](D:\Workspace\IE402\docs\frontend\map-gis.md)
- [Quản lý căn hộ](D:\Workspace\IE402\docs\frontend\apartments.md)
- [Workflow model tầng và hotspot local](D:\Workspace\IE402\docs\frontend\floor-model-hotspot-workflow.md)
- [Hướng dẫn cho Manager](D:\Workspace\IE402\docs\user-guide\manager.md)
