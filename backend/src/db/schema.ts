import {
  AnyPgColumn,
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
  jsonb,
} from "drizzle-orm/pg-core";

// Custom PostGIS geometry types cho dữ liệu không gian 3D
const pointGeometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geometry(PointZ, 4326)";
  },
  toDriver(value: string): string {
    return value;
  },
  fromDriver(value: string): string {
    return value;
  },
});

const polygonGeometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geometry(PolygonZ, 4326)";
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

export const nodeTypeEnum = pgEnum("node_type", [
  "door",
  "elevator",
  "stairs",
  "junction",
]);

export const edgeTypeEnum = pgEnum("edge_type", [
  "hallway",
  "stairs",
  "elevator",
]);

export const lodLevelEnum = pgEnum("lod_level", ["lod2", "lod3", "lod4"]);

export const indoorSpaceTypeEnum = pgEnum("indoor_space_type", [
  "unit",
  "room",
  "zone",
]);

export const roomTypeEnum = pgEnum("room_type", [
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "balcony",
  "corridor",
  "storage",
  "other",
]);

export const furnitureCategoryEnum = pgEnum("furniture_category", [
  "sofa",
  "table",
  "chair",
  "bed",
  "cabinet",
  "appliance",
  "decor",
  "other",
]);

export const furnitureLayoutStatusEnum = pgEnum("furniture_layout_status", [
  "draft",
  "published",
  "archived",
]);

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

