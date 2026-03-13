# Buildings API

Base URL: `/api/buildings`

> Tọa độ được lưu dạng PostGIS `geometry(Point, 4326)`. Khi tạo/cập nhật tòa nhà, truyền `longitude` và `latitude` trong body.

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

**Response:** `200` - Mảng tòa nhà (location trả về dạng GeoJSON Point)

---

## Danh sách tòa nhà dạng GeoJSON

```
GET /api/buildings/geojson
```

Trả về chuẩn GeoJSON `FeatureCollection`, FE (Leaflet/Mapbox) dùng trực tiếp.

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

> `longitude` và `latitude` được chuyển thành PostGIS Point bằng `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`

**Response:** `201` - Object tòa nhà đã tạo

---

## Cập nhật tòa nhà

```
PUT /api/buildings/:id
```

**Body:** Các field cần cập nhật (nếu có longitude + latitude sẽ cập nhật geometry)

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
