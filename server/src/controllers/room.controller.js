const prisma = require("../config/db");

const getRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { hotelId: req.user.hotelId },
      orderBy: { roomNumber: "asc" },
    });

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { roomNumber } = req.body;

    if (!roomNumber || !String(roomNumber).trim()) {
      return res.status(400).json({
        success: false,
        message: "Room number is required",
      });
    }

    const room = await prisma.room.create({
      data: {
        hotelId: req.user.hotelId,
        roomNumber: String(roomNumber).trim(),
      },
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Room number already exists",
      });
    }
    next(error);
  }
};

module.exports = { getRooms, createRoom };
