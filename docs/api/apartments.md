# Apartments API

Base URL: `/api/apartments`

> Tất cả route yêu cầu đăng nhập.
> Căn hộ dùng **soft delete**.

---

## Danh sách căn hộ

```
GET /api/apartments
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "floorId": 1,
    "code": "A-101",
    "area": "65.50",
    "numBedrooms": 2,
    "numBathrooms": 1,
    "rentalPrice": "8000000.00",
    "status": "available",
    "description": null,
    "createdById": null,
    "updatedById": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Chi tiết căn hộ

```
GET /api/apartments/:id
```

**Response:** `200` - Object căn hộ

**Lỗi:** `404` - Không tìm thấy

---

## Chi tiết căn hộ mở rộng LoD4

```http
GET /api/apartments/:id/details
```

Trả về gói dữ liệu dùng cho trang chi tiết căn hộ:
- thông tin căn hộ
- tầng, tòa nhà
- thông tin tenant/hợp đồng theo quyền
- danh sách không gian indoor
- danh sách layouts nội thất và items
- thư viện nội thất đang active

**Quyền truy cập:**
- `Manager`: xem được `activeContract` + `tenant` đầy đủ
- `User` là tenant liên kết hoặc được cấp grant theo căn hộ: xem theo quyền đã cấp
- `User` không có grant: chỉ xem tenant công khai, `activeContract = null`, `canViewContract = false`

**Response:** `200`

```json
{
  "apartment": { "id": 1, "code": "SR-101", "status": "rented" },
  "floor": { "id": 1, "buildingId": 1, "floorNumber": 1 },
  "building": { "id": 1, "name": "Sunrise Tower" },
  "canViewTenant": false,
  "canViewContract": false,
  "activeContract": null,
  "tenant": {
    "id": 1,
    "fullName": "Nguyễn Văn An",
    "phone": null,
    "email": null,
    "idCard": "",
    "address": null
  },
  "spaces": [],
  "layouts": [],
  "furnitureCatalog": []
}
```

## Phân quyền truy cập theo căn hộ

### Danh sách access grant

```http
GET /api/apartments/:id/access-grants
```

> Chỉ `Manager`

### Cấp quyền / cập nhật grant theo user

```http
POST /api/apartments/:id/access-grants
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| userId | number | Yes | User được cấp quyền |
| canViewTenant | boolean | Yes | Xem tenant đầy đủ |
| canViewContract | boolean | Yes | Xem hợp đồng |
| expiresAt | string \| null | No | Thời điểm hết hạn grant |
| note | string \| null | No | Ghi chú |

### Cập nhật grant

```http
PUT /api/apartments/:id/access-grants/:grantId
```

### Thu hồi grant

```http
DELETE /api/apartments/:id/access-grants/:grantId
```

---

## Không gian indoor của căn hộ

### Thêm không gian

```http
POST /api/apartments/:id/spaces
```

> Chỉ `Manager`

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| name | string | Yes | Tên không gian |
| spaceType | string | Yes | `unit`, `room`, `zone` |
| roomType | string \| null | No | `living_room`, `bedroom`, `kitchen`, ... |
| parentSpaceId | number \| null | No | Không gian cha |
| model3dUrl | string \| null | No | Model 3D chi tiết |
| boundary | string \| null | No | WKT `POLYGON Z(...)` |
| metadata | object \| null | No | Thuộc tính mở rộng |

### Cập nhật không gian

```http
PUT /api/apartments/:id/spaces/:spaceId
```

### Xóa không gian

```http
DELETE /api/apartments/:id/spaces/:spaceId
```

Nếu không gian đang chứa item nội thất, API trả `400`.

---

## Layout nội thất

### Thêm layout

```http
POST /api/apartments/:id/layouts
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| name | string | Yes | Tên layout |
| status | string | Yes | `draft`, `published`, `archived` |
| version | number | Yes | Phiên bản |

### Cập nhật layout

```http
PUT /api/apartments/:id/layouts/:layoutId
```

### Xóa layout

```http
DELETE /api/apartments/:id/layouts/:layoutId
```

Khi xóa layout, toàn bộ `furniture_items` liên quan cũng bị xóa.

---

## Item nội thất trong layout

### Thêm item

```http
POST /api/apartments/:id/layouts/:layoutId/items
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| catalogId | number | Yes | ID mẫu nội thất |
| spaceId | number \| null | No | Không gian chứa item |
| label | string \| null | No | Tên gợi nhớ |
| position | string | Yes | WKT `POINT Z(x y z)` |
| rotationX | string | Yes | Góc xoay |
| rotationY | string | Yes | Góc xoay |
| rotationZ | string | Yes | Góc xoay |
| scaleX | string | Yes | Tỷ lệ |
| scaleY | string | Yes | Tỷ lệ |
| scaleZ | string | Yes | Tỷ lệ |
| isLocked | boolean | Yes | Khóa item |
| metadata | object \| null | No | Thuộc tính mở rộng |

**Validate hiện tại ở BE:**
- từ chối item ngoài vùng `0..100` theo trục X/Y
- từ chối va chạm gần nhau trong cùng layout

### Cập nhật item

```http
PUT /api/apartments/:id/layouts/:layoutId/items/:itemId
```

### Xóa item

```http
DELETE /api/apartments/:id/layouts/:layoutId/items/:itemId
```

---

## Thêm căn hộ (UC14)

```
POST /api/apartments
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| floorId | number | Yes | ID tầng |
| code | string | Yes | Mã căn hộ (unique) |
| area | number | Yes | Diện tích (m2) |
| numBedrooms | number | No | Số phòng ngủ |
| numBathrooms | number | No | Số phòng tắm |
| rentalPrice | number | Yes | Giá thuê (VND/tháng) |
| status | string | No | `available` (mặc định), `rented`, `maintenance` |
| description | string | No | Mô tả |
| createdById | number | No | ID manager tạo |

**Response:** `201` - Object căn hộ đã tạo

> Backend hiện không chặn riêng theo `Manager` ở route này; quyền quản trị được kiểm soát ở tầng ứng dụng/frontend.

---

## Cập nhật căn hộ (UC15)

```
PUT /api/apartments/:id
```

**Body:** Các field cần cập nhật (tương tự POST)

**Response:** `200` - Object căn hộ đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Cập nhật trạng thái căn hộ (UC17)

```
PATCH /api/apartments/:id/status
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| status | string | Yes | `available`, `rented`, `maintenance` |

**Response:** `200` - Object căn hộ đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa căn hộ (UC16)

```
DELETE /api/apartments/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa căn hộ" }
```

**Lỗi:** `404` - Không tìm thấy
