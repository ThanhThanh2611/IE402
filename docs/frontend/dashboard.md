# Dashboard và Thống kê

Use Cases: UC22-25

## Trang Dashboard (`/dashboard`)

### UC22 — Dashboard tổng quan

**API**: `GET /api/dashboard/overview`

Hiển thị các thẻ thống kê tổng quan (stat cards) ở đầu trang.

#### Stat cards

| Thẻ | Dữ liệu | Icon gợi ý |
|---|---|---|
| Tổng tòa nhà | `totalBuildings` | Building2 |
| Tổng căn hộ | `totalApartments` | Home |
| Đã cho thuê | `rentedApartments` | Key |
| Tổng hợp đồng | `totalContracts` | FileText |
| Tổng người thuê | `totalTenants` | Users |

- Dùng component `Card` với layout grid 2-5 cột
- Hiển thị số lớn + label mô tả

---

### UC23 — Thống kê tỷ lệ lấp đầy

**API**: `GET /api/dashboard/occupancy`

#### Biểu đồ gợi ý
- **Bar chart ngang**: mỗi bar là 1 tòa nhà, chiều dài = tỷ lệ %
- Hoặc **Donut chart** cho từng tòa nhà
- Dùng thư viện: Recharts (tương thích tốt với shadcn)

#### Dữ liệu hiển thị per tòa nhà
- Tên tòa nhà
- Tổng căn hộ
- Đã thuê
- Tỷ lệ lấp đầy (%)

---

### UC24 — Thống kê doanh thu

#### Doanh thu tổng
- **API**: `GET /api/dashboard/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Cho phép chọn khoảng thời gian (DateRangePicker)
- Hiển thị tổng doanh thu format VND

#### Doanh thu theo tháng
- **API**: `GET /api/dashboard/revenue-by-month?year=YYYY`
- **Biểu đồ**: Line chart hoặc Bar chart
- Trục X: tháng (1-12)
- Trục Y: doanh thu (VND)
- Dropdown chọn năm

---

### UC25 — Dữ liệu theo thời gian

#### Lịch sử tỷ lệ lấp đầy
- **API**: `GET /api/dashboard/occupancy-history?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Biểu đồ**: Area chart hoặc Line chart
- Trục X: thời gian
- Trục Y: tỷ lệ lấp đầy (%)
- Cho phép chọn khoảng thời gian

#### Bản đồ snapshot
- **API**: `GET /api/dashboard/map-snapshot?date=YYYY-MM-DD`
- Hiển thị trạng thái lấp đầy tất cả tòa nhà tại 1 ngày cụ thể
- Response: GeoJSON FeatureCollection kèm occupancy data
- Có thể dùng DatePicker để chọn ngày, render lên bản đồ mini

---

### Layout gợi ý

```
┌─────────────────────────────────────────────────┐
│  Dashboard                                      │
├────────┬────────┬────────┬────────┬─────────────┤
│Tòa nhà│Căn hộ  │Đã thuê │Hợp đồng│Người thuê   │
│  12    │  240   │  185   │  185   │  170        │
├────────┴────────┴────────┴────────┴─────────────┤
│                                                 │
│  Tỷ lệ lấp đầy theo tòa nhà     [Bar chart]   │
│                                                 │
├─────────────────────┬───────────────────────────┤
│                     │                           │
│  Doanh thu theo     │  Lịch sử tỷ lệ lấp đầy  │
│  tháng [Line chart] │  [Area chart]             │
│                     │                           │
└─────────────────────┴───────────────────────────┘
```
