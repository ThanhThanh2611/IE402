# Hướng dẫn Frontend

## Yêu cầu

- Node.js >= 20
- npm >= 10
- Backend API đang chạy để FE gọi dữ liệu thật

## Cài đặt và chạy

```bash
cd frontend
npm install
npm run dev
```

Mặc định app chạy tại `http://localhost:5173`.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run lint` | Kiểm tra lint |

## Công nghệ chính

| Công nghệ | Phiên bản | Ghi chú |
|---|---|---|
| React | 19 | SPA |
| TypeScript | 5.9 | Typing toàn dự án |
| Vite | 7 | Build tool |
| Tailwind CSS | 4 | CSS-first config |
| shadcn/ui | 4 | Style `base-nova`, icon `lucide` |
| React Router DOM | 7 | Routing |
| Recharts | 3 | Dashboard charts |
| Leaflet + react-leaflet | 5 | Bản đồ GIS |
| React Three Fiber + drei | 9/10 | Mô hình 3D |

## Cấu trúc route hiện tại

### Public

- `/login`

### Protected

- `/dashboard`
- `/map`
- `/buildings/:id`
- `/buildings/:id/apartments/:apartmentId`

### Manager-only

- `/apartments`
- `/contracts`
- `/tenants`
- `/payments`
- `/users`

### Redirect

- sau login: điều hướng về `/dashboard`
- route `*`: hiển thị trang `404`

## Cấu trúc thư mục chính

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── ...
│   ├── contexts/
│   ├── lib/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Auth flow

- Đăng nhập qua `POST /api/auth/login`
- Backend trả về `{ user, accessToken, refreshToken }`
- FE lưu `accessToken` và `refreshToken` vào session cục bộ
- FE tự gắn `Authorization: Bearer <accessToken>` cho request
- Nếu API trả `401`, FE sẽ thử `POST /api/auth/refresh`
- Nếu refresh thất bại, FE mới logout và chuyển về `/login`

## Error handling và fallback

- Toàn app được bọc bởi `AppErrorBoundary`
- Route không tồn tại sẽ vào trang `404`
- Các màn hình chính có state lỗi và empty state thân thiện hơn, kèm nút thử lại ở các chỗ phù hợp

## Path alias và import

Alias `@/` trỏ tới `src/`.

Ưu tiên import UI component từ barrel:

```tsx
import { Button, Card } from '@/components/ui'
```

## Design tokens

Toàn bộ màu được định nghĩa trong `src/index.css` bằng CSS variables. Khi viết UI:
- không hardcode màu
- dùng token như `bg-background`, `bg-card`, `text-foreground`, `border-border`, `bg-primary`

## Quy ước component

- Ưu tiên dùng shadcn trước khi tự viết mới
- Component tự viết đặt trong `src/components/`
- Không đặt component custom vào `src/components/ui/`
- Khi thêm shadcn component mới, cập nhật `src/components/ui/index.ts`
- Dùng `cn()` từ `@/lib/utils` để merge class có điều kiện

## Lưu ý triển khai hiện tại

- FE đã khớp với backend mới về GeoJSON polygon/point của building và floor.
- Trang chi tiết tòa nhà hiện lấy popup căn hộ từ `GET /api/apartments/:id/details`.
- Trang dashboard đã parse doanh thu tháng theo format `YYYY-MM`.
- Dashboard hiện có thêm occupancy history, snapshot theo mốc thời gian và state lỗi thân thiện hơn.
- Quyền xem tenant/hợp đồng ở FE bám theo cờ backend trả về, không chỉ dựa trên role cố định.
