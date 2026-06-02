# Furniture Layout Templates API

Base URL: `/api/furniture-layout-templates`

> Template layout là bản thiết kế nội thất dùng chung cho cả tòa nhà.
> Manager tạo template từ một layout mẫu (`sourceLayoutId`), sau đó bất kỳ user nào cũng có thể áp dụng template đó sang căn hộ của mình.
> Template không dùng soft delete — xóa là xóa thật.

---

## Danh sách template theo tòa nhà

```
GET /api/furniture-layout-templates/building/:buildingId
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "name": "Thiết kế 2 phòng ngủ cơ bản",
    "description": "Bố cục tiêu chuẩn cho căn 2PN diện tích 65–75m²",
    "isPublished": true,
    "sourceLayoutId": 3,
    "createdById": 2,
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z",
    "createdBy": {
      "id": 2,
      "fullName": "Nguyễn Văn Manager",
      "username": "manager01"
    }
  }
]
```

---

## Chi tiết template

```
GET /api/furniture-layout-templates/:id
```

**Response:** `200` - Object template

**Lỗi:** `404` - Không tìm thấy

---

## Tạo template

```
POST /api/furniture-layout-templates
```

> Tạo xong sẽ tự publish `sourceLayoutId` (set `status = 'published'` trên `furniture_layouts`).

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| buildingId | number | Yes | Tòa nhà sở hữu template |
| name | string | Yes | Tên template |
| description | string | No | Mô tả ngắn |
| sourceLayoutId | number | No | ID layout nguồn chứa danh sách items mẫu |

**Response:** `201` - Object template đã tạo

**Lỗi:** `400` - Thiếu `buildingId` hoặc `name`, `404` - Tòa nhà không tồn tại

---

## Cập nhật template

```
PUT /api/furniture-layout-templates/:id
```

> Chỉ `Manager`.

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| name | string | No | Tên mới |
| description | string | No | Mô tả mới |
| isPublished | boolean | No | Ẩn/hiện template |

**Response:** `200` - Object template đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa template

```
DELETE /api/furniture-layout-templates/:id
```

> Chỉ `Manager` hoặc user tạo ra template.
> Xóa xong sẽ tự revert `sourceLayoutId` về `status = 'draft'` trên `furniture_layouts`.

**Response:** `204` - Không có body

**Lỗi:** `403` - Không có quyền, `404` - Không tìm thấy

---

## Áp dụng template vào căn hộ

```
POST /api/furniture-layout-templates/:templateId/apply
```

> Mọi user đã đăng nhập đều có thể dùng.

Clone toàn bộ `furniture_items` từ layout nguồn của template sang một layout mới thuộc căn hộ chỉ định. Layout mới được tạo với `status = 'draft'`.

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| apartmentId | number | Yes | Căn hộ nhận layout mới |
| layoutName | string | Yes | Tên của layout mới được tạo |

**Response:** `201` - Object layout mới (chưa bao gồm items)

```json
{
  "id": 42,
  "apartmentId": 7,
  "name": "Layout từ template cơ bản",
  "status": "draft",
  "version": 1,
  "createdById": 5,
  "createdAt": "2026-06-02T10:30:00.000Z",
  "updatedAt": "2026-06-02T10:30:00.000Z"
}
```

**Lỗi:**
- `400` - Thiếu `apartmentId` hoặc `layoutName`
- `400` - Template chưa có `sourceLayoutId`
- `404` - Template không tồn tại

---

## Luồng sử dụng điển hình

```
Manager tạo layout mẫu cho căn hộ A
    → POST /api/apartments/:id/layouts        → layout draft
    → Thêm items vào layout                  → POST .../items
    → POST /api/furniture-layout-templates   → template được tạo,
                                               layout nguồn auto publish

User xem danh sách template của tòa nhà
    → GET /api/furniture-layout-templates/building/:buildingId

User áp dụng template vào căn hộ của mình
    → POST /api/furniture-layout-templates/:id/apply
    → Nhận về layout draft, tiếp tục chỉnh sửa
```
