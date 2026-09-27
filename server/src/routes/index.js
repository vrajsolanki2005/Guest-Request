const express = require("express");

const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const requestRoutes = require("./request.routes");
const roomRoutes = require("./room.routes");
const guestRoutes = require("./guest.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/requests", requestRoutes);
router.use("/rooms", roomRoutes);
router.use("/guests", guestRoutes);

module.exports = router;