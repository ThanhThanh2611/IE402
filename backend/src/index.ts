import express from "express";
import cors from "cors";
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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Manager-only routes
app.use("/api/contracts", authenticate, requireManager, contractsRouter);
app.use("/api/tenants", authenticate, requireManager, tenantsRouter);
app.use("/api/payments", authenticate, requireManager, paymentsRouter);
app.use("/api/status-history", authenticate, requireManager, statusHistoryRouter);
app.use("/api/users", authenticate, requireManager, usersRouter);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
