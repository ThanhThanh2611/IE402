import express from "express";
import cors from "cors";
import "dotenv/config";

import buildingsRouter from "./routes/buildings";
import floorsRouter from "./routes/floors";
import apartmentsRouter from "./routes/apartments";
import contractsRouter from "./routes/contracts";
import tenantsRouter from "./routes/tenants";
import paymentsRouter from "./routes/payments";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import statusHistoryRouter from "./routes/statusHistory";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/buildings", buildingsRouter);
app.use("/api/floors", floorsRouter);
app.use("/api/apartments", apartmentsRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/tenants", tenantsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/status-history", statusHistoryRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
