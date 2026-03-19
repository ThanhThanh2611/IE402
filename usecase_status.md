# Tình Trạng Triển Khai Use Cases

> Cập nhật: 2026-03-19

## Tổng quan

| Nhóm | Tổng UC | BE hoàn thành | FE hoàn thành | Ghi chú |
|------|---------|---------------|---------------|---------|
| Bản đồ GIS (UC01-05) | 5 | 5/5 | 0/5 | FE đang Coming Soon, chưa tích hợp Mapbox/Leaflet |
| Mô hình 3D (UC06-09) | 4 | 2/4 | 0/4 | FE đang Coming Soon, chưa tích hợp Three.js |
| Thông tin căn hộ (UC10-13) | 4 | 4/4 | 0/4 | FE chưa có trang chi tiết căn hộ cho User |
| Quản lý căn hộ (UC14-17) | 4 | 4/4 | 4/4 | ✅ Hoàn thành |
| Quản lý hợp đồng (UC18-21) | 4 | 4/4 | 4/4 | ✅ Hoàn thành |
| Dashboard & Thống kê (UC22-25) | 4 | 4/4 | 3/4 | Thiếu biểu đồ lịch sử lấp đầy |
| Quản lý người dùng (UC26-31) | 6 | 6/6 | 6/6 | ✅ Hoàn thành |

---

## Chi tiết từng Use Case

### 1. Nhóm chức năng Bản đồ GIS

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC01 | View City Map | 100% | 0% | **FE**: Chưa tích hợp thư viện bản đồ (Mapbox/Leaflet), trang `/map` đang hiển thị Coming Soon |
| UC02 | View Building Locations | 100% | 0% | **FE**: Chưa render marker tòa nhà trên bản đồ. BE đã có endpoint `/buildings/geojson` trả GeoJSON FeatureCollection |
| UC03 | Filter Buildings | 100% | 0% | **FE**: Chưa có UI lọc tòa nhà trên bản đồ. BE đã hỗ trợ filter theo `district`, `city`, `ward`, `minPrice`, `maxPrice` |
| UC04 | View Occupancy Rate | 100% | 0% | **FE**: Chưa hiển thị tỷ lệ lấp đầy trên bản đồ/popup. BE đã có endpoint `/buildings/:id/occupancy` |
| UC05 | Select Building | 100% | 0% | **FE**: Chưa có tương tác click tòa nhà trên bản đồ → xem chi tiết. BE đã có `/buildings/:id` |

### 2. Nhóm chức năng Mô hình 3D tòa nhà

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC06 | View 3D Building Model | 50% | 0% | **BE**: Schema có trường `model3dUrl` nhưng chưa có endpoint upload file `.glb/.gltf` (multer). **FE**: Chưa tích hợp Three.js/React Three Fiber, trang `/buildings/:id` đang Coming Soon |
| UC07 | View Floors | 100% | 0% | **FE**: Chưa có UI hiển thị danh sách tầng trong trang chi tiết tòa nhà. BE đã có `/floors?buildingId=` |
| UC08 | View Apartment Units | 100% | 0% | **FE**: Chưa có UI hiển thị căn hộ theo tầng trong context 3D. BE đã có `/apartments?floorId=` |
| UC09 | Zoom / Rotate 3D Model | N/A | 0% | **FE**: Thuần frontend, chưa triển khai vì chưa có 3D viewer |

### 3. Nhóm chức năng Thông tin căn hộ

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC10 | View Apartment Details | 100% | 0% | **FE**: Trang `/buildings/:id/apartments/:apartmentId` đang Coming Soon. Thông tin chi tiết chỉ hiển thị trong bảng quản lý (Manager), chưa có trang xem cho User |
| UC11 | View Apartment Status | 100% | 50% | **FE**: Trạng thái hiển thị trong trang quản lý căn hộ (Manager), nhưng chưa có trang xem trạng thái cho User thông thường |
| UC12 | View Rental Price | 100% | 50% | **FE**: Giá thuê hiển thị trong bảng quản lý, nhưng chưa có trang chi tiết cho User xem |
| UC13 | View Tenant Information | 100% | 50% | **FE**: Có trang quản lý người thuê riêng, nhưng chưa liên kết từ căn hộ → xem thông tin người thuê |

