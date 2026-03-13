# Buildings API

Base URL: `/api/buildings`

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
GET /api/buildings?minPrice=5000000&maxPrice=15000000
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "name": "Vinhomes Central Park",
    "address": "208 Nguyen Huu Canh",
    "ward": "22",
    "district": "Binh Thanh",
    "city": "Ho Chi Minh",
    "latitude": "10.7942000",
    "longitude": "106.7214000",
    "totalFloors": 10,
    "description": null,
    "imageUrl": null,
    "model3dUrl": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Tìm tòa nhà gần vị trí (GIS)

```
GET /api/buildings/nearby
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| lat | number | Yes | Vĩ độ |
| lng | number | Yes | Kinh độ |
| radius | number | No | Bán kính tìm kiếm (km), mặc định 5 |

**Ví dụ:**

```
GET /api/buildings/nearby?lat=10.79&lng=106.72&radius=3
```

**Response:** `200`

```json
[
  {
    "building": { ... },
    "distance": 1.23
  }
]
```

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
| latitude | number | Yes | Vĩ độ |
| longitude | number | Yes | Kinh độ |
| totalFloors | number | Yes | Tổng số tầng |
| description | string | No | Mô tả |
| imageUrl | string | No | URL hình ảnh |
| model3dUrl | string | No | URL mô hình 3D |

**Response:** `201` - Object tòa nhà đã tạo

---

## Cập nhật tòa nhà

```
PUT /api/buildings/:id
```

**Body:** Các field cần cập nhật (tương tự POST)

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
