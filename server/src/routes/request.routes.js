const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createRequest,
  getRequests,
  assignRequest,
  updateRequestStatus,
} = require("../controllers/request.controller");

const router = express.Router();

router.use(authenticate);


// Create request
router.post(
  "/",
  authorize("MANAGER", "FRONT_DESK"),
  createRequest
);


// Get all requests
router.get(
  "/",
  authorize("MANAGER", "FRONT_DESK", "STAFF"),
  getRequests
);


// Assign request to staff
router.patch(
  "/:requestId/assign",
  authorize("MANAGER", "FRONT_DESK"),
  assignRequest
);


// Update request status
router.patch(
  "/:requestId/status",
  authorize("MANAGER", "FRONT_DESK", "STAFF"),
  updateRequestStatus
);

module.exports = router;