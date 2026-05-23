import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";

import { authenticate, requireManager } from "./middleware/auth";
import buildingsRouter from "./routes/buildings";
import floorsRouter from "./routes/floors";
import apartmentsRouter from "./routes/apartments";
import contractsRouter from "./routes/contracts";
import tenantsRouter from "./routes/tenants";
import paymentsRouter from "./routes/payments";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import statusHistoryRouter from "./routes/statusHistory";
import usersRouter from "./routes/users";
import navigationRouter from "./routes/navigation";
import furnitureCatalogRouter from "./routes/furnitureCatalog";
import furnitureLayoutTemplatesRouter from "./routes/furnitureLayoutTemplates";
import { syncFurnitureCatalog } from "./db/sync-catalog";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mở Public thư mục uploads để FE có thể truy cập link Model 3D
// Filename gồm timestamp nên immutable — browser/CDN cache 1 năm, không re-download
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: "365d",
    immutable: true,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// Public routes
app.use("/api/auth", authRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Protected routes (require login)
app.use("/api/buildings", authenticate, buildingsRouter);
app.use("/api/floors", authenticate, floorsRouter);
app.use("/api/apartments", authenticate, apartmentsRouter);
app.use("/api/dashboard", authenticate, dashboardRouter);
app.use("/api/contracts", authenticate, contractsRouter);

// Manager-only routes
app.use("/api/tenants", authenticate, requireManager, tenantsRouter);
app.use("/api/payments", authenticate, requireManager, paymentsRouter);
app.use("/api/status-history", authenticate, requireManager, statusHistoryRouter);
app.use("/api/users", authenticate, requireManager, usersRouter);
app.use("/api/navigation", authenticate, navigationRouter);
app.use("/api/furniture-catalog", authenticate, furnitureCatalogRouter);
app.use("/api/furniture-layout-templates", authenticate, furnitureLayoutTemplatesRouter);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  void syncFurnitureCatalog().catch((err) => {
    console.error("Lỗi khi đồng bộ danh mục nội thất:", err);
  });
});