// Auth Sessions — phiên đăng nhập dùng cho refresh token rotation / revoke
export const authSessions = pgTable("auth_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  refreshTokenHash: varchar("refresh_token_hash", { length: 255 })
    .notNull()
    .unique(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  lastUsedAt: timestamp("last_used_at"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Buildings
export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  ward: varchar("ward", { length: 100 }),
  district: varchar("district", { length: 100 }),
  city: varchar("city", { length: 100 }),
  location: pointGeometry("location").notNull(),
  footprint: polygonGeometry("footprint"),
  totalFloors: integer("total_floors").notNull(),
  lodLevel: lodLevelEnum("lod_level").notNull().default("lod3"),
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
    elevation: decimal("elevation", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    floorPlan: polygonGeometry("floor_plan"),
    model3dUrl: varchar("model_3d_url", { length: 500 }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique().on(table.buildingId, table.floorNumber)]
);

// Navigation Nodes — điểm giao cắt trong mạng lưới tòa nhà (cửa, thang máy, cầu thang, sảnh)
export const navigationNodes = pgTable("navigation_nodes", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id")
    .notNull()
    .references(() => floors.id),
  nodeType: nodeTypeEnum("node_type").notNull(),
  label: varchar("label", { length: 255 }),
  location: pointGeometry("location").notNull(), // PointZ (x, y, z) — z xác định tầng
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Navigation Edges — đường nối giữa các nodes (hành lang, cầu thang, thang máy)
export const navigationEdges = pgTable("navigation_edges", {
  id: serial("id").primaryKey(),
  startNodeId: integer("start_node_id")
    .notNull()
    .references(() => navigationNodes.id),
  endNodeId: integer("end_node_id")
    .notNull()
    .references(() => navigationNodes.id),
  edgeType: edgeTypeEnum("edge_type").notNull().default("hallway"),
  distance: decimal("distance", { precision: 10, scale: 2 }).notNull(),
  travelTime: decimal("travel_time", { precision: 10, scale: 2 }),
  isAccessible: boolean("is_accessible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Apartments — thêm entryNodeId liên kết căn hộ với mạng lưới navigation
export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id")
    .notNull()
    .references(() => floors.id),
  entryNodeId: integer("entry_node_id").references(() => navigationNodes.id),
  code: varchar("code", { length: 50 }).notNull().unique(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  numBedrooms: integer("num_bedrooms"),
  numBathrooms: integer("num_bathrooms"),
  rentalPrice: decimal("rental_price", { precision: 15, scale: 2 }).notNull(),
  status: apartmentStatusEnum("status").notNull().default("available"),
  indoorModelUrl: varchar("indoor_model_url", { length: 500 }),
  indoorLodLevel: lodLevelEnum("indoor_lod_level").default("lod4"),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id),
  updatedById: integer("updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Tenants — thực thể nghiệp vụ khách thuê, có thể liên kết tùy chọn với tài khoản đăng nhập
export const tenants = pgTable(
  "tenants",
  {
    id: serial("id").primaryKey(),
    linkedUserId: integer("linked_user_id").references(() => users.id),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }),
    idCard: varchar("id_card", { length: 20 }).notNull().unique(),
    address: varchar("address", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [unique().on(table.linkedUserId)]
);

// Apartment Access Grants — cấp quyền xem tenant/contract theo từng căn hộ cho user cụ thể
export const apartmentAccessGrants = pgTable(
  "apartment_access_grants",
  {
    id: serial("id").primaryKey(),
    apartmentId: integer("apartment_id")
      .notNull()
      .references(() => apartments.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    canViewTenant: boolean("can_view_tenant").notNull().default(false),
    canViewContract: boolean("can_view_contract").notNull().default(false),
    expiresAt: timestamp("expires_at"),
    grantedById: integer("granted_by_id").references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique().on(table.apartmentId, table.userId)]
);

// Apartment Spaces — mô hình không gian trong căn hộ (LoD4)
export const apartmentSpaces = pgTable(
  "apartment_spaces",
  {
    id: serial("id").primaryKey(),
    apartmentId: integer("apartment_id")
      .notNull()
      .references(() => apartments.id),
    parentSpaceId: integer("parent_space_id").references(
      (): AnyPgColumn => apartmentSpaces.id
    ),
    name: varchar("name", { length: 255 }).notNull(),
    spaceType: indoorSpaceTypeEnum("space_type").notNull().default("room"),
    roomType: roomTypeEnum("room_type"),
    lodLevel: lodLevelEnum("lod_level").notNull().default("lod4"),
    boundary: polygonGeometry("boundary"),
    model3dUrl: varchar("model_3d_url", { length: 500 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique().on(table.apartmentId, table.name)]
);

// Furniture Catalog — thư viện đồ nội thất dùng cho kéo/thả
export const furnitureCatalog = pgTable("furniture_catalog", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: furnitureCategoryEnum("category").notNull().default("other"),
  model3dUrl: varchar("model_3d_url", { length: 500 }).notNull(),
  defaultWidth: decimal("default_width", { precision: 10, scale: 2 }),
  defaultDepth: decimal("default_depth", { precision: 10, scale: 2 }),
  defaultHeight: decimal("default_height", { precision: 10, scale: 2 }),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Furniture Layouts — phiên bản bố cục nội thất của từng căn hộ
export const furnitureLayouts = pgTable("furniture_layouts", {
  id: serial("id").primaryKey(),
  apartmentId: integer("apartment_id")
    .notNull()
    .references(() => apartments.id),
  name: varchar("name", { length: 255 }).notNull(),
  status: furnitureLayoutStatusEnum("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  createdById: integer("created_by_id").references(() => users.id),
  updatedById: integer("updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Furniture Items — từng instance nội thất được đặt trong layout
export const furnitureItems = pgTable("furniture_items", {
  id: serial("id").primaryKey(),
  layoutId: integer("layout_id")
    .notNull()
    .references(() => furnitureLayouts.id),
  spaceId: integer("space_id").references(() => apartmentSpaces.id),
  catalogId: integer("catalog_id")
    .notNull()
    .references(() => furnitureCatalog.id),
  label: varchar("label", { length: 255 }),
  position: pointGeometry("position").notNull(),
  rotationX: decimal("rotation_x", { precision: 8, scale: 2 })
    .notNull()
    .default("0"),
  rotationY: decimal("rotation_y", { precision: 8, scale: 2 })
    .notNull()
    .default("0"),
  rotationZ: decimal("rotation_z", { precision: 8, scale: 2 })
    .notNull()
    .default("0"),
  scaleX: decimal("scale_x", { precision: 8, scale: 2 })
    .notNull()
    .default("1"),
  scaleY: decimal("scale_y", { precision: 8, scale: 2 })
    .notNull()
    .default("1"),
  scaleZ: decimal("scale_z", { precision: 8, scale: 2 })
    .notNull()
    .default("1"),
  isLocked: boolean("is_locked").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
