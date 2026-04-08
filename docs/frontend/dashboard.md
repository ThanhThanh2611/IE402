# Dashboard và Thống kê

Use Cases: UC22-25

## Trang Dashboard (`/dashboard`)

Trang dashboard hiện đã được triển khai thực tế và là route mặc định sau khi đăng nhập.

## 1. Dashboard tổng quan

### API chính

- `GET /api/dashboard/overview`
- `GET /api/dashboard/occupancy`
- `GET /api/dashboard/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/dashboard/revenue-by-month?year=YYYY`
- `GET /api/dashboard/occupancy-history?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Stat cards đang hiển thị

| Thẻ | Field |
|---|---|
| Tổng tòa nhà | `totalBuildings` |
| Tổng căn hộ | `totalApartments` |
| Đã cho thuê | `rentedApartments` |
| Hợp đồng đang hiệu lực | `activeContracts` |

Lưu ý: FE hiện bám theo shape response thực tế của backend, không còn dùng bộ chỉ số cũ như `totalContracts` hay `totalTenants` ở giao diện chính.

## 2. Tỷ lệ lấp đầy

### API

- `GET /api/dashboard/occupancy`

### Cách hiển thị hiện tại

- FE render danh sách theo từng tòa nhà
- Mỗi item hiển thị tên tòa nhà, tổng căn hộ, số căn đã thuê và phần trăm lấp đầy
- Cách trình bày hiện tại thiên về card/list hơn là dashboard chart phức tạp

## 3. Doanh thu theo tháng và theo khoảng thời gian

### Bộ lọc thời gian

FE hiện có bộ lọc:
- `fromDate`
- `toDate`
- `selectedYear`
- `snapshotDate`

Khoảng ngày được dùng cho:
- tổng doanh thu trong kỳ
- số giao dịch đã thu trong kỳ
- lịch sử tỷ lệ lấp đầy theo thời gian

Năm được dùng riêng cho biểu đồ doanh thu theo tháng.

Mốc `snapshotDate` được dùng riêng cho khối snapshot occupancy ngay trên dashboard.

### Doanh thu tổng trong kỳ

### API

- `GET /api/dashboard/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Hiển thị

- card tổng doanh thu trong kỳ
- card số giao dịch đã thu trong kỳ

## 4. Doanh thu theo tháng

### API

- `GET /api/dashboard/revenue-by-month?year=YYYY`

### Shape dữ liệu hiện tại

Mỗi phần tử có dạng:

```ts
{
  month: "2026-04",
  revenue: "125000000",
  count: 8
}
```

FE parse `month` theo format `YYYY-MM` và chuyển `revenue` từ string sang number trước khi đưa vào biểu đồ.

### Hiển thị

- Biểu đồ dùng Recharts
- Trục thời gian dựa trên chuỗi tháng-năm
- Giá trị doanh thu được format sang VND ở layer UI

## 5. Lịch sử tỷ lệ lấp đầy theo thời gian

### API

- `GET /api/dashboard/occupancy-history?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Shape dữ liệu hiện tại

Mỗi phần tử có dạng:

```ts
{
  month: "2026-04",
  newContracts: 3,
  activeContracts: 41,
  occupancyRate: 0.523
}
```

### Hiển thị

- FE render biểu đồ time series ngay trên dashboard
- một lớp dữ liệu thể hiện `occupancyRate`
- một lớp dữ liệu thể hiện `activeContracts`
- trục X là các mốc tháng trong khoảng ngày đã chọn
- FE bổ sung thêm các summary nhỏ ngay trong card:
  - lấp đầy đầu kỳ
  - lấp đầy cuối kỳ
  - số mốc dữ liệu đang được render

## 6. Dữ liệu snapshot

`Map snapshot` hiện đã được hiển thị trực tiếp trong dashboard thay vì chỉ dùng mạnh ở `/map`.

API liên quan:
- `GET /api/dashboard/map-snapshot?date=YYYY-MM-DD`

### Hiển thị hiện tại

- FE có input chọn ngày snapshot trực tiếp trong card bộ lọc thời gian
- dashboard hiển thị:
  - tỷ lệ lấp đầy toàn hệ thống tại mốc ngày đã chọn
  - tổng căn đang thuê / tổng căn
  - danh sách từng tòa nhà với progress bar lấp đầy
- Danh sách snapshot được sắp xếp theo tỷ lệ lấp đầy giảm dần để hỗ trợ demo nghiệp vụ rõ hơn
