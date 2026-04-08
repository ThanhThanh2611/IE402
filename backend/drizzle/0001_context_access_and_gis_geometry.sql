ALTER TABLE "buildings" ADD COLUMN "footprint" geometry(PolygonZ, 4326);
--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "elevation" numeric(10, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "floor_plan" geometry(PolygonZ, 4326);
--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "model_3d_url" varchar(500);
--> statement-breakpoint
CREATE TABLE "apartment_access_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"can_view_tenant" boolean DEFAULT false NOT NULL,
	"can_view_contract" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"granted_by_id" integer,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "apartment_access_grants_apartment_id_user_id_unique" UNIQUE("apartment_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "apartment_access_grants" ADD CONSTRAINT "apartment_access_grants_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "apartment_access_grants" ADD CONSTRAINT "apartment_access_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "apartment_access_grants" ADD CONSTRAINT "apartment_access_grants_granted_by_id_users_id_fk" FOREIGN KEY ("granted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
