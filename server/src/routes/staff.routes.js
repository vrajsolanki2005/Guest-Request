const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  getStaff,
  createStaff,
} = require("../controllers/staff.controller");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize("MANAGER", "FRONT_DESK"),
  getStaff
);

router.post(
  "/",
  authorize("MANAGER"),
  createStaff
);

module.exports = router;