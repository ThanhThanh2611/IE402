CREATE TABLE "auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"last_used_at" timestamp,
	"user_agent" text,
	"ip_address" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "furniture_layout_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"source_layout_id" integer,
	"created_by_id" integer,
	"updated_by_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "buildings" ADD COLUMN "footprint" geometry(PolygonZ, 4326);--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "elevation" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "floor_plan" geometry(PolygonZ, 4326);--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "model_3d_url" varchar(500);--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD COLUMN "local_x" numeric(12, 3);--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD COLUMN "local_y" numeric(12, 3);--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD COLUMN "local_z" numeric(12, 3);--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD COLUMN "mesh_ref" varchar(255);--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_layout_templates" ADD CONSTRAINT "furniture_layout_templates_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_layout_templates" ADD CONSTRAINT "furniture_layout_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furniture_layout_templates" ADD CONSTRAINT "furniture_layout_templates_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;