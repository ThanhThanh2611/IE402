# Dashboard API

Base URL: `/api/dashboard`

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
  "occupancyRate": "70.8",
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
    "occupancyRate": "70.0"
  },
  {
    "buildingId": 2,
    "buildingName": "Sunrise City",
    "totalApartments": 70,
    "rentedApartments": 50,
    "occupancyRate": "71.4"
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

## Lịch sử lấp đầy theo thời gian (UC25)

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
  { "month": "2025-01", "newContracts": 5 },
  { "month": "2025-02", "newContracts": 3 },
  { "month": "2025-03", "newContracts": 7 }
]
```
