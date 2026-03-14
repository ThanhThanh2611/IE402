# Đăng nhập

> Hệ thống **không có chức năng tự đăng ký**. Tài khoản do Manager tạo tại trang Quản lý người dùng (`/users`).

## Trang đăng nhập (`/login`)

- Layout riêng (không có sidebar)
- Căn giữa màn hình, Card nền `bg-card`

### Form đăng nhập

| Trường | Kiểu | Bắt buộc |
|---|---|---|
| Tên đăng nhập | Input text (`username`) | Có |
| Mật khẩu | Input password (`password`) | Có |

- **API**: `POST /api/auth/login`
- Body: `{ "username": "...", "password": "..." }`
- Thành công → lưu thông tin user (và token nếu có) → redirect về `/`
- Lỗi `401` → hiện: "Tên đăng nhập hoặc mật khẩu không đúng"
- Lỗi `403` → hiện: "Tài khoản đã bị vô hiệu hóa"

---

## Quản lý state đăng nhập

- Lưu thông tin user đang đăng nhập (id, username, fullName, role, isActive)
- Gợi ý dùng React Context hoặc Zustand
- Kiểm tra đăng nhập khi vào mỗi trang (trừ `/login`)
- Nếu chưa đăng nhập → redirect `/login`
- Nếu `isActive = false` → hiện thông báo "Tài khoản đã bị vô hiệu hóa" + logout
