export type ApartmentStatus = "available" | "rented" | "maintenance";
export type ContractStatus = "active" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "overdue";
export type UserRole = "user" | "manager";
export type NodeType = "door" | "elevator" | "stairs" | "junction";
export type EdgeType = "hallway" | "stairs" | "elevator";
export type LodLevel = "lod2" | "lod3" | "lod4";
export type IndoorSpaceType = "unit" | "room" | "zone";
export type RoomType =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "balcony"
  | "corridor"
  | "storage"
  | "other";
export type FurnitureCategory =
  | "sofa"
  | "table"
  | "chair"
  | "bed"
  | "cabinet"
  | "appliance"
  | "decor"
  | "other";
export type FurnitureLayoutStatus = "draft" | "published" | "archived";

export type GeoJsonPointGeometry = {
  type: "Point";
  coordinates: [number, number] | [number, number, number];
};

export type GeoJsonPolygonGeometry = {
  type: "Polygon";
  coordinates: number[][][];
};

export type GeoJsonGeometry = GeoJsonPointGeometry | GeoJsonPolygonGeometry;

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface Building {
  id: number;
  name: string;
  address: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  totalFloors: number;
  lodLevel?: LodLevel;
  description: string | null;
  imageUrl: string | null;
  model3dUrl: string | null;
  location?: string;
  footprint?: string | null;
  footprintGeoJson?: GeoJsonPolygonGeometry | null;
  lng?: number;
  lat?: number;
  z?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingGeoJsonProperties {
  id: number;
  name: string;
  address: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  totalFloors: number;
  imageUrl: string | null;
  model3dUrl: string | null;
  lodLevel?: LodLevel;
  hasDetailedGeometry?: boolean;
  center?: {
    lng: number;
    lat: number;
    z?: number;
  };
}

export interface BuildingGeoJsonFeature {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: BuildingGeoJsonProperties;
}

export interface BuildingGeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: BuildingGeoJsonFeature[];
}

export interface BuildingOccupancyDetail {
  totalApartments: number;
  rentedApartments: number;
  occupancyRate: number | string;
}

export interface NearbyBuildingResult {
  building: Building;
  distance: number;
}

export interface OccupancyHistoryPoint {
  month: string;
  newContracts: number;
  activeContracts: number;
  occupancyRate: number;
}

export interface MapSnapshotFeature {
  type: "Feature";
  geometry: GeoJsonPointGeometry;
  properties: {
    id: number;
    name: string;
    address: string;
    district: string | null;
    city: string | null;
    totalApartments: number;
    rentedApartments: number;
    availableApartments: number;
    occupancyRate: number | string;
  };
}

export interface MapSnapshotFeatureCollection {
  type: "FeatureCollection";
  metadata: {
    date: string;
  };
  features: MapSnapshotFeature[];
}

export interface Floor {
  id: number;
  buildingId: number;
  floorNumber: number;
  elevation: string;
  floorPlan: string | null;
  floorPlanGeoJson?: GeoJsonPolygonGeometry | null;
  model3dUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Apartment {
  id: number;
  floorId: number;
  entryNodeId: number | null;
  code: string;
  area: string;
  numBedrooms: number | null;
  numBathrooms: number | null;
  rentalPrice: string;
  status: ApartmentStatus;
  indoorModelUrl: string | null;
  indoorLodLevel: LodLevel | null;
  description: string | null;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: number;
  linkedUserId: number | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  idCard: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalContract {
  id: number;
  apartmentId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  deposit: string | null;
  status: ContractStatus;
  note: string | null;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  contractId: number;
  amount: string;
  paymentDate: string;
  status: PaymentStatus;
  note: string | null;
  createdAt: string;
}

export interface DashboardOverview {
  totalBuildings: number;
  totalApartments: number;
  rentedApartments: number;
  occupancyRate: number;
  activeContracts: number;
}

export interface BuildingOccupancy {
  buildingId: number;
  buildingName: string;
  totalApartments: number;
  rentedApartments: number;
  occupancyRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: string;
  count: number;
}

// Navigation / Topology
export interface NavigationNode {
  id: number;
  floorId: number;
  nodeType: NodeType;
  label: string | null;
  lng: number;
  lat: number;
  z: number;
  localX: number | null;
  localY: number | null;
  localZ: number | null;
  meshRef: string | null;
  metadata: Record<string, unknown> | null;
  apartmentId: number | null;
  apartmentCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationEdge {
  id: number;
  startNodeId: number;
  endNodeId: number;
  edgeType: EdgeType;
  distance: string;
  travelTime: string | null;
  isAccessible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingGraph {
  nodes: NavigationNode[];
  edges: NavigationEdge[];
}

export interface ApartmentSpace {
  id: number;
  apartmentId: number;
  parentSpaceId: number | null;
  name: string;
  spaceType: IndoorSpaceType;
  roomType: RoomType | null;
  lodLevel: LodLevel;
  boundary: string | null;
  model3dUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface FurnitureCatalogItem {
  id: number;
  code: string;
  name: string;
  category: FurnitureCategory;
  model3dUrl: string;
  defaultWidth: string | null;
  defaultDepth: string | null;
  defaultHeight: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FurnitureItem {
  id: number;
  layoutId: number;
  spaceId: number | null;
  catalogId: number;
  label: string | null;
  position: string;
  rotationX: string;
  rotationY: string;
  rotationZ: string;
  scaleX: string;
  scaleY: string;
  scaleZ: string;
  isLocked: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface FurnitureLayout {
  id: number;
  apartmentId: number;
  name: string;
  status: FurnitureLayoutStatus;
  version: number;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
  items: FurnitureItem[];
}

export interface ApartmentDetailResponse {
  apartment: Apartment;
  floor: Floor | null;
  building: Building | null;
  canViewTenant: boolean;
  canViewContract: boolean;
  activeContract: RentalContract | null;
  tenant: Tenant | null;
  spaces: ApartmentSpace[];
  layouts: FurnitureLayout[];
  furnitureCatalog: FurnitureCatalogItem[];
}

export interface ApartmentAccessGrant {
  id: number;
  apartmentId: number;
  userId: number;
  canViewTenant: boolean;
  canViewContract: boolean;
  expiresAt: string | null;
  note: string | null;
  grantedById: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  username: string;
  fullName: string;
  email: string | null;
}
