import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/db.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import taxRoutes from "./routes/taxRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import riskRoutes from "./routes/riskRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import aiHistoryRoutes from "./routes/aiHistoryRoutes.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/history", aiHistoryRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("🚀 CryptoVault Backend is Running...");
});

// Database Connection
pool.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("❌ Database Connection Error:", err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});