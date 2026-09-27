const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const requestRoutes = require("./routes/request.routes");
const roomRoutes = require("./routes/room.routes");
const guestRoutes = require("./routes/guest.routes");
const staffRoutes = require("./routes/staff.routes");
const errorHandler = require("./middleware/error.middleware");
const env = require("./config/env");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/staff", staffRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;