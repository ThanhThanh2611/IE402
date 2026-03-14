# Auth API

Base URL: `/api/auth`

> **Lưu ý:** Hệ thống không hỗ trợ tự đăng ký. Tài khoản phải do Manager tạo thông qua API `/api/users` (xem [users.md](./users.md)).

---

## Đăng nhập

```
POST /api/auth/login
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| username | string | Yes | Tên đăng nhập |
| password | string | Yes | Mật khẩu |

**Response:** `200`

```json
{
  "id": 1,
  "username": "admin",
  "fullName": "Nguyen Van A",
  "email": "admin@example.com",
  "role": "manager",
  "isActive": true
}
```

**Lỗi:**

- `401` - Sai username hoặc password
- `403` - Tài khoản đã bị vô hiệu hóa

---

## Danh sách users

```
GET /api/auth/users
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
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```
