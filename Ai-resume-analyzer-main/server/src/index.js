import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();
dotenv.config();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/resume", resumeRoutes);

// Centralized error handler (e.g. multer file-type/size errors)
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || "Unexpected error." });
  }
  next();
});

const PORT = process.env.PORT || 5000;

// Start serving immediately; Mongo connects in the background so the
// parse/match endpoints (which only need Groq) aren't blocked by it.
app.listen(PORT, () => {
  console.log(`[server] Resume Analyzer API listening on http://localhost:${PORT}`);
});

connectDB();
