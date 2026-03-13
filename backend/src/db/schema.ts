import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  date,
  pgEnum,
  unique,
  customType,
  boolean,
} from "drizzle-orm/pg-core";

// Custom PostGIS geometry type tương thích với drizzle-kit
const geometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geometry(Point, 4326)";
  },
  toDriver(value: string): string {
    return value;
  },
  fromDriver(value: string): string {
    return value;
  },
});

// Enums
export const apartmentStatusEnum = pgEnum("apartment_status", [
  "available",
  "rented",
  "maintenance",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "active",
  "expired",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "overdue",
]);

export const userRoleEnum = pgEnum("user_role", ["user", "manager"]);

// Users (đặt trước vì các bảng khác reference đến)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  role: userRoleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Buildings
export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  ward: varchar("ward", { length: 100 }),
  district: varchar("district", { length: 100 }),
  city: varchar("city", { length: 100 }),
  location: geometry("location").notNull(),
  totalFloors: integer("total_floors").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  model3dUrl: varchar("model_3d_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Floors
export const floors = pgTable(
  "floors",
  {
    id: serial("id").primaryKey(),
    buildingId: integer("building_id")
      .notNull()
      .references(() => buildings.id),
    floorNumber: integer("floor_number").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique().on(table.buildingId, table.floorNumber)]
);

// Apartments
export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id")
    .notNull()
    .references(() => floors.id),
  code: varchar("code", { length: 50 }).notNull().unique(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  numBedrooms: integer("num_bedrooms"),
  numBathrooms: integer("num_bathrooms"),
  rentalPrice: decimal("rental_price", { precision: 15, scale: 2 }).notNull(),
  status: apartmentStatusEnum("status").notNull().default("available"),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id),
  updatedById: integer("updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Tenants
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  idCard: varchar("id_card", { length: 20 }).notNull().unique(),
  address: varchar("address", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Rental Contracts
export const rentalContracts = pgTable("rental_contracts", {
  id: serial("id").primaryKey(),
  apartmentId: integer("apartment_id")
    .notNull()
    .references(() => apartments.id),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 15, scale: 2 }).notNull(),
  deposit: decimal("deposit", { precision: 15, scale: 2 }),
  status: contractStatusEnum("status").notNull().default("active"),
  note: text("note"),
  createdById: integer("created_by_id").references(() => users.id),
  updatedById: integer("updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id")
    .notNull()
    .references(() => rentalContracts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  status: paymentStatusEnum("status").notNull().default("paid"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Apartment Status History
export const apartmentStatusHistory = pgTable("apartment_status_history", {
  id: serial("id").primaryKey(),
  apartmentId: integer("apartment_id")
    .notNull()
    .references(() => apartments.id),
  status: apartmentStatusEnum("status").notNull(),
  changedById: integer("changed_by_id").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  note: text("note"),
});
