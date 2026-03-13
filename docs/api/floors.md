# Floors API

Base URL: `/api/floors`

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
