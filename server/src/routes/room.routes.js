const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getRooms, createRoom } = require("../controllers/room.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getRooms);
router.post("/", authorize("MANAGER", "FRONT_DESK"), createRoom);

module.exports = router;