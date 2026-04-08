# Tenants API

Base URL: `/api/tenants`

> Tất cả route yêu cầu `Manager`.
> Bảng tenant dùng **soft delete**.

---

## Danh sách người thuê

```
GET /api/tenants
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "fullName": "Tran Van B",
    "phone": "0901234567",
    "email": "tranvanb@example.com",
    "idCard": "079123456789",
    "address": "123 Nguyen Trai, Q5, HCM",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Chi tiết người thuê (UC13)

```
GET /api/tenants/:id
```

**Response:** `200` - Object người thuê

**Lỗi:** `404` - Không tìm thấy

---

## Thêm người thuê

```
POST /api/tenants
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| fullName | string | Yes | Họ tên |
| linkedUserId | number | No | Liên kết tới `users.id` nếu tenant có account |
| phone | string | Yes | Số điện thoại |
| email | string | No | Email |
| idCard | string | Yes | CCCD/CMND (unique) |
| address | string | No | Địa chỉ thường trú |

**Response:** `201` - Object người thuê đã tạo

---

## Cập nhật người thuê

```
PUT /api/tenants/:id
```

**Body:** Các field cần cập nhật

**Response:** `200` - Object người thuê đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa người thuê

```
DELETE /api/tenants/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa người thuê" }
```

**Lỗi:** `404` - Không tìm thấy
