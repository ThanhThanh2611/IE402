# Dashboard API

Base URL: `/api/dashboard`

> Tất cả route yêu cầu đăng nhập.

---

## Tổng quan (UC22)

```
GET /api/dashboard/overview
```

**Response:** `200`

```json
{
  "totalBuildings": 5,
  "totalApartments": 120,
  "rentedApartments": 85,
  "occupancyRate": 0.708,
  "activeContracts": 85
}
```

---

## Tỷ lệ lấp đầy theo tòa nhà (UC23)

```
GET /api/dashboard/occupancy
```

**Response:** `200`

```json
[
  {
    "buildingId": 1,
    "buildingName": "Vinhomes Central Park",
    "totalApartments": 50,
    "rentedApartments": 35,
    "occupancyRate": 0.7
  },
  {
    "buildingId": 2,
    "buildingName": "Sunrise City",
    "totalApartments": 70,
    "rentedApartments": 50,
    "occupancyRate": 0.714
  }
]
```

---

## Thống kê doanh thu (UC24)

```
GET /api/dashboard/revenue
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| from | string | Ngày bắt đầu (YYYY-MM-DD) |
| to | string | Ngày kết thúc (YYYY-MM-DD) |

**Ví dụ:**

```
GET /api/dashboard/revenue?from=2025-01-01&to=2025-06-30
```

**Response:** `200`

```json
{
  "totalRevenue": "480000000.00",
  "totalPayments": 60
}
```

---

## Doanh thu theo tháng (UC25)

```
GET /api/dashboard/revenue-by-month
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| year | number | Năm cần xem (mặc định: năm hiện tại) |

**Ví dụ:**

```
GET /api/dashboard/revenue-by-month?year=2025
```

**Response:** `200`

```json
[
  { "month": "2025-01", "revenue": "80000000.00", "count": 10 },
  { "month": "2025-02", "revenue": "80000000.00", "count": 10 },
  { "month": "2025-03", "revenue": "85000000.00", "count": 11 }
]
```

---

## Lịch sử lấp đầy theo thời gian (UC24)

```
GET /api/dashboard/occupancy-history
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| from | string | Ngày bắt đầu (YYYY-MM-DD) |
| to | string | Ngày kết thúc (YYYY-MM-DD) |

**Response:** `200`

```json
[
  {
    "month": "2025-01",
    "newContracts": 5,
    "activeContracts": 32,
    "occupancyRate": 0.533
  },
  {
    "month": "2025-02",
    "newContracts": 3,
    "activeContracts": 34,
    "occupancyRate": 0.567
  },
  {
    "month": "2025-03",
    "newContracts": 7,
    "activeContracts": 38,
    "occupancyRate": 0.633
  }
]
```

**Response lỗi:** `400`

```json
{
  "error": "Khoảng thời gian không hợp lệ"
}
```

---

## Dữ liệu bản đồ theo thời gian (Map Snapshot)

Trả về tất cả tòa nhà kèm tỷ lệ lấp đầy tại một thời điểm cụ thể. Dùng để hiển thị bản đồ 2D/3D thay đổi theo timeline.

```
GET /api/dashboard/map-snapshot
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| date | string | Yes | Thời điểm cần xem (YYYY-MM-DD) |

**Ví dụ:**

```
GET /api/dashboard/map-snapshot?date=2025-06-01
```

**Response:** `200` — GeoJSON FeatureCollection

```json
{
  "type": "FeatureCollection",
  "metadata": { "date": "2025-06-01" },
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
        "totalApartments": 50,
        "rentedApartments": 35,
        "availableApartments": 15,
        "occupancyRate": "70.0"
      }
    }
  ]
}
```

> Hiện tại `map-snapshot` vẫn trả `Point` theo centroid tòa nhà.

**Logic:** Tính số căn hộ có hợp đồng active tại thời điểm `date` (start_date <= date AND end_date >= date).

---

## Ghi chú cập nhật

- FE hiện dùng cả `occupancy-history` và `map-snapshot` trực tiếp trên dashboard, không còn chỉ dùng `map-snapshot` ở trang bản đồ
- Route dashboard đã có thêm test backend cho:
  - `overview`
  - validation `occupancy-history`
  - validation `map-snapshot`
  - shape GeoJSON của snapshot
