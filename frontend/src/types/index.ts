export type ApartmentStatus = "available" | "rented" | "maintenance";
export type ContractStatus = "active" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "overdue";
export type UserRole = "user" | "manager";
export type NodeType = "door" | "elevator" | "stairs" | "junction";
export type EdgeType = "hallway" | "stairs" | "elevator";

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
  token: string;
}

export interface Building {
  id: number;
  name: string;
  address: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  totalFloors: number;
  description: string | null;
  imageUrl: string | null;
  model3dUrl: string | null;
  latitude?: number;
  longitude?: number;
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
}

export interface BuildingGeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
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
}

export interface MapSnapshotFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
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
  description: string | null;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: number;
  fullName: string;
  phone: string;
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
  month: number;
  revenue: number;
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
