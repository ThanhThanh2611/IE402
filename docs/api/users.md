# Users API

Base URL: `/api/users`

---

> Tất cả route trong tài liệu này yêu cầu `Manager`.

## Danh sách người dùng (UC26)

```
GET /api/users
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "username": "admin",
    "fullName": "Nguyen Van A",
    "email": "admin@example.com",
    "role": "manager",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Chi tiết người dùng

```
GET /api/users/:id
```

**Response:** `200` - Object người dùng

**Lỗi:** `404` - Không tìm thấy

---

## Thêm người dùng (UC27)

```
POST /api/users
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| username | string | Yes | Tên đăng nhập (unique) |
| password | string | Yes | Mật khẩu |
| fullName | string | Yes | Họ tên |
| email | string | No | Email (unique) |
| role | string | No | Vai trò: `user` (default), `manager` |

**Response:** `201` - Object người dùng đã tạo

**Lỗi:** `400` - Username đã tồn tại

---

## Cập nhật thông tin người dùng (UC28)

```
PUT /api/users/:id
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| username | string | No | Tên đăng nhập |
| fullName | string | No | Họ tên |
| email | string | No | Email |
| role | string | No | Vai trò |

**Response:** `200` - Object người dùng đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa người dùng (UC29)

```
DELETE /api/users/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa người dùng" }
```

**Lỗi:** `404` - Không tìm thấy

---

## Kích hoạt tài khoản (UC30)

```
PATCH /api/users/:id/activate
```

**Response:** `200` - Object người dùng với `isActive: true`

**Lỗi:** `404` - Không tìm thấy

---

## Vô hiệu hóa tài khoản (UC31)

```
PATCH /api/users/:id/deactivate
```

**Response:** `200` - Object người dùng với `isActive: false`

**Lỗi:** `404` - Không tìm thấy

> Ghi chú:
> - Xóa người dùng là **soft delete** (`deleted_at`)
> - API không trả về trường `password`
