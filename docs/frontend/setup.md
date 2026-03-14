# Hướng dẫn Frontend

## Yêu cầu

- Node.js >= 20
- npm >= 10

## Cài đặt và chạy

```bash
cd frontend
npm install
npm run dev
```

Mặc định chạy tại `http://localhost:5173`.

### Các lệnh khác

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (HMR) |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run lint` | Kiểm tra linting |

## Tech Stack

| Công nghệ | Phiên bản | Ghi chú |
|---|---|---|
| React | 19 | |
| TypeScript | 5.9 | |
| Vite | 7 | Build tool |
| Tailwind CSS | 4 | CSS-first config, không cần `tailwind.config.js` |
| shadcn/ui | 4 | Style: `base-nova`, icon: `lucide` |
| Font | Geist Variable | Tự động import qua `@fontsource-variable/geist` |

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   │       ├── index.ts   # Barrel export (import gọn từ đây)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── hooks/             # Custom hooks
│   ├── lib/
│   │   └── utils.ts       # Utility cn() để merge Tailwind class
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css          # Tailwind v4 + theme config
├── components.json        # Config shadcn/ui
├── vite.config.ts
└── tsconfig.json
```

## Path Alias

Đã cấu hình alias `@/` trỏ tới `src/`:

```tsx
// Thay vì
import { Button } from '../../../components/ui/button'

// Dùng
import { Button } from '@/components/ui/button'
```

## shadcn/ui

### Component đã cài sẵn

| Nhóm | Components |
|---|---|
| Layout | `Card`, `Separator`, `ScrollArea`, `Skeleton`, `Sidebar`, `Sheet` |
| Form | `Button`, `Input`, `InputGroup`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Select` |
| Feedback | `Alert`, `AlertDialog`, `Badge`, `Sonner` (toast) |
| Overlay | `Dialog`, `Popover`, `Tooltip`, `DropdownMenu`, `Command` |
| Navigation | `Tabs`, `Breadcrumb`, `Pagination` |
| Data | `Table`, `Avatar` |
| Form validation | `Form` (tích hợp react-hook-form + zod) |

### Import component

Có 2 cách import:

```tsx
// Cách 1: Import từ barrel index (gọn, dùng khi cần nhiều component)
import { Button, Card, CardHeader, CardTitle, Input } from '@/components/ui'

// Cách 2: Import trực tiếp từ file (rõ ràng hơn)
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
```

### Thêm component mới

```bash
# Thêm 1 component
npx shadcn@latest add calendar

# Thêm nhiều component
npx shadcn@latest add chart progress slider
```

Sau khi thêm, **cập nhật barrel index** tại `src/components/ui/index.ts`:

```ts
export * from './calendar'
```

### Tham khảo

- Docs shadcn/ui: https://ui.shadcn.com/docs/components
- Danh sách component: https://ui.shadcn.com/docs/components/button (thay `button` bằng tên component)

## Bảng màu (Design Tokens)

Toàn bộ màu được khai báo trong `src/index.css` dưới dạng CSS variables. Dùng class Tailwind tương ứng, **không hardcode mã màu**.

### Main UI

| Token | Màu | Tailwind class |
|---|---|---|
| `--background` | `#FFFFFF` | `bg-background`, `text-background` |
| `--foreground` | `#2C2C2C` | `text-foreground`, `bg-foreground` |
| `--card` | `#F5EEDC` | `bg-card` |
| `--border` | `#E5E4E2` | `border-border` |
| `--muted` | `#F5EEDC` | `bg-muted`, `text-muted-foreground` |

### Primary (CTA)

| Token | Màu | Tailwind class |
|---|---|---|
| `--primary` | `#D4AF37` (gold) | `bg-primary`, `text-primary` |
| `--primary-foreground` | `#FFFFFF` | `text-primary-foreground` |
| `--primary-hover` | `#C19B2C` | `hover:bg-primary-hover` |

### Sidebar

| Token | Màu | Tailwind class |
|---|---|---|
| `--sidebar` | `#2C2C2C` | `bg-sidebar` |
| `--sidebar-foreground` | `#FFFFFF` | `text-sidebar-foreground` |
| `--sidebar-primary` | `#D4AF37` | `bg-sidebar-primary` |
| `--sidebar-accent` | `#3D3D3D` | `bg-sidebar-accent` |

### Ví dụ sử dụng

```tsx
// Đúng - dùng design token
<div className="bg-card border border-border rounded-lg p-4">
  <h2 className="text-foreground">Tiêu đề</h2>
  <p className="text-muted-foreground">Mô tả</p>
  <Button>Xác nhận</Button> {/* Button primary mặc định dùng --primary */}
</div>

// Sai - hardcode màu
<div className="bg-[#F5EEDC] border border-[#E5E4E2]">...</div>
```

## Quy ước code

1. **Không hardcode màu** — luôn dùng design token (`bg-primary`, `text-foreground`, ...)
2. **Dùng shadcn component** trước khi tự viết — kiểm tra danh sách component có sẵn
3. **Đặt component tự viết** vào `src/components/` (không đặt trong `ui/`, thư mục đó dành cho shadcn)
4. **Cập nhật `index.ts`** mỗi khi thêm shadcn component mới
5. **Dùng `cn()`** để merge class có điều kiện:

```tsx
import { cn } from '@/lib/utils'

<div className={cn('p-4 rounded-lg', isActive && 'bg-primary text-primary-foreground')}>
```
