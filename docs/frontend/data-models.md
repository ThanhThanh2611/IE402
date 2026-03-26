# Kiểu dữ liệu TypeScript

Các interface/type dùng chung trong frontend, mapping từ API response.

## Enums

```typescript
type ApartmentStatus = 'available' | 'rented' | 'maintenance'

type ContractStatus = 'active' | 'expired' | 'cancelled'

type PaymentStatus = 'pending' | 'paid' | 'overdue'

type UserRole = 'user' | 'manager'

type NodeType = 'door' | 'elevator' | 'stairs' | 'junction'

type EdgeType = 'hallway' | 'stairs' | 'elevator'
```

## Label tiếng Việt cho Enum

```typescript
const APARTMENT_STATUS_LABEL: Record<ApartmentStatus, string> = {
  available: 'Còn trống',
  rented: 'Đã thuê',
  maintenance: 'Đang bảo trì',
}

const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  overdue: 'Quá hạn',
}

const USER_ROLE_LABEL: Record<UserRole, string> = {
  user: 'Người dùng',
  manager: 'Quản lý',
}

const NODE_TYPE_LABEL: Record<NodeType, string> = {
  door: 'Cửa căn hộ',
  elevator: 'Thang máy',
  stairs: 'Cầu thang',
  junction: 'Sảnh/giao cắt',
}

const EDGE_TYPE_LABEL: Record<EdgeType, string> = {
  hallway: 'Hành lang',
  stairs: 'Cầu thang liên tầng',
  elevator: 'Thang máy liên tầng',
}
```

## Interfaces

### Building

```typescript
interface Building {
  id: number
  name: string
  address: string
  ward: string | null
  district: string | null
  city: string | null
  totalFloors: number
  description: string | null
  imageUrl: string | null
  model3dUrl: string | null
  createdAt: string
  updatedAt: string
}
```

### Floor

```typescript
interface Floor {
  id: number
  buildingId: number
  floorNumber: number
  description: string | null
  createdAt: string
  updatedAt: string
}
```

### Apartment

```typescript
interface Apartment {
  id: number
  floorId: number
  entryNodeId: number | null
  code: string
  area: number
  numBedrooms: number | null
  numBathrooms: number | null
  rentalPrice: number
  status: ApartmentStatus
  description: string | null
  createdAt: string
  updatedAt: string
}
```

### Tenant

```typescript
interface Tenant {
  id: number
  fullName: string
  phone: string
  email: string | null
  idCard: string
  address: string | null
  createdAt: string
  updatedAt: string
}
```

### RentalContract

```typescript
interface RentalContract {
  id: number
  apartmentId: number
  tenantId: number
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number | null
  status: ContractStatus
  note: string | null
  createdAt: string
  updatedAt: string
}
```

### Payment

```typescript
interface Payment {
  id: number
  contractId: number
  amount: number
  paymentDate: string
  status: PaymentStatus
  note: string | null
  createdAt: string
}
```

### User

```typescript
interface User {
  id: number
  username: string
  fullName: string
  email: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### Dashboard

```typescript
interface DashboardOverview {
  totalBuildings: number
  totalApartments: number
  rentedApartments: number
  totalContracts: number
  totalTenants: number
}

interface BuildingOccupancy {
  buildingId: number
  buildingName: string
  totalApartments: number
  rentedApartments: number
  occupancyRate: number
}

interface MonthlyRevenue {
  month: number
  revenue: number
}
```

### NavigationNode

```typescript
interface NavigationNode {
  id: number
  floorId: number
  nodeType: NodeType
  label: string | null
  lng: number
  lat: number
  z: number
  createdAt: string
  updatedAt: string
}
```

### NavigationEdge

```typescript
interface NavigationEdge {
  id: number
  startNodeId: number
  endNodeId: number
  edgeType: EdgeType
  distance: string
  travelTime: string | null
  isAccessible: boolean
  createdAt: string
  updatedAt: string
}
```

### BuildingGraph

```typescript
interface BuildingGraph {
  nodes: NavigationNode[]
  edges: NavigationEdge[]
}
```

## Format tiền VND

```typescript
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}
// Ví dụ: formatVND(5000000) → "5.000.000 ₫"
```

## Format ngày

```typescript
function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(dateStr))
}
// Ví dụ: formatDate("2025-03-14") → "14/03/2025"
```
