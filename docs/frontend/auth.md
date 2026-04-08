# Xác thực và Phân quyền

> Hệ thống **không có chức năng tự đăng ký**. Tài khoản do Manager tạo tại trang Quản lý người dùng (`/users`).

## Trang đăng nhập (`/login`)

- Layout riêng, không có sidebar
- Form nằm giữa màn hình trong `Card`
- Dùng `zod` validate cơ bản cho `username` và `password`

### Form đăng nhập

| Trường | Kiểu | Bắt buộc |
|---|---|---|
| Tên đăng nhập | Input text (`username`) | Có |
| Mật khẩu | Input password (`password`) | Có |

### API

- **Endpoint**: `POST /api/auth/login`
- **Body**:

```json
{
  "username": "manager1",
  "password": "manager123"
}
```

- **Response thành công**:
  
```json
{
  "user": {
    "id": 1,
    "username": "manager1",
    "fullName": "Nguyen Van A",
    "email": "manager1@example.com",
    "role": "manager",
    "isActive": true
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

### Xử lý token hiện tại

- FE lưu `user`, `accessToken`, `refreshToken` vào `localStorage`
- `accessToken` được gắn vào `Authorization: Bearer ...`
- khi access token hết hạn, `api.ts` sẽ tự gọi `POST /api/auth/refresh`
- nếu refresh thành công, FE lưu lại cặp token mới và tiếp tục request cũ
- nếu refresh thất bại, FE xóa phiên cục bộ và chuyển về `/login`

### Logout

- FE gọi `POST /api/auth/logout` với `refreshToken`
- backend revoke session tương ứng
- sau đó FE xóa token cục bộ và chuyển về `/login`

### Xử lý lỗi

- `401`: hiển thị lỗi sai tài khoản hoặc token hết hạn
- `403`: hiển thị lỗi tài khoản bị vô hiệu hóa

## AuthContext

Frontend dùng `AuthProvider` để quản lý:

- `user`
- `accessToken`
- `refreshToken`
- `isAuthenticated`
- `isManager`
- `login()`
- `logout()`

## Route protection

- `ProtectedRoute`: chặn toàn bộ route trong app nếu chưa đăng nhập
- `ManagerRoute`: chỉ cho `role=manager` truy cập
- Route không khớp sẽ hiển thị trang `404`

## API client

`src/lib/api.ts` tự động:

- gắn header `Authorization: Bearer <accessToken>`
- parse lỗi backend dưới dạng `ApiError`
- tự refresh access token nếu gặp `401`
- chỉ redirect về `/login` khi refresh thất bại

## Error handling liên quan tới auth

- FE hiện có `AppErrorBoundary` bao ngoài app để tránh lỗi render phá vỡ toàn bộ trải nghiệm
- Khi session hết hạn và refresh thất bại, người dùng sẽ được đưa về `/login`
- Khi route không tồn tại, hệ thống hiển thị trang `404` thay vì redirect âm thầm
