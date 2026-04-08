# Bản đồ GIS và Mô hình 3D

Use Cases: UC01-09

## 1. Trang bản đồ GIS (`/map`)

### Mô tả
Trang chính của ứng dụng. Hiển thị bản đồ thành phố với vị trí các tòa nhà dưới dạng marker/icon. Người dùng có thể lọc, xem tỷ lệ lấp đầy, và chọn tòa nhà.

### Trạng thái hiện tại
- Đã triển khai xong UC01-05 trên frontend.
- Đã triển khai thêm timeline snapshot map (liên kết UC25) và tìm tòa nhà lân cận theo GPS.
- FE dùng `Leaflet` + `react-leaflet`.

### UC01 — Hiển thị bản đồ thành phố
- Khi vào trang, load bản đồ nền (tile map)
- Gợi ý dùng thư viện: Mapbox GL JS, Leaflet, hoặc MapLibre GL JS

### UC02 — Hiển thị vị trí tòa nhà
- **API**: `GET /api/buildings/geojson`
- Response trả về GeoJSON FeatureCollection
- Mỗi tòa nhà có thể là:
  - `Point` nếu backend chỉ có centroid
  - `Polygon` nếu backend có `footprint`
- FE hiện lấy tâm hiển thị từ:
  - `geometry.coordinates` nếu là `Point`
  - `properties.center` hoặc centroid tính từ polygon nếu là `Polygon`
- Render `CircleMarker` trên bản đồ cho mỗi tòa nhà
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
- Snapshot map hiện vẫn dùng dữ liệu điểm (`Point`) từ backend

---

## 2. Trang chi tiết tòa nhà (`/buildings/:id`)

### Mô tả
Hiển thị thông tin chi tiết tòa nhà kèm mô hình 3D. Người dùng có thể duyệt tầng, xem căn hộ.

### Trạng thái hiện tại
- Đã triển khai mô hình 3D bằng `@react-three/fiber` + `@react-three/drei`.
- Có upload model `.glb/.gltf`, reset camera, bật/tắt tầng, click mesh căn hộ để mở popup.
- Đã bổ sung 2 mode xem:
  - `3D tổng quan` cho exterior / toàn bộ tòa nhà
  - `Mặt sàn theo tầng` cho indoor floor model + hotspot

### UC06 — Mô hình 3D tòa nhà
- **API**: `GET /api/buildings/:id` → lấy `model3dUrl` (file .glb/.gltf)
- Render mô hình 3D bằng thư viện Three.js hoặc React Three Fiber
- Nếu không có mô hình 3D → hiển thị ảnh tòa nhà (`imageUrl`) hoặc placeholder
- Upload model dùng `POST /api/buildings/:id/model`

### UC07 — Xem danh sách tầng
- **API**: `GET /api/floors?buildingId=:id`
- Hiển thị danh sách tầng dạng list bên cạnh mô hình 3D
- Click tầng → chuyển sang floor mode, load model 3D riêng của tầng nếu `floors.model3dUrl` có dữ liệu
- FE vẫn giữ danh sách căn hộ của tầng và hotspot indoor cho `door`, `elevator`, `stairs`
- Với `Manager`, trang còn có ô `Upload model tầng` để gán trực tiếp model 3D riêng cho tầng đang chọn qua `POST /api/floors/:id/model`

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
- Click mesh trong model 3D → FE gọi `GET /api/apartments/:apartmentId/details` để hiện popup
- Trong floor mode, FE còn có thể:
  - click hotspot `door` → mở popup căn hộ hoặc vào trang căn hộ
  - click hotspot `elevator` / `stairs` → hiện danh sách tầng đích để chuyển nhanh

### UC09 — Zoom / Rotate mô hình 3D
- Hỗ trợ thao tác:
  - Scroll → zoom in/out
  - Kéo chuột trái → xoay (rotate)
  - Kéo chuột phải → di chuyển (pan)
- Nút reset về góc nhìn mặc định
- FE dùng `OrbitControls`

### Hotspot indoor theo tầng

- **API**: `GET /api/navigation/graph/:buildingId`
- FE lấy:
  - `localX`, `localY`, `localZ`
  - `meshRef`
  - `apartmentId`, `apartmentCode`
- Các hotspot được render nổi trực tiếp trên model tầng:
  - `door`: cửa căn hộ/phòng
  - `elevator`: thang máy
  - `stairs`: cầu thang
- Với `Manager`, trang chi tiết tòa nhà hiện có thể sửa trực tiếp:
  - tạo hotspot mới
  - chọn `node type`
  - `localX`
  - `localY`
  - `localZ`
  - `lng`
  - `lat`
  - `z`
  - `meshRef`
  - `metadata`
  cho từng hotspot của tầng đang chọn
- Nếu chưa có `floors.model3dUrl`, FE vẫn có thể vào floor mode bằng scene lưới thử nghiệm để test hotspot và đổi tầng

### Nút xem 3D tổng quan

- Trên trang chi tiết tòa nhà hiện có nút `3D tổng quan`
- Dùng để quay lại góc nhìn exterior / toàn bộ building model sau khi đang xem từng tầng
- Upload model `tòa nhà` và upload model `tầng` là hai luồng riêng:
  - `POST /api/buildings/:id/model` → dùng cho `3D tổng quan`
  - `POST /api/floors/:id/model` → dùng cho `Mặt sàn theo tầng`

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

## Ghi chú kỹ thuật

- FE hiện không render trực tiếp polygon footprint của building detail trong trang 3D; footprint chủ yếu phục vụ map/type model
- Popup căn hộ trong trang tòa nhà không còn tự gọi `/contracts` và `/tenants`, mà dùng trực tiếp payload tổng hợp từ `/apartments/:id/details`
- Hướng dẫn thao tác đầy đủ cho luồng model tầng + hotspot local xem thêm tại [floor-model-hotspot-workflow.md](D:\Workspace\IE402\docs\frontend\floor-model-hotspot-workflow.md)
