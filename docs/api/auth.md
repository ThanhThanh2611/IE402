# Auth API

Base URL: `/api/auth`

---

## Đăng ký

```
POST /api/auth/register
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| username | string | Yes | Tên đăng nhập |
| password | string | Yes | Mật khẩu |
| fullName | string | Yes | Họ tên |
| email | string | No | Email |
| role | string | No | `user` (mặc định) hoặc `manager` |

**Response:** `201`

```json
{
  "id": 1,
  "username": "admin",
  "fullName": "Nguyen Van A",
  "email": "admin@example.com",
  "role": "manager"
}
```

**Lỗi:**

- `400` - Username đã tồn tại

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
  "role": "manager"
}
```

**Lỗi:**

- `401` - Sai username hoặc password

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
