const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/error.middleware");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roomRoutes = require("./routes/room.routes");
const guestRoutes = require("./routes/guest.routes");
const staffRoutes = require("./routes/staff.routes");
const requestRoutes = require("./routes/request.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

const allowedOrigins = (env.clientUrl || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GuestRequest API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/health", healthRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
