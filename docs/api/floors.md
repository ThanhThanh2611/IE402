# Floors API

Base URL: `/api/floors`

> Tất cả route yêu cầu đăng nhập.

---

## Danh sách tầng

```
GET /api/floors
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| buildingId | number | Lọc theo tòa nhà |

**Ví dụ:**

```
GET /api/floors?buildingId=1
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "buildingId": 1,
    "floorNumber": 1,
    "elevation": "0.00",
    "model3dUrl": null,
    "floorPlanGeoJson": null,
    "description": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Chi tiết tầng

```
GET /api/floors/:id
```

**Response:** `200` - Object tầng

**Lỗi:** `404` - Không tìm thấy

---

## Thêm tầng

```
POST /api/floors
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| buildingId | number | Yes | ID tòa nhà |
| floorNumber | number | Yes | Số tầng |
| elevation | number | No | Cao độ sàn tầng trong không gian 3D |
| model3dUrl | string | No | Model 3D riêng cho tầng |
| floorPlanWkt | string | No | WKT `POLYGON Z(...)` cho mặt bằng tầng |
| description | string | No | Mô tả |

**Response:** `201` - Object tầng đã tạo

---

## Cập nhật tầng

```
PUT /api/floors/:id
```

**Body:** Các field cần cập nhật

**Response:** `200` - Object tầng đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa tầng

```
DELETE /api/floors/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa tầng" }
```

**Lỗi:** `404` - Không tìm thấy
