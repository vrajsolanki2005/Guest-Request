const express = require("express");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/requests", requestRoutes);

module.exports = router;