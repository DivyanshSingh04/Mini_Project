const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to e-GramSAARTHI API 🌾",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
