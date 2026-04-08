# Kiểu dữ liệu TypeScript

Các interface/type dùng chung trong frontend, mapping từ API response hiện tại.

## Enums

```typescript
type ApartmentStatus = 'available' | 'rented' | 'maintenance'

type ContractStatus = 'active' | 'expired' | 'cancelled'

type PaymentStatus = 'pending' | 'paid' | 'overdue'

type UserRole = 'user' | 'manager'

type NodeType = 'door' | 'elevator' | 'stairs' | 'junction'

type EdgeType = 'hallway' | 'stairs' | 'elevator'

type LodLevel = 'lod2' | 'lod3' | 'lod4'

type IndoorSpaceType = 'unit' | 'room' | 'zone'

type FurnitureLayoutStatus = 'draft' | 'published' | 'archived'
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
  lodLevel?: LodLevel
  description: string | null
  imageUrl: string | null
  model3dUrl: string | null
  location?: string
  footprint?: string | null
  footprintGeoJson?: GeoJsonPolygonGeometry | null
  lng?: number
  lat?: number
  z?: number
  createdAt: string
  updatedAt: string
}
```

### GeoJSON

```typescript
type GeoJsonPointGeometry = {
  type: 'Point'
  coordinates: [number, number] | [number, number, number]
}

type GeoJsonPolygonGeometry = {
  type: 'Polygon'
  coordinates: number[][][]
}

type GeoJsonGeometry = GeoJsonPointGeometry | GeoJsonPolygonGeometry
```

### Floor

```typescript
interface Floor {
  id: number
  buildingId: number
  floorNumber: number
  elevation: string
  floorPlan: string | null
  floorPlanGeoJson?: GeoJsonPolygonGeometry | null
  model3dUrl: string | null
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
  area: string
  numBedrooms: number | null
  numBathrooms: number | null
  rentalPrice: string
  status: ApartmentStatus
  indoorModelUrl: string | null
  indoorLodLevel: LodLevel | null
  createdById: number | null
  updatedById: number | null
  description: string | null
  createdAt: string
  updatedAt: string
}
```

### Tenant

```typescript
interface Tenant {
  id: number
  linkedUserId: number | null
  fullName: string
  phone: string | null
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
  monthlyRent: string
  deposit: string | null
  status: ContractStatus
  note: string | null
  createdById: number | null
  updatedById: number | null
  createdAt: string
  updatedAt: string
}
```

### Payment

```typescript
interface Payment {
  id: number
  contractId: number
  amount: string
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

### Auth

```typescript
interface AuthUser {
  id: number
  username: string
  fullName: string
  email: string | null
  role: UserRole
  isActive: boolean
}

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}
```

### Dashboard

```typescript
interface DashboardOverview {
  totalBuildings: number
  totalApartments: number
  rentedApartments: number
  occupancyRate: number
  activeContracts: number
}

interface BuildingOccupancy {
  buildingId: number
  buildingName: string
  totalApartments: number
  rentedApartments: number
  occupancyRate: number
}

interface MonthlyRevenue {
  month: string
  revenue: string
  count: number
}

interface OccupancyHistoryPoint {
  month: string
  newContracts: number
  activeContracts: number
  occupancyRate: number
}

interface MapSnapshotFeature {
  type: 'Feature'
  geometry: GeoJsonPointGeometry
  properties: {
    id: number
    name: string
    address: string
    district: string | null
    city: string | null
    totalApartments: number
    rentedApartments: number
    availableApartments: number
    occupancyRate: number | string
  }
}

interface MapSnapshotFeatureCollection {
  type: 'FeatureCollection'
  metadata: {
    date: string
  }
  features: MapSnapshotFeature[]
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

### Apartment detail / LoD4

```typescript
interface ApartmentSpace {
  id: number
  apartmentId: number
  parentSpaceId: number | null
  name: string
  spaceType: IndoorSpaceType
  roomType: string | null
  lodLevel: LodLevel
  boundary: string | null
  model3dUrl: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

interface FurnitureCatalogItem {
  id: number
  code: string
  name: string
  category: string
  model3dUrl: string
  defaultWidth: string | null
  defaultDepth: string | null
  defaultHeight: string | null
  metadata: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface FurnitureItem {
  id: number
  layoutId: number
  spaceId: number | null
  catalogId: number
  label: string | null
  position: string
  rotationX: string
  rotationY: string
  rotationZ: string
  scaleX: string
  scaleY: string
  scaleZ: string
  isLocked: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

interface FurnitureLayout {
  id: number
  apartmentId: number
  name: string
  status: FurnitureLayoutStatus
  version: number
  createdById: number | null
  updatedById: number | null
  createdAt: string
  updatedAt: string
  items: FurnitureItem[]
}

interface ApartmentDetailResponse {
  apartment: Apartment
  floor: Floor | null
  building: Building | null
  canViewTenant: boolean
  canViewContract: boolean
  activeContract: RentalContract | null
  tenant: Tenant | null
  spaces: ApartmentSpace[]
  layouts: FurnitureLayout[]
  furnitureCatalog: FurnitureCatalogItem[]
}

interface ApartmentAccessGrant {
  id: number
  apartmentId: number
  userId: number
  canViewTenant: boolean
  canViewContract: boolean
  expiresAt: string | null
  note: string | null
  grantedById: number | null
  createdAt: string | null
  updatedAt: string | null
  username: string
  fullName: string
  email: string | null
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
