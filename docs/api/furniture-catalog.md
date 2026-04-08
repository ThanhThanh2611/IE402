# Furniture Catalog API

Base URL: `/api/furniture-catalog`

> API quản lý danh mục nội thất dùng cho chức năng kéo-thả trong không gian LoD4.
> Tất cả route yêu cầu đăng nhập. `POST/PUT/DELETE` chỉ dành cho `Manager`.

---

## Danh sách mẫu nội thất

```http
GET /api/furniture-catalog
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "code": "SOFA-01",
    "name": "Sofa chữ I",
    "category": "sofa",
    "model3dUrl": "/uploads/furniture/sofa-01.glb",
    "defaultWidth": "2.20",
    "defaultDepth": "0.90",
    "defaultHeight": "0.85",
    "metadata": { "color": "gray" },
    "isActive": true,
    "createdAt": "2026-04-06T10:00:00.000Z",
    "updatedAt": "2026-04-06T10:00:00.000Z"
  }
]
```

> `GET` hiện trả toàn bộ catalog, không tự lọc theo `isActive`.

---

## Thêm mẫu nội thất

```http
POST /api/furniture-catalog
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| code | string | Yes | Mã nội thất, unique |
| name | string | Yes | Tên hiển thị |
| category | string | Yes | `sofa`, `table`, `chair`, `bed`, `cabinet`, `appliance`, `decor`, `other` |
| model3dUrl | string | Yes | URL model 3D |
| defaultWidth | string \| null | No | Kích thước mặc định |
| defaultDepth | string \| null | No | Kích thước mặc định |
| defaultHeight | string \| null | No | Kích thước mặc định |
| metadata | object \| null | No | Thuộc tính mở rộng |
| isActive | boolean | No | Mặc định `true` |

**Response:** `201` - Object vừa tạo

---

## Cập nhật mẫu nội thất

```http
PUT /api/furniture-catalog/:id
```

**Body:** tương tự `POST`

**Response:** `200` - Object đã cập nhật

**Lỗi:** `404` - Không tìm thấy mẫu nội thất

---

## Xóa mẫu nội thất

```http
DELETE /api/furniture-catalog/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa mẫu nội thất" }
```
