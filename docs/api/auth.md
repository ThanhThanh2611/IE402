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
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Nguyen Van A",
    "email": "admin@example.com",
    "role": "manager",
    "isActive": true
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

**Lỗi:**

- `401` - Sai username hoặc password
- `403` - Tài khoản đã bị vô hiệu hóa

---

## Refresh Token

```
POST /api/auth/refresh
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| refreshToken | string | Yes | Refresh token hiện tại |

**Response:** `200`

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Nguyen Van A",
    "email": "admin@example.com",
    "role": "manager",
    "isActive": true
  },
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

**Lỗi:**

- `401` - Refresh token không hợp lệ hoặc đã hết hạn
- `403` - Tài khoản đã bị vô hiệu hóa

---

## Đăng xuất

```
POST /api/auth/logout
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| refreshToken | string | No | Refresh token hiện tại để revoke session |

**Response:** `200`

```json
{
  "message": "Đăng xuất thành công"
}
```

## Ghi chú triển khai

- Backend hiện dùng mô hình `access token + refresh token`
- Refresh token được rotate khi gọi `POST /api/auth/refresh`
- Logout thực hiện revoke session phía backend thay vì chỉ xóa token ở frontend
