export type ApartmentStatus = "available" | "rented" | "maintenance";
export type ContractStatus = "active" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "overdue";
export type UserRole = "user" | "manager";

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
