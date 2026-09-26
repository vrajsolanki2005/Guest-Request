const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createRequest,
  getRequests,
} = require("../controllers/request.controller");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize("MANAGER", "FRONT_DESK"),
  createRequest
);

router.get(
  "/",
  authorize("MANAGER", "FRONT_DESK", "STAFF"),
  getRequests
);

module.exports = router;