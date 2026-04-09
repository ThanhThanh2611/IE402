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

> Manager hiện đã có UI trực tiếp trên trang `/buildings/:id` để thêm tầng, không cần gọi API thủ công khi thao tác từ frontend.

---

## Cập nhật tầng

```
PUT /api/floors/:id
```

**Body:** Các field cần cập nhật

**Response:** `200` - Object tầng đã cập nhật

**Lỗi:** `404` - Không tìm thấy

> UI `/buildings/:id` đã có dialog sửa tầng với các field `floorNumber`, `elevation`, `floorPlanWkt`, `description`.

---

## Upload mô hình 3D riêng cho tầng

```
POST /api/floors/:id/model
```

Upload file mô hình 3D riêng cho một tầng bằng `multipart/form-data`.

**Quyền:** `Manager`

**Form-data:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| file | File | Yes | File mô hình `.glb` hoặc `.gltf` của tầng |

**Giới hạn:**
- Chỉ chấp nhận định dạng `.glb` / `.gltf`
- Kích thước tối đa: 70MB

**Response:** `200`

```json
{
  "message": "Upload mô hình 3D cho tầng thành công!",
  "data": {
    "id": 8,
    "buildingId": 2,
    "floorNumber": 5,
    "model3dUrl": "/uploads/models/floor-8-1775669999999.glb"
  }
}
```

**Lỗi thường gặp:**
- `400`: không có file đính kèm
- `400`: định dạng file không hợp lệ (`.glb` / `.gltf` only)
- `403`: chỉ Manager mới có quyền upload model tầng
- `404`: không tìm thấy tầng
- `413`: file vượt quá giới hạn upload 70MB

> Frontend hiện đã có ô upload riêng cho tầng đang chọn ngay trên trang `/buildings/:id`.

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

> Frontend hiện đã có nút xóa tầng ngay trong danh sách tầng ở trang chi tiết tòa nhà.
