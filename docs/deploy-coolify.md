# Hướng dẫn Deploy lên Coolify

## Tổng quan kiến trúc

Dự án gồm 3 service cần deploy:

| Service | Công nghệ | Coolify type |
|---|---|---|
| **Database** | PostgreSQL + PostGIS | Service (Docker image) |
| **Backend** | Node.js + Express | Application (Dockerfile) |
| **Frontend** | React + Vite (static) | Application (Dockerfile) |

---

## Bước 1 — Tạo Dockerfile cho Backend

Tạo file `backend/Dockerfile`:

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app

# Cài dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# Build TypeScript
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Bước 2 — Tạo Dockerfile cho Frontend

Tạo file `frontend/Dockerfile`:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Truyền URL backend vào lúc build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve static files bằng Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Config để React Router hoạt động (SPA fallback)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
```

## Bước 3 — Commit các Dockerfile lên Git

```bash
git add backend/Dockerfile frontend/Dockerfile
git commit -m "chore: add Dockerfiles for Coolify deployment"
git push
```

---

## Bước 4 — Tạo Project trên Coolify

1. Đăng nhập Coolify → **Projects** → **+ New Project**
2. Đặt tên (ví dụ: `IE402-GIS`) → **Create**

---

## Bước 5 — Deploy Database (PostGIS)

> PostGIS không có sẵn trong danh sách database mặc định của Coolify, phải dùng Docker image thủ công.

1. Trong project → **+ New** → **Database** → **PostgreSQL**
2. **Quan trọng**: Đổi Docker image từ `postgres` thành `postgis/postgis:16-3.4`
3. Cấu hình:
   - **Database name**: `ie402_gis`
   - **Username**: `postgres`
   - **Password**: _(tạo password mạnh, lưu lại)_
4. Bấm **Deploy**
5. Sau khi chạy, copy **Internal Database URL** (dạng `postgresql://postgres:<pass>@<internal-host>:5432/ie402_gis`)

---

## Bước 6 — Deploy Backend

1. **+ New** → **Application** → **Public Repository** (hoặc Private nếu repo private)
2. Paste URL repo GitHub → **Next**
3. Cấu hình:
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Location**: `backend/Dockerfile`
   - **Port**: `3000`
4. Chuyển sang tab **Environment Variables**, thêm:

   ```
   DATABASE_URL=postgresql://postgres:<pass>@<internal-db-host>:5432/ie402_gis
   PORT=3000
   JWT_SECRET=<chuỗi_random_dài_ít_nhất_32_ký_tự>
   NODE_ENV=production
   CORS_ORIGIN=https://app.yourdomain.com
   ```

   > `DATABASE_URL` dùng **Internal URL** từ Bước 5 (host nội bộ trong mạng Docker của Coolify, không phải public URL).

5. Bấm **Deploy**
6. Sau khi xong, copy **Public URL** của backend (ví dụ: `https://api.yourdomain.com`)

### Chạy migration sau khi deploy

Vào tab **Terminal** của backend service và chạy:

```bash
npm run db:migrate

# Nếu cần seed dữ liệu mẫu:
npm run db:seed
```

---

## Bước 7 — Deploy Frontend

1. **+ New** → **Application** → cùng repo GitHub
2. Cấu hình:
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Location**: `frontend/Dockerfile`
   - **Port**: `80`
3. Tab **Environment Variables**, thêm:

   ```
   VITE_API_URL=https://api.yourdomain.com
   ```

   > Đây là **Public URL** của backend từ Bước 6. Phải điền đúng vì Vite nhúng giá trị này vào bundle lúc build — sau khi build xong không thể đổi mà không rebuild lại.

4. Bấm **Deploy**

---

## Bước 8 — Cấu hình Domain (tùy chọn)

1. Vào từng service (backend, frontend) → tab **Domains**
2. Thêm custom domain:
   - Backend: `api.yourdomain.com`
   - Frontend: `app.yourdomain.com`
3. Coolify tự động cấp SSL qua Let's Encrypt

---

## Bước 9 — Kiểm tra sau khi deploy

```bash
# Kiểm tra backend còn sống
curl https://api.yourdomain.com/health

# Kiểm tra kết nối database
curl https://api.yourdomain.com/api/buildings
```

Truy cập frontend tại `https://app.yourdomain.com` và thử đăng nhập, xem bản đồ, danh sách căn hộ.

---

## Lưu ý quan trọng

### File uploads (mô hình 3D)

Backend dùng `multer` để nhận file `.glb/.gltf`. Mặc định multer lưu lên disk — container restart sẽ **mất toàn bộ file**. Cần xử lý một trong hai cách:

- **Mount volume**: Trong Coolify, vào tab **Storages** của backend service → thêm persistent volume tại path `/app/uploads`
- **Chuyển sang object storage**: Lưu file lên S3/R2/MinIO thay vì disk (khuyến nghị cho production)

### Auto Deploy

Trong Settings của mỗi service, bật **Auto Deploy** để Coolify tự động rebuild khi có commit mới push lên nhánh `main`.

### Rebuild Frontend khi đổi API URL

Vì `VITE_API_URL` được nhúng vào lúc build, nếu đổi URL backend thì phải **rebuild lại** frontend (trigger manual deploy trên Coolify).
