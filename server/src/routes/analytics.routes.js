
const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getAnalytics,
} = require("../controllers/analytics.controller");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("MANAGER"), getAnalytics);

module.exports = router;