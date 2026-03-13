# Apartments API

Base URL: `/api/apartments`

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
