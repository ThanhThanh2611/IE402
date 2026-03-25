# Tình hình dự án — 3D GIS Apartment Management System

> Cập nhật lần cuối: 24/03/2026

## Tổng quan tiến độ

| Hạng mục | Trạng thái | Tiến độ |
|----------|-----------|---------|
| Backend API | ✅ Hoàn thành | 100% |
| Frontend — Trang quản lý | ✅ Hoàn thành | 100% |
| Xác thực & Phân quyền | ✅ Hoàn thành | 100% |
| Bản đồ GIS (2D) | ✅ Hoàn thành | 100% |
| Mô hình 3D tòa nhà | 🟡 Đang triển khai | 70% |
| Hoàn thiện & Tối ưu | 🔲 Chưa bắt đầu | 0% |

**Tiến độ tổng thể: ~82%** — Đã hoàn thành nền tảng, API, giao diện quản lý, bản đồ GIS 2D, và đã nối xong luồng 3D chính (render model, xoay/zoom, click căn hộ hiển thị popup).

---

## Đã hoàn thành

### Backend (API Server)
- 10 nhóm API: auth, buildings, floors, apartments, contracts, tenants, payments, users, dashboard, status-history
- Database PostgreSQL + PostGIS với dữ liệu mẫu (5 tòa nhà TP.HCM, 24 căn hộ, 12 người thuê, hợp đồng, thanh toán)
- Xác thực JWT + phân quyền theo vai trò (User / Manager)
- Mật khẩu mã hóa bcrypt
- Soft delete cho 5 bảng chính

### Frontend — Giao diện quản lý
| Trang | Chức năng | Vai trò |
|-------|-----------|---------|
| Đăng nhập | Form đăng nhập, validation, lưu token | Tất cả |
| Dashboard | 4 thẻ thống kê, biểu đồ tỷ lệ lấp đầy, biểu đồ doanh thu | User + Manager |
| Quản lý căn hộ | Xem/Thêm/Sửa/Xóa, lọc theo tòa nhà & tầng, đổi trạng thái | Manager |
| Quản lý hợp đồng | Xem/Thêm/Sửa/Xóa, tự điền tiền thuê theo căn hộ | Manager |
| Quản lý người thuê | Xem/Thêm/Sửa/Xóa, validation SĐT & CCCD | Manager |
| Quản lý thanh toán | Xem/Thêm/Sửa/Xóa, tự điền số tiền theo hợp đồng | Manager |
| Quản lý người dùng | Xem/Thêm/Sửa/Xóa, kích hoạt/vô hiệu hóa tài khoản | Manager |

### Frontend — GIS/3D (mới cập nhật)
- Trang `/buildings/:id` đã render mô hình 3D bằng React Three Fiber + Three.js
- Hỗ trợ thao tác xoay/zoom/pan camera và nút reset góc nhìn
- Có UI bật/tắt tầng để nhìn xuyên (phụ thuộc metadata tầng trong file model)
- Bắt sự kiện click mesh căn hộ theo ID/mã phòng để gọi API và hiển thị popup (diện tích, giá thuê, hợp đồng)
- Có luồng upload model `.glb/.gltf` từ frontend lên endpoint `/api/buildings/:id/model`

### Tài liệu
- README hướng dẫn cài đặt & chạy dự án
- API documentation (`docs/api/`)
- Phân tích nghiệp vụ (`docs/BA.md`)
- Hướng dẫn sử dụng theo vai trò (`docs/user-guide/`)
- Quy trình Git (`docs/git-workflow.md`)

---

## Chưa làm — Theo thứ tự ưu tiên

### 🟢 Đã hoàn thành — Bản đồ GIS (Phase 2)

| # | Đầu việc | Trạng thái | Liên quan |
|---|----------|-----------|-----------|
| 1 | Bản đồ 2D (Leaflet) + marker + popup + lọc | ✅ Hoàn thành | UC01–UC05 |
| 2 | Hiển thị tỷ lệ lấp đầy trên bản đồ + timeline snapshot | ✅ Hoàn thành | UC04, UC25 |
| 3 | Tìm tòa nhà gần vị trí (GPS + radius) | ✅ Hoàn thành | API `/buildings/nearby` |

### 🔴 Ưu tiên cao — Mô hình 3D tòa nhà (Phase 2)

| # | Đầu việc | Mô tả | Liên quan |
|---|----------|-------|-----------|
| 4 | ✅ Hiển thị 3D tòa nhà | Three.js / React Three Fiber, hiển thị mô hình tòa nhà, xoay/zoom | UC06–UC09 |
| 5 | ✅ Xem tầng & căn hộ trong 3D | Click tầng → lọc danh sách căn hộ, click căn hộ → popup thông tin | UC07–UC08 |
| 6 | ✅ BE: Upload mô hình 3D | API upload file `.glb/.gltf` cho từng tòa nhà | Cần cho #4 |

### 🟡 Ưu tiên trung bình — Hoàn thiện (Phase 3)

| # | Đầu việc | Mô tả |
|---|----------|-------|
| 7 | Error boundaries + trang 404 | Xử lý lỗi FE graceful, hiển thị trang 404 cho route không tồn tại |
| 8 | Responsive design | Tinh chỉnh giao diện cho tablet/mobile |

### ⚪ Ưu tiên thấp — Nice to have

| # | Đầu việc | Mô tả |
|---|----------|-------|
| 9 | Dark mode | Hỗ trợ chế độ tối |
| 10 | Performance | Lazy loading, code splitting cho các trang |
| 11 | E2E testing | Kiểm thử end-to-end |

---

## Rủi ro & Lưu ý

| Rủi ro | Mức độ | Ghi chú |
|--------|--------|---------|
| Phần GIS/3D vẫn là trọng tâm môn học | 🟡 Trung bình | Cần hoàn thiện trang chi tiết căn hộ riêng (`/buildings/:id/apartments/:apartmentId`) |
| Chưa xác nhận giảng viên về việc dùng PostGIS | 🟡 Trung bình | Đang chờ phản hồi |
| Chất lượng metadata trong model 3D không đồng nhất | 🟡 Trung bình | Cần team đồ họa thống nhất naming/userData cho tầng và ID phòng để click chính xác |

---

## Tài khoản kiểm thử

| Username | Password | Vai trò | Ghi chú |
|----------|----------|---------|---------|
| `manager1` | `manager123` | Manager | Toàn quyền |
| `manager2` | `manager123` | Manager | Toàn quyền |
| `user1` | `user123` | User | Chỉ xem |
| `user2` | `user123` | User | Chỉ xem |
| `user3` | `user123` | User | Bị vô hiệu hóa |

---

## Hướng dẫn chạy dự án

```bash
# 1. Database
docker compose up -d

# 2. Backend (terminal riêng)
cd backend && cp .env.example .env && npm install && npm run db:push && npm run db:seed && npm run dev

# 3. Frontend (terminal riêng)
cd frontend && npm install && npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
