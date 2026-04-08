CREATE TYPE "public"."apartment_status" AS ENUM('available', 'rented', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."edge_type" AS ENUM('hallway', 'stairs', 'elevator');--> statement-breakpoint
CREATE TYPE "public"."furniture_category" AS ENUM('sofa', 'table', 'chair', 'bed', 'cabinet', 'appliance', 'decor', 'other');--> statement-breakpoint
CREATE TYPE "public"."furniture_layout_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."indoor_space_type" AS ENUM('unit', 'room', 'zone');--> statement-breakpoint
CREATE TYPE "public"."lod_level" AS ENUM('lod2', 'lod3', 'lod4');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('door', 'elevator', 'stairs', 'junction');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('living_room', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'corridor', 'storage', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'manager');--> statement-breakpoint
CREATE TABLE "apartment_spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer NOT NULL,
	"parent_space_id" integer,
	"name" varchar(255) NOT NULL,
	"space_type" "indoor_space_type" DEFAULT 'room' NOT NULL,
	"room_type" "room_type",
	"lod_level" "lod_level" DEFAULT 'lod4' NOT NULL,
	"boundary" geometry(PolygonZ, 4326),
	"model_3d_url" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "apartment_spaces_apartment_id_name_unique" UNIQUE("apartment_id","name")
);
--> statement-breakpoint
CREATE TABLE "apartment_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer NOT NULL,
	"status" "apartment_status" NOT NULL,
	"changed_by_id" integer,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "apartments" (
	"id" serial PRIMARY KEY NOT NULL,
	"floor_id" integer NOT NULL,
	"entry_node_id" integer,
	"code" varchar(50) NOT NULL,
	"area" numeric(10, 2) NOT NULL,
	"num_bedrooms" integer,
	"num_bathrooms" integer,
	"rental_price" numeric(15, 2) NOT NULL,
	"status" "apartment_status" DEFAULT 'available' NOT NULL,
	"indoor_model_url" varchar(500),
	"indoor_lod_level" "lod_level" DEFAULT 'lod4',
	"description" text,
	"created_by_id" integer,
	"updated_by_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "apartments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"ward" varchar(100),
	"district" varchar(100),
	"city" varchar(100),
	"location" geometry(PointZ, 4326) NOT NULL,
	"total_floors" integer NOT NULL,
	"lod_level" "lod_level" DEFAULT 'lod3' NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"model_3d_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"floor_number" integer NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "floors_building_id_floor_number_unique" UNIQUE("building_id","floor_number")
);
--> statement-breakpoint
CREATE TABLE "furniture_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "furniture_category" DEFAULT 'other' NOT NULL,
	"model_3d_url" varchar(500) NOT NULL,
	"default_width" numeric(10, 2),
	"default_depth" numeric(10, 2),
	"default_height" numeric(10, 2),
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "furniture_catalog_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "furniture_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"layout_id" integer NOT NULL,
	"space_id" integer,
	"catalog_id" integer NOT NULL,
	"label" varchar(255),
	"position" geometry(PointZ, 4326) NOT NULL,
	"rotation_x" numeric(8, 2) DEFAULT '0' NOT NULL,
	"rotation_y" numeric(8, 2) DEFAULT '0' NOT NULL,
	"rotation_z" numeric(8, 2) DEFAULT '0' NOT NULL,
	"scale_x" numeric(8, 2) DEFAULT '1' NOT NULL,
	"scale_y" numeric(8, 2) DEFAULT '1' NOT NULL,
	"scale_z" numeric(8, 2) DEFAULT '1' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "furniture_layouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "furniture_layout_status" DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" integer,
	"updated_by_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "navigation_edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_node_id" integer NOT NULL,
	"end_node_id" integer NOT NULL,
	"edge_type" "edge_type" DEFAULT 'hallway' NOT NULL,
	"distance" numeric(10, 2) NOT NULL,
	"travel_time" numeric(10, 2),
	"is_accessible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "navigation_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"floor_id" integer NOT NULL,
	"node_type" "node_type" NOT NULL,
	"label" varchar(255),
	"location" geometry(PointZ, 4326) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"status" "payment_status" DEFAULT 'paid' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rental_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"monthly_rent" numeric(15, 2) NOT NULL,
	"deposit" numeric(15, 2),
	"status" "contract_status" DEFAULT 'active' NOT NULL,
	"note" text,
	"created_by_id" integer,
	"updated_by_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"linked_user_id" integer,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"id_card" varchar(20) NOT NULL,
	"address" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "tenants_id_card_unique" UNIQUE("id_card"),
	CONSTRAINT "tenants_linked_user_id_unique" UNIQUE("linked_user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "apartment_spaces" ADD CONSTRAINT "apartment_spaces_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_spaces" ADD CONSTRAINT "apartment_spaces_parent_space_id_apartment_spaces_id_fk" FOREIGN KEY ("parent_space_id") REFERENCES "public"."apartment_spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_status_history" ADD CONSTRAINT "apartment_status_history_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_status_history" ADD CONSTRAINT "apartment_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_entry_node_id_navigation_nodes_id_fk" FOREIGN KEY ("entry_node_id") REFERENCES "public"."navigation_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_items" ADD CONSTRAINT "furniture_items_layout_id_furniture_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."furniture_layouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_items" ADD CONSTRAINT "furniture_items_space_id_apartment_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."apartment_spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_items" ADD CONSTRAINT "furniture_items_catalog_id_furniture_catalog_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."furniture_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_layouts" ADD CONSTRAINT "furniture_layouts_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_layouts" ADD CONSTRAINT "furniture_layouts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_layouts" ADD CONSTRAINT "furniture_layouts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_edges" ADD CONSTRAINT "navigation_edges_start_node_id_navigation_nodes_id_fk" FOREIGN KEY ("start_node_id") REFERENCES "public"."navigation_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_edges" ADD CONSTRAINT "navigation_edges_end_node_id_navigation_nodes_id_fk" FOREIGN KEY ("end_node_id") REFERENCES "public"."navigation_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD CONSTRAINT "navigation_nodes_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_rental_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."rental_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_linked_user_id_users_id_fk" FOREIGN KEY ("linked_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;