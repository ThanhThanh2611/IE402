# Quản lý căn hộ

Use Cases: UC10-17, UC31-33

## 1. Chi tiết căn hộ (`/buildings/:id/apartments/:apartmentId`)

### API chính

- `GET /api/apartments/:apartmentId/details`
- `GET /api/furniture-catalog`
- Với `Manager`: các API CRUD cho `spaces`, `layouts`, `layout-items`, `furniture-catalog`

Trang này là màn hình chi tiết nghiệp vụ của căn hộ. FE lấy một payload tổng hợp từ backend, gồm thông tin căn hộ, hợp đồng hiện tại, tenant hiện tại, danh sách không gian LoD4, layout nội thất, item nội thất và thư viện furniture catalog.

### Quyền truy cập dữ liệu

Response detail hiện có các cờ:
- `canViewTenant`
- `canViewContract`

FE render theo đúng các cờ backend trả về, thay vì tự suy luận chỉ từ `role`. Cách này khớp với cơ chế `apartment_access_grants` ở backend.

### Các khối thông tin trên trang

#### Thông tin cơ bản

| Trường | Field | Hiển thị |
|---|---|---|
| Mã căn hộ | `code` | Text |
| Diện tích | `area` | `XX m2` |
| Số phòng ngủ | `numBedrooms` | Number |
| Số phòng tắm | `numBathrooms` | Number |
| Giá thuê | `rentalPrice` | Format VND |
| Trạng thái | `status` | Badge |
| Indoor LoD | `indoorLodLevel` | Badge/Text |
| Mô tả | `description` | Paragraph |

#### Trạng thái căn hộ

| Giá trị | Label tiếng Việt |
|---|---|
| `available` | Còn trống |
| `rented` | Đã thuê |
| `maintenance` | Đang bảo trì |

#### Khối tenant và hợp đồng

- Nếu `canViewTenant = true`, FE hiển thị card người thuê hiện tại.
- Nếu `canViewContract = true`, FE hiển thị card hợp đồng hiện tại.
- Nếu backend không cấp quyền, UI hiển thị trạng thái hạn chế truy cập thay vì gọi các endpoint riêng như luồng cũ.

### LoD4 và nội thất

#### Không gian căn hộ

- FE hiển thị danh sách `spaces`
- Các loại chính: `unit`, `room`, `zone`
- `roomType` có thể là `living_room`, `bedroom`, `kitchen`, `bathroom`, ...
- `Manager` có thể thêm, sửa, xóa không gian

#### Layout nội thất

- Mỗi căn hộ có nhiều `layouts`
- Mỗi layout có `status`, `version`, `name`
- FE cho phép chọn layout hiện hành để thao tác
- `Manager` có thể tạo, sửa, xóa layout

#### Workspace bố trí nội thất

- FE hiển thị workspace 2D để mô phỏng kéo thả
- Nếu `spaces` có `boundary` hợp lệ, FE render trực tiếp ranh giới không gian LoD4 lên workspace dưới dạng lớp sơ đồ phòng/vùng
- Mỗi polygon hiển thị nhãn không gian để manager biết đồ đang được đặt trong phòng nào
- Item mới được tạo từ `furnitureCatalog`
- Item có thể cập nhật `position`, `rotation`, `scale`, `metadata`
- Dữ liệu vị trí được đồng bộ về backend theo geometry `POINT Z`
- Khi thả item vào bên trong boundary của một `space`, FE tự gắn `spaceId` phù hợp trước khi gọi backend

#### Thư viện nội thất

- FE hiển thị `furnitureCatalog`
- `Manager` có thể thêm, sửa, xóa mềm, kích hoạt/vô hiệu hóa mẫu nội thất
- API nhóm này dùng `/api/furniture-catalog`

### Lưu ý hiện trạng triển khai

- Route này đã được triển khai thực tế, không còn là placeholder.
- Phần thao tác nội thất hiện đi theo hướng workspace 2D kết hợp dữ liệu 3D ở backend, chưa phải editor 3D hoàn chỉnh.
- Hướng dẫn thao tác chi tiết theo đúng UI hiện tại xem thêm tại [building-apartment-3d-2d-guide.md](D:\Workspace\IE402\docs\user-guide\building-apartment-3d-2d-guide.md)

## 2. Quản lý căn hộ (`/apartments`) - Chỉ Manager

### Danh sách căn hộ

- **API**: `GET /api/apartments?floorId=:floorId`
- Hiển thị dạng bảng
- FE có luồng chọn tòa nhà -> chọn tầng -> tải danh sách căn hộ theo tầng

#### Cột bảng

| Cột | Field |
|---|---|
| Mã căn hộ | `code` |
| Diện tích | `area` |
| Số phòng ngủ | `numBedrooms` |
| Giá thuê | `rentalPrice` |
| Trạng thái | `status` |
| Hành động | xem, sửa, xóa, đổi trạng thái |

### UC14 - Thêm căn hộ

- **API**: `POST /api/apartments`

#### Trường form

| Trường | Field | Bắt buộc |
|---|---|---|
| Tầng | `floorId` | Có |
| Mã căn hộ | `code` | Có |
| Diện tích | `area` | Có |
| Số phòng ngủ | `numBedrooms` | Không |
| Số phòng tắm | `numBathrooms` | Không |
| Giá thuê | `rentalPrice` | Có |
| Mô tả | `description` | Không |

### UC15 - Sửa căn hộ

- **API**: `PUT /api/apartments/:id`
- Dùng lại cùng form với create

### UC16 - Xóa căn hộ

- **API**: `DELETE /api/apartments/:id`
- Backend dùng soft delete

### UC17 - Cập nhật trạng thái

- **API**: `PATCH /api/apartments/:id/status`
- Body: `{ "status": "available" | "rented" | "maintenance" }`

## 3. Access grant theo căn hộ

Backend có nhóm API `access-grants` cho manager để cấp quyền xem tenant/hợp đồng theo từng căn hộ. FE hiện đã có màn hình quản trị grant ngay trong route chi tiết căn hộ.

### API dùng cho khối này

- `GET /api/apartments/:id/access-grants`
- `POST /api/apartments/:id/access-grants`
- `PUT /api/apartments/:id/access-grants/:grantId`
- `DELETE /api/apartments/:id/access-grants/:grantId`
- `GET /api/users`

### Khả năng hiện tại của FE

- Hiển thị danh sách grant theo căn hộ
- Hiển thị user được cấp quyền, email, hạn grant, ghi chú
- Cấp quyền mới cho user đang hoạt động
- Sửa grant đã có
- Thu hồi grant
- Bật/tắt riêng:
  - `canViewTenant`
  - `canViewContract`

### Lưu ý triển khai

- FE vẫn bám theo quyền backend trả về ở payload chi tiết căn hộ thông qua `canViewTenant` và `canViewContract`
- UI manager chỉ là lớp quản trị grant; quyết định cuối cùng về dữ liệu được xem vẫn do backend kiểm soát
