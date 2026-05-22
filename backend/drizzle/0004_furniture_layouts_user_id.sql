ALTER TABLE "furniture_layouts" ADD COLUMN IF NOT EXISTS "user_id" integer;--> statement-breakpoint
ALTER TABLE "furniture_layouts" ADD CONSTRAINT "furniture_layouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
