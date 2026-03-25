# Bản đồ GIS và Mô hình 3D

Use Cases: UC01-09

## 1. Trang bản đồ GIS (`/map`)

### Mô tả
Trang chính của ứng dụng. Hiển thị bản đồ thành phố với vị trí các tòa nhà dưới dạng marker/icon. Người dùng có thể lọc, xem tỷ lệ lấp đầy, và chọn tòa nhà.

### Trạng thái hiện tại
- Đã triển khai xong UC01-05 trên frontend.
- Đã triển khai thêm timeline snapshot map (liên kết UC25) và tìm tòa nhà lân cận theo GPS.

### UC01 — Hiển thị bản đồ thành phố
- Khi vào trang, load bản đồ nền (tile map)
- Gợi ý dùng thư viện: Mapbox GL JS, Leaflet, hoặc MapLibre GL JS

### UC02 — Hiển thị vị trí tòa nhà
- **API**: `GET /api/buildings/geojson`
- Response trả về GeoJSON FeatureCollection
- Mỗi tòa nhà là 1 Feature với `geometry.coordinates` (lng, lat)
- Render marker trên bản đồ cho mỗi tòa nhà
- Khi hover marker → hiển thị tooltip với tên tòa nhà

### UC03 — Lọc tòa nhà
- **API**: `GET /api/buildings?district=...&city=...&ward=...&minPrice=...&maxPrice=...`
- Panel lọc bên cạnh bản đồ hoặc dạng dropdown overlay
- Các trường lọc:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `district` | Select | Quận/Huyện |
| `city` | Select | Thành phố |
| `ward` | Select | Phường/Xã |
| `minPrice` | Input number | Giá thuê tối thiểu (VND) |
| `maxPrice` | Input number | Giá thuê tối đa (VND) |

- Sau khi lọc → cập nhật marker trên bản đồ chỉ hiện tòa nhà thỏa điều kiện

### UC04 — Xem tỷ lệ lấp đầy
- **API**: `GET /api/buildings/:id/occupancy`
- Hiển thị trên marker hoặc popup khi click tòa nhà
- Response:
  - `totalApartments`: tổng số căn hộ
  - `rentedApartments`: số căn đã thuê
  - `occupancyRate`: tỷ lệ % lấp đầy
- Gợi ý UI: thanh progress bar hoặc badge phần trăm trên marker

### UC05 — Chọn tòa nhà
- Click marker tòa nhà → hiện popup thông tin cơ bản
- Popup gồm: tên, địa chỉ, số tầng, tỷ lệ lấp đầy
- Nút "Xem chi tiết" → navigate đến `/buildings/:id`

### Tìm tòa nhà lân cận
- **API**: `GET /api/buildings/nearby?lat=...&lng=...&radius=...`
- Radius tính bằng mét
- Có thể dùng khi user click vào 1 điểm trên bản đồ → tìm tòa nhà gần đó

### Timeline tỷ lệ lấp đầy theo thời gian (liên kết UC25)
- **API timeline**: `GET /api/dashboard/occupancy-history`
- **API snapshot**: `GET /api/dashboard/map-snapshot?date=YYYY-MM-DD`
- Có thanh timeline ở dưới bản đồ để chọn mốc thời gian
- Khi kéo timeline, marker trên bản đồ cập nhật theo tỷ lệ lấp đầy tại mốc đó
- Tooltip/Popup hiển thị occupancy tương ứng với thời điểm đã chọn

---

## 2. Trang chi tiết tòa nhà (`/buildings/:id`)

### Mô tả
Hiển thị thông tin chi tiết tòa nhà kèm mô hình 3D. Người dùng có thể duyệt tầng, xem căn hộ.

### Trạng thái hiện tại
- Chưa triển khai phần 3D thực tế trên frontend (đang ở trạng thái placeholder).

### UC06 — Mô hình 3D tòa nhà
- **API**: `GET /api/buildings/:id` → lấy `model3dUrl` (file .glb/.gltf)
- Render mô hình 3D bằng thư viện Three.js hoặc React Three Fiber
- Nếu không có mô hình 3D → hiển thị ảnh tòa nhà (`imageUrl`) hoặc placeholder

### UC07 — Xem danh sách tầng
- **API**: `GET /api/floors?buildingId=:id`
- Hiển thị danh sách tầng dạng list bên cạnh mô hình 3D
- Click tầng → highlight tầng đó trên mô hình + load danh sách căn hộ

### UC08 — Xem căn hộ trong tầng
- **API**: `GET /api/apartments?floorId=:floorId`
- Hiển thị grid/list các căn hộ của tầng đang chọn
- Mỗi căn hộ hiện: mã căn hộ, diện tích, giá thuê, trạng thái (badge màu)
- Màu badge trạng thái:

| Trạng thái | Label | Màu gợi ý |
|---|---|---|
| `available` | Còn trống | Xanh lá |
| `rented` | Đã thuê | Đỏ / cam |
| `maintenance` | Bảo trì | Xám |

- Click căn hộ → navigate đến `/buildings/:id/apartments/:apartmentId`

### UC09 — Zoom / Rotate mô hình 3D
- Hỗ trợ thao tác:
  - Scroll → zoom in/out
  - Kéo chuột trái → xoay (rotate)
  - Kéo chuột phải → di chuyển (pan)
- Nút reset về góc nhìn mặc định

### Layout trang chi tiết tòa nhà

```
┌─────────────────────────────────────────────┐
│  ← Quay lại bản đồ    Tên tòa nhà          │
├──────────────────┬──────────────────────────┤
│                  │                          │
│  Danh sách tầng  │    Mô hình 3D tòa nhà   │
│  (sidebar)       │    (vùng render chính)   │
│                  │                          │
│  Tầng 10         │                          │
│  Tầng 9          │                          │
│  Tầng 8 ●        │                          │
│  ...             │                          │
│                  │                          │
├──────────────────┴──────────────────────────┤
│  Căn hộ tầng 8                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │8A  │ │8B  │ │8C  │ │8D  │               │
│  │45m²│ │52m²│ │38m²│ │60m²│               │
│  │Trống│ │Thuê│ │Trống│ │Bảo │               │
│  └────┘ └────┘ └────┘ └────┘               │
└─────────────────────────────────────────────┘
```
