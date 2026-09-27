const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getGuests, createGuest } = require("../controllers/guest.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getGuests);
router.post("/", authorize("MANAGER", "FRONT_DESK"), createGuest);

module.exports = router;