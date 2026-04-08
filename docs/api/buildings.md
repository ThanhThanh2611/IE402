# Buildings API

Base URL: `/api/buildings`

> Tọa độ được lưu dạng PostGIS `geometry(PointZ, 4326)`. Khi tạo/cập nhật tòa nhà, truyền `longitude` và `latitude` trong body (z mặc định = 0).
> Có thể truyền thêm `footprintWkt` để lưu geometry chi tiết của tòa nhà dưới dạng `PolygonZ`.
> Tất cả route yêu cầu đăng nhập.

---

## Danh sách tòa nhà (có lọc)

```
GET /api/buildings
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| district | string | Lọc theo quận/huyện |
| city | string | Lọc theo thành phố |
| ward | string | Lọc theo phường/xã |
| minPrice | number | Giá thuê trung bình tối thiểu (VND) |
| maxPrice | number | Giá thuê trung bình tối đa (VND) |

**Ví dụ:**

```
GET /api/buildings?district=Binh Thanh&city=Ho Chi Minh
```

**Response:** `200` - Mảng tòa nhà kèm `lng`, `lat`, `z` và `footprintGeoJson` nếu có

---

## Danh sách tòa nhà dạng GeoJSON

```
GET /api/buildings/geojson
```

Trả về chuẩn GeoJSON `FeatureCollection`, FE (Leaflet/Mapbox) dùng trực tiếp.
Nếu tòa nhà có `footprint`, `geometry` sẽ là polygon; nếu chưa có sẽ fallback về point centroid.

**Query params:** Hỗ trợ filter `district`, `city`, `ward`

**Response:** `200`

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [106.7214, 10.7942]
      },
      "properties": {
        "id": 1,
        "name": "Vinhomes Central Park",
        "address": "208 Nguyen Huu Canh",
        "district": "Binh Thanh",
        "city": "Ho Chi Minh",
        "totalFloors": 10,
        "model3dUrl": "/uploads/models/building.glb"
      }
    }
  ]
}
```

> Tọa độ được trích xuất từ PostGIS bằng `ST_X()` và `ST_Y()`

---

## Tìm tòa nhà gần vị trí (PostGIS ST_DWithin)

```
GET /api/buildings/nearby
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| lat | number | Yes | Vĩ độ |
| lng | number | Yes | Kinh độ |
| radius | number | No | Bán kính tìm kiếm (mét), mặc định 5000 |

**Ví dụ:**

```
GET /api/buildings/nearby?lat=10.79&lng=106.72&radius=3000
```

**Response:** `200`

```json
[
  {
    "building": { ... },
    "distance": 1234.56
  }
]
```

> Sử dụng PostGIS `ST_DWithin` với `geography` cast để tính khoảng cách bằng mét. `ST_Distance` trả khoảng cách thực tế.

---

## Chi tiết tòa nhà

```
GET /api/buildings/:id
```

**Response:** `200` - Object tòa nhà

**Lỗi:** `404` - Không tìm thấy

---

## Tỷ lệ lấp đầy tòa nhà

```
GET /api/buildings/:id/occupancy
```

**Response:** `200`

```json
{
  "totalApartments": 50,
  "rentedApartments": 35,
  "occupancyRate": "70.0"
}
```

---

## Thêm tòa nhà

```
POST /api/buildings
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| name | string | Yes | Tên tòa nhà |
| address | string | Yes | Địa chỉ |
| ward | string | No | Phường/Xã |
| district | string | No | Quận/Huyện |
| city | string | No | Thành phố |
| longitude | number | Yes | Kinh độ |
| latitude | number | Yes | Vĩ độ |
| totalFloors | number | Yes | Tổng số tầng |
| description | string | No | Mô tả |
| imageUrl | string | No | URL hình ảnh |
| model3dUrl | string | No | URL mô hình 3D |
| footprintWkt | string | No | WKT `POLYGON Z(...)` mô tả footprint chi tiết |

> `longitude` và `latitude` được chuyển thành PostGIS Point bằng `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`

**Response:** `201` - Object tòa nhà đã tạo

---

## Cập nhật tòa nhà

```
PUT /api/buildings/:id
```

**Body:** Các field cần cập nhật (nếu có `longitude` + `latitude` sẽ cập nhật centroid, nếu có `footprintWkt` sẽ cập nhật geometry chi tiết)

**Response:** `200` - Object tòa nhà đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa tòa nhà

```
DELETE /api/buildings/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa tòa nhà" }
```

**Lỗi:** `404` - Không tìm thấy

---

## Upload mô hình 3D cho tòa nhà

```
POST /api/buildings/:id/model
```

Upload file mô hình 3D cho tòa nhà bằng `multipart/form-data`.

**Form-data:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| file | File | Yes | File mô hình `.glb` hoặc `.gltf` |

**Giới hạn:**
- Chỉ chấp nhận định dạng `.glb` / `.gltf`
- Kích thước tối đa: 150MB

**Response:** `200`

```json
{
  "message": "Upload mô hình 3D thành công!",
  "data": {
    "id": 1,
    "name": "Vinhomes Central Park",
    "model3dUrl": "/uploads/models/building-1-1774088091878.glb"
  }
}
```

**Lỗi thường gặp:**
- `400`: không có file đính kèm
- `400`: định dạng file không hợp lệ (`.glb` / `.gltf` only)
- `413`: file vượt quá giới hạn upload 150MB
- `404`: không tìm thấy tòa nhà
- `500`: lỗi upload hoặc lỗi hệ thống
