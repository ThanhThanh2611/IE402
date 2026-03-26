CREATE TYPE "public"."edge_type" AS ENUM('hallway', 'stairs', 'elevator');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('door', 'elevator', 'stairs', 'junction');--> statement-breakpoint
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
ALTER TABLE "buildings" ALTER COLUMN "location" SET DATA TYPE geometry(PointZ, 4326);--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "entry_node_id" integer;--> statement-breakpoint
ALTER TABLE "navigation_edges" ADD CONSTRAINT "navigation_edges_start_node_id_navigation_nodes_id_fk" FOREIGN KEY ("start_node_id") REFERENCES "public"."navigation_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_edges" ADD CONSTRAINT "navigation_edges_end_node_id_navigation_nodes_id_fk" FOREIGN KEY ("end_node_id") REFERENCES "public"."navigation_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_nodes" ADD CONSTRAINT "navigation_nodes_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_entry_node_id_navigation_nodes_id_fk" FOREIGN KEY ("entry_node_id") REFERENCES "public"."navigation_nodes"("id") ON DELETE no action ON UPDATE no action;