### 4. Nhóm chức năng Quản lý căn hộ

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC14 | Add Apartment | 100% | 100% | ✅ Hoàn thành — Dialog form với validation |
| UC15 | Update Apartment Information | 100% | 100% | ✅ Hoàn thành — Edit dialog pre-fill dữ liệu |
| UC16 | Delete Apartment | 100% | 100% | ✅ Hoàn thành — Soft delete với confirm dialog |
| UC17 | Update Apartment Status | 100% | 100% | ✅ Hoàn thành — Inline dropdown thay đổi trạng thái |

### 5. Nhóm chức năng Quản lý hợp đồng thuê

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC18 | Add Rental Contract | 100% | 100% | ✅ Hoàn thành — Tạo hợp đồng, auto set apartment status = `rented` |
| UC19 | Edit Rental Contract | 100% | 100% | ✅ Hoàn thành — Edit dialog, auto-fill rent từ apartment |
| UC20 | Delete Rental Contract | 100% | 100% | ✅ Hoàn thành — Soft delete, auto set apartment status = `available` |
| UC21 | View Contract Information | 100% | 100% | ✅ Hoàn thành — Hiển thị trong bảng danh sách |

### 6. Nhóm chức năng Dashboard & Thống kê

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC22 | View Dashboard | 100% | 100% | ✅ Hoàn thành — 4 stat cards + progress bar tỷ lệ lấp đầy |
| UC23 | View Occupancy Statistics | 100% | 100% | ✅ Hoàn thành — Bar chart tỷ lệ lấp đầy theo tòa nhà |
| UC24 | View Revenue Statistics | 100% | 100% | ✅ Hoàn thành — Line chart doanh thu theo tháng |
| UC25 | View Time Series Data | 100% | 70% | **FE**: Có line chart doanh thu theo tháng, nhưng chưa hiển thị biểu đồ lịch sử lấp đầy theo thời gian. BE đã có endpoint `/dashboard/occupancy-history` |

### 7. Nhóm chức năng Quản lý người dùng

| UC | Tên | BE (%) | FE (%) | Thiếu |
|----|-----|--------|--------|-------|
| UC26 | View User List | 100% | 100% | ✅ Hoàn thành — Bảng danh sách người dùng |
| UC27 | Add User | 100% | 100% | ✅ Hoàn thành — Dialog form, bcrypt hash password |
| UC28 | Update User Information | 100% | 100% | ✅ Hoàn thành — Edit dialog (không sửa password) |
| UC29 | Delete User | 100% | 100% | ✅ Hoàn thành — Soft delete với confirm |
| UC30 | Activate User | 100% | 100% | ✅ Hoàn thành — Toggle button kích hoạt |
| UC31 | Deactivate User | 100% | 100% | ✅ Hoàn thành — Toggle button vô hiệu hóa |

---

## Tóm tắt việc còn thiếu

### Frontend (ưu tiên cao)
1. **Tích hợp bản đồ GIS** — Cần Mapbox hoặc Leaflet để hiển thị bản đồ, marker tòa nhà, popup, filter (UC01-05)
2. **Tích hợp 3D viewer** — Cần Three.js hoặc React Three Fiber để load và hiển thị mô hình `.glb/.gltf` (UC06-09)
3. **Trang chi tiết căn hộ cho User** — Trang `/buildings/:id/apartments/:apartmentId` cần hiển thị thông tin, trạng thái, giá, người thuê (UC10-13)
4. **Biểu đồ lịch sử lấp đầy** — Thêm chart sử dụng endpoint `/dashboard/occupancy-history` (UC25)

### Backend (ưu tiên thấp)
1. **File upload endpoint** — Cần endpoint upload mô hình 3D `.glb/.gltf` bằng multer (UC06)

### Thống kê tiến độ tổng thể
- **Backend**: 29/31 UC = **93%**
- **Frontend**: 18/31 UC hoàn thành + 3 UC 50% + 1 UC 70% = khoảng **65%**
- **Tổng thể hệ thống**: khoảng **79%**
