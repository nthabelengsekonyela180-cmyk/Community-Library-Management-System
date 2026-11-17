require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", message: "Community Library API and database are connected." });
  } catch {
    res.status(503).json({ status: "error", message: "API is running, but the database is unavailable." });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => res.status(404).json({ message: "API route not found." }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Server error. Check the backend terminal for details." });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Community Library API listening on http://localhost:${port}`));
