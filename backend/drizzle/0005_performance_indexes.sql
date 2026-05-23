-- Performance indexes for frequently queried columns
-- apartments
CREATE INDEX IF NOT EXISTS "idx_apartments_floor_id" ON "apartments"("floor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apartments_status" ON "apartments"("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apartments_deleted_at" ON "apartments"("deleted_at") WHERE "deleted_at" IS NULL;--> statement-breakpoint

-- floors
CREATE INDEX IF NOT EXISTS "idx_floors_building_id" ON "floors"("building_id");--> statement-breakpoint

-- rental_contracts
CREATE INDEX IF NOT EXISTS "idx_rental_contracts_apartment_id" ON "rental_contracts"("apartment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rental_contracts_tenant_id" ON "rental_contracts"("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rental_contracts_status" ON "rental_contracts"("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rental_contracts_deleted_at" ON "rental_contracts"("deleted_at") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rental_contracts_dates" ON "rental_contracts"("start_date", "end_date");--> statement-breakpoint

-- payments — composite index cho revenue queries (status + date range)
CREATE INDEX IF NOT EXISTS "idx_payments_status_date" ON "payments"("status", "payment_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_deleted_at" ON "payments"("deleted_at") WHERE "deleted_at" IS NULL;--> statement-breakpoint

-- furniture
CREATE INDEX IF NOT EXISTS "idx_furniture_layouts_apartment_id" ON "furniture_layouts"("apartment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_furniture_items_layout_id" ON "furniture_items"("layout_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apartment_spaces_apartment_id" ON "apartment_spaces"("apartment_id");--> statement-breakpoint

-- navigation
CREATE INDEX IF NOT EXISTS "idx_navigation_nodes_floor_id" ON "navigation_nodes"("floor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_navigation_edges_start_node" ON "navigation_edges"("start_node_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_navigation_edges_end_node" ON "navigation_edges"("end_node_id");--> statement-breakpoint

-- users
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users"("deleted_at") WHERE "deleted_at" IS NULL;--> statement-breakpoint

-- apartment_access_grants
CREATE INDEX IF NOT EXISTS "idx_apartment_access_grants_apartment_id" ON "apartment_access_grants"("apartment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apartment_access_grants_user_id" ON "apartment_access_grants"("user_id");--> statement-breakpoint
