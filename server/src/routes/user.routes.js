const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getMe } = require("../controllers/user.controller");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorize("MANAGER", "FRONT_DESK", "STAFF"),
  getMe
);

module.exports = router;