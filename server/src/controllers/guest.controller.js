const prisma = require("../config/db");

const getGuests = async (req, res, next) => {
  try {
    const guests = await prisma.guest.findMany({
      where: { hotelId: req.user.hotelId },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: guests });
  } catch (error) {
    next(error);
  }
};

const createGuest = async (req, res, next) => {
  try {
    const { name, roomId } = req.body;

    if (!name?.trim() || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Guest name and room are required",
      });
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        hotelId: req.user.hotelId,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const guest = await prisma.guest.create({
      data: {
        name: name.trim(),
        roomId,
        hotelId: req.user.hotelId,
      },
      include: { room: true },
    });

    res.status(201).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGuests, createGuest };
