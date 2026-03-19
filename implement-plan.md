# Implementation Plan

## Phase 1: Foundation + Auth + Validation — DONE

### Backend
- [x] Database schema (Drizzle ORM + PostGIS)
- [x] API routes (buildings, apartments, contracts, tenants, payments, users, dashboard, auth, floors, status-history)
- [x] Seed data file (`backend/src/db/seed.ts`) — bcrypt hashed passwords
- [x] JWT authentication middleware (`backend/src/middleware/auth.ts`)
- [x] Role-based access control middleware (manager-only routes)
- [x] Bảo vệ các route cần auth (tất cả trừ login + health)
- [x] Hash password (bcrypt) trong auth + users route

### Frontend Setup
- [x] Vite + React 19 + TypeScript
- [x] Tailwind CSS v4 + shadcn/ui v4
- [x] 28 shadcn components installed
- [x] React Router + Recharts + Zod installed
- [x] TypeScript types/models (`src/types/index.ts`)
- [x] API service layer (`src/lib/api.ts`) — JWT interceptor, auto 401 redirect
- [x] Auth context/provider (`src/contexts/AuthContext.tsx`)
- [x] Protected route + Role guard (`src/components/ProtectedRoute.tsx`)
- [x] Form validation với zod (`src/lib/validators.ts`)
- [x] Custom hooks (`src/lib/hooks.ts`)
- [x] App layout with sidebar (`src/components/AppLayout.tsx`)
- [x] Coming Soon placeholder (`src/components/ComingSoon.tsx`)

### Frontend Pages (Non-GIS)
- [x] `/login` - Trang đăng nhập (zod validation, toast error)
- [x] `/dashboard` - Dashboard & Thống kê (stat cards, BarChart occupancy, LineChart revenue)
- [x] `/apartments` - Quản lý căn hộ (CRUD, filter building/floor, status change)
- [x] `/contracts` - Quản lý hợp đồng (CRUD, auto-fill rent from apartment)
- [x] `/tenants` - Quản lý người thuê (CRUD, SĐT/CCCD validation)
- [x] `/payments` - Quản lý thanh toán (CRUD, auto-fill amount from contract)
- [x] `/users` - Quản lý người dùng (CRUD, activate/deactivate toggle)

### GIS Placeholder
- [x] `/map` - Coming Soon
- [x] `/buildings/:id` - Coming Soon
- [x] `/buildings/:id/apartments/:apartmentId` - Coming Soon

## Phase 2: GIS & 3D
- [x] `/map` - Bản đồ GIS (Mapbox/Leaflet, markers, filters, popup)
- [ ] `/buildings/:id` - Chi tiết tòa nhà + mô hình 3D (Three.js/React Three Fiber)
- [ ] `/buildings/:id/apartments/:apartmentId` - Chi tiết căn hộ (linked from 3D view)

## Phase 3: Polish
- [ ] Responsive design tuning
- [ ] Dark mode support
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Error boundaries + 404 page
- [ ] E2E testing
