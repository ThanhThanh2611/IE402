# 3D GIS Apartment Management System

Hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS 3D.

## Yêu cầu

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://docs.docker.com/get-docker/) (Docker Engine hoặc Docker Desktop)

## Khởi chạy nhanh

### 1. Database (PostgreSQL + PostGIS)

```bash
docker compose up -d
```

Database chạy tại `localhost:5434` (user: `postgres`, password: `password`, db: `ie402_gis`).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:push
npm run dev
```

Server chạy tại `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App chạy tại `http://localhost:5173`.

### Chạy toàn bộ (tóm tắt)

```bash
# Terminal 1 — Database
docker compose up -d

# Terminal 2 — Backend
cd backend && cp .env.example .env && npm install && npm run db:push && npm run dev

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

## Tech Stack

| | Công nghệ |
|---|---|
| **Backend** | Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL + PostGIS |
| **Frontend** | React 19, Vite 7, TypeScript, Tailwind CSS v4, shadcn/ui |
| **Font** | Geist Variable |

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Health check |
| **Auth** | | |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/users` | Danh sách users |
| **Buildings** | | |
| GET | `/api/buildings` | Danh sách tòa nhà (filter: district, city, ward, minPrice, maxPrice) |
| GET | `/api/buildings/geojson` | Danh sách tòa nhà dạng GeoJSON FeatureCollection |
| GET | `/api/buildings/nearby` | Tìm tòa nhà gần vị trí - PostGIS ST_DWithin (lat, lng, radius mét) |
| GET | `/api/buildings/:id` | Chi tiết tòa nhà |
| GET | `/api/buildings/:id/occupancy` | Tỷ lệ lấp đầy tòa nhà |
| POST/PUT/DELETE | `/api/buildings/:id` | Thêm / Sửa / Xóa tòa nhà |
| **Floors** | | |
| GET | `/api/floors?buildingId=X` | Danh sách tầng (theo tòa nhà) |
| POST/PUT/DELETE | `/api/floors/:id` | Thêm / Sửa / Xóa tầng |
| **Apartments** | | |
| GET | `/api/apartments?floorId=X` | Danh sách căn hộ (theo tầng) |
| GET | `/api/apartments/:id` | Chi tiết căn hộ |
| POST/PUT/DELETE | `/api/apartments/:id` | Thêm / Sửa / Xóa căn hộ (soft delete) |
| PATCH | `/api/apartments/:id/status` | Cập nhật trạng thái căn hộ |
| **Contracts** | | |
| GET/POST | `/api/contracts` | Danh sách / Thêm hợp đồng |
| GET/PUT/DELETE | `/api/contracts/:id` | Chi tiết / Sửa / Xóa hợp đồng (soft delete) |
| **Tenants** | | |
| GET/POST | `/api/tenants` | Danh sách / Thêm người thuê |
| GET/PUT/DELETE | `/api/tenants/:id` | Chi tiết / Sửa / Xóa người thuê (soft delete) |
| **Payments** | | |
| GET | `/api/payments?contractId=X` | Danh sách thanh toán (theo hợp đồng) |
| POST/PUT/DELETE | `/api/payments/:id` | Thêm / Sửa / Xóa thanh toán (soft delete) |
| **Dashboard** | | |
| GET | `/api/dashboard/overview` | Tổng quan hệ thống |
| GET | `/api/dashboard/occupancy` | Tỷ lệ lấp đầy theo tòa nhà |
| GET | `/api/dashboard/revenue?from=&to=` | Thống kê doanh thu |
| GET | `/api/dashboard/revenue-by-month?year=` | Doanh thu theo tháng |
| GET | `/api/dashboard/occupancy-history?from=&to=` | Lấp đầy theo thời gian |
| GET | `/api/dashboard/map-snapshot?date=` | Dữ liệu bản đồ tại thời điểm (GeoJSON) |
| **Status History** | | |
| GET | `/api/status-history?apartmentId=X` | Lịch sử trạng thái căn hộ |
| POST | `/api/status-history` | Thêm lịch sử trạng thái |

> Chi tiết API: xem `docs/api/`

## Cấu trúc thư mục

```
├── backend/
│   ├── src/
│   │   ├── db/              # Schema & kết nối DB
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   ├── drizzle.config.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities (cn, ...)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css        # Tailwind v4 + theme
│   ├── components.json      # shadcn/ui config
│   └── package.json
├── docs/
│   ├── api/                 # API documentation
│   ├── frontend/            # Tài liệu frontend (setup, pages, chức năng, data models)
│   ├── BA.md                # Tài liệu phân tích nghiệp vụ
│   └── erd.dbml             # ERD
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

## Tài liệu

- [`docs/BA.md`](docs/BA.md) — Phân tích nghiệp vụ (Use Case, DFD, Sequence Diagram)
- [`docs/erd.dbml`](docs/erd.dbml) — ERD
- [`docs/frontend/`](docs/frontend/) — Tài liệu frontend (setup, pages, từng nhóm chức năng, data models)
- [`docs/api/`](docs/api/) — API documentation
