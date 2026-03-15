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
npm run db:push    # Tạo tables
npm run db:seed    # Seed dữ liệu mẫu
npm run dev        # Chạy server
```

Server chạy tại `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App chạy tại `http://localhost:5173`.

> Frontend proxy `/api` tới `localhost:3000` (đã cấu hình trong `vite.config.ts`).

### Chạy toàn bộ (tóm tắt)

```bash
# Terminal 1 — Database
docker compose up -d

# Terminal 2 — Backend
cd backend && cp .env.example .env && npm install && npm run db:push && npm run db:seed && npm run dev

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

## Tài khoản mẫu (sau khi seed)

| Username | Password | Role | Ghi chú |
|----------|----------|------|---------|
| `manager1` | `manager123` | Manager | |
| `manager2` | `manager123` | Manager | |
| `user1` | `user123` | User | |
| `user2` | `user123` | User | |
| `user3` | `user123` | User | Bị vô hiệu hóa |

## Authentication

- Đăng nhập qua `POST /api/auth/login` → nhận JWT token
- Mọi API (trừ login + health) đều yêu cầu header `Authorization: Bearer <token>`
- Password được hash bằng bcrypt
- Token hết hạn sau 7 ngày
- Role-based access: routes quản lý (contracts, tenants, payments, users) chỉ Manager mới truy cập được

## Tech Stack

| | Công nghệ |
|---|---|
| **Backend** | Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL + PostGIS, JWT, bcrypt |
| **Frontend** | React 19, Vite 7, TypeScript, Tailwind CSS v4, shadcn/ui, React Router, Recharts, Zod |
| **Font** | Geist Variable |

## Scripts

### Backend (`cd backend`)

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server (hot reload) |
| `npm run build` | Build TypeScript |
| `npm start` | Chạy production |
| `npm run db:push` | Push schema lên database |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Chạy migrations |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npm run db:studio` | Mở Drizzle Studio (GUI) |

### Frontend (`cd frontend`)

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server (HMR) tại port 5173 |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run preview` | Preview bản build |

## API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/health` | Health check | - |
| **Auth** | | | |
| POST | `/api/auth/login` | Đăng nhập → JWT token | - |
| **Buildings** | | | |
| GET | `/api/buildings` | Danh sách tòa nhà (filter: district, city, ward, minPrice, maxPrice) | Login |
| GET | `/api/buildings/geojson` | GeoJSON FeatureCollection | Login |
| GET | `/api/buildings/nearby` | Tìm gần vị trí (lat, lng, radius) | Login |
| GET | `/api/buildings/:id` | Chi tiết tòa nhà | Login |
| GET | `/api/buildings/:id/occupancy` | Tỷ lệ lấp đầy | Login |
| POST/PUT/DELETE | `/api/buildings/:id` | CRUD tòa nhà | Login |
| **Floors** | | | |
| GET | `/api/floors?buildingId=X` | Danh sách tầng | Login |
| POST/PUT/DELETE | `/api/floors/:id` | CRUD tầng | Login |
| **Apartments** | | | |
| GET | `/api/apartments?floorId=X` | Danh sách căn hộ | Login |
| GET | `/api/apartments/:id` | Chi tiết căn hộ | Login |
| POST/PUT/DELETE | `/api/apartments/:id` | CRUD căn hộ (soft delete) | Login |
| PATCH | `/api/apartments/:id/status` | Cập nhật trạng thái | Login |
| **Contracts** | | | |
| GET/POST | `/api/contracts` | Danh sách / Thêm hợp đồng | Manager |
| GET/PUT/DELETE | `/api/contracts/:id` | Chi tiết / Sửa / Xóa | Manager |
| **Tenants** | | | |
| GET/POST | `/api/tenants` | Danh sách / Thêm người thuê | Manager |
| GET/PUT/DELETE | `/api/tenants/:id` | Chi tiết / Sửa / Xóa | Manager |
| **Payments** | | | |
| GET | `/api/payments?contractId=X` | Danh sách thanh toán | Manager |
| POST/PUT/DELETE | `/api/payments/:id` | CRUD thanh toán | Manager |
| **Users** | | | |
| GET/POST | `/api/users` | Danh sách / Thêm người dùng | Manager |
| PUT/DELETE | `/api/users/:id` | Sửa / Xóa người dùng | Manager |
| PATCH | `/api/users/:id/activate` | Kích hoạt tài khoản | Manager |
| PATCH | `/api/users/:id/deactivate` | Vô hiệu hóa tài khoản | Manager |
| **Dashboard** | | | |
| GET | `/api/dashboard/overview` | Tổng quan hệ thống | Login |
| GET | `/api/dashboard/occupancy` | Tỷ lệ lấp đầy theo tòa nhà | Login |
| GET | `/api/dashboard/revenue?from=&to=` | Thống kê doanh thu | Login |
| GET | `/api/dashboard/revenue-by-month?year=` | Doanh thu theo tháng | Login |
| GET | `/api/dashboard/occupancy-history?from=&to=` | Lấp đầy theo thời gian | Login |
| GET | `/api/dashboard/map-snapshot?date=` | GeoJSON snapshot | Login |
| **Status History** | | | |
| GET | `/api/status-history?apartmentId=X` | Lịch sử trạng thái | Manager |
| POST | `/api/status-history` | Thêm lịch sử trạng thái | Manager |

> Chi tiết API: xem `docs/api/`

## Cấu trúc thư mục

```
├── backend/
│   ├── src/
│   │   ├── db/              # Schema, kết nối DB, seed data
│   │   ├── middleware/       # JWT auth, role-based guard
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   ├── drizzle/             # Migrations
│   ├── drizzle.config.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── contexts/        # AuthContext
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # API service, validators, utilities
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Router setup
│   │   ├── main.tsx
│   │   └── index.css        # Tailwind v4 + theme tokens
│   ├── components.json      # shadcn/ui config
│   └── package.json
├── docs/
│   ├── api/                 # API documentation
│   ├── frontend/            # Tài liệu frontend
│   ├── BA.md                # Phân tích nghiệp vụ
│   └── erd.dbml             # ERD
├── implement-plan.md        # Kế hoạch triển khai
├── todo.md                  # Danh sách việc cần làm
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

## Tài liệu

- [`docs/BA.md`](docs/BA.md) — Phân tích nghiệp vụ (Use Case, DFD, Sequence Diagram)
- [`docs/erd.dbml`](docs/erd.dbml) — ERD
- [`docs/frontend/`](docs/frontend/) — Tài liệu frontend
- [`docs/api/`](docs/api/) — API documentation
- [`docs/user-guide/`](docs/user-guide/) — Hướng dẫn sử dụng theo vai trò (User, Manager)
- [`docs/git-workflow.md`](docs/git-workflow.md) — Quy trình Git
- [`implement-plan.md`](implement-plan.md) — Kế hoạch triển khai
- [`todo.md`](todo.md) — TODO list
