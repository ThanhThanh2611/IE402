# 3D GIS Apartment Management System

Hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS 3D.

**Demo:** [fe.hytechsolutionscms.site](https://fe.hytechsolutionscms.site/)

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
npm run db:import:geojson # Import dữ liệu tòa nhà từ GeoJSON
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
cd backend && cp .env.example .env && npm install && npm run db:push && npm run db:seed && npm run db:import:geojson && npm run dev

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

## Tài khoản mẫu

> Dùng để đăng nhập trên [server test](https://fe.hytechsolutionscms.site/) hoặc sau khi chạy `npm run db:seed` ở local.

| Username | Password | Role | Ghi chú |
|----------|----------|------|---------|
| `manager1` | `manager123` | Manager | |
| `manager2` | `manager123` | Manager | |
| `user1` | `user123` | User | |
| `user2` | `user123` | User | |
| `user3` | `user123` | User | Bị vô hiệu hóa |

## Tech Stack

| | Công nghệ |
|---|---|
| **Backend** | Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL + PostGIS (PointZ/PolygonZ), JWT, bcrypt |
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
| `npm run db:import:geojson` | Import dữ liệu tòa nhà từ `backend/src/db/geojson/apartments_r10km_cleaned.geojson` |
| `npm run db:studio` | Mở Drizzle Studio (GUI) |

### Frontend (`cd frontend`)

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server (HMR) tại port 5173 |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run preview` | Preview bản build |

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
│   ├── erd.dbml             # ERD schema
│   └── erd.md               # Mô tả ERD
├── docker-compose.yml
└── README.md
```

## Tài liệu

- [`docs/erd.dbml`](docs/erd.dbml) — ERD schema (DBML)
- [`docs/erd.md`](docs/erd.md) — Mô tả ERD chi tiết
- [`docs/api/`](docs/api/) — API documentation (apartments, contracts, buildings, floors, navigation, furniture, ...)
- [`docs/frontend/`](docs/frontend/) — Tài liệu frontend (auth, pages, data-models, map-gis, floor-model-hotspot-workflow, ...)
