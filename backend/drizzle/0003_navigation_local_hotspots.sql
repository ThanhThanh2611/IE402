ALTER TABLE "navigation_nodes"
ADD COLUMN "local_x" numeric(12, 3),
ADD COLUMN "local_y" numeric(12, 3),
ADD COLUMN "local_z" numeric(12, 3),
ADD COLUMN "mesh_ref" varchar(255),
ADD COLUMN "metadata" jsonb;
