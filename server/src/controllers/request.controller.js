const prisma = require("../config/db");

const SLA_MINUTES = {
  LOW: 60,
  MEDIUM: 30,
  HIGH: 15,
  URGENT: 5,
};

const createRequest = async (req, res, next) => {
  try {
    const {
      roomId,
      guestId,
      category,
      priority,
      description,
    } = req.body;

    if (
      !roomId ||
      !guestId ||
      !category ||
      !priority ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All request fields are required",
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

    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        hotelId: req.user.hotelId,
      },
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    const minutes = SLA_MINUTES[priority];

    const slaDeadline = new Date(
      Date.now() + minutes * 60 * 1000
    );

    const request = await prisma.request.create({
      data: {
        hotelId: req.user.hotelId,
        roomId,
        guestId,
        category,
        priority,
        description,
        slaDeadline,
        events: {
          create: {
            userId: req.user.userId,
            eventType: "CREATED",
            metadata: {
              priority,
              slaMinutes: minutes,
            },
          },
        },
      },
      include: {
        room: true,
        guest: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Request created",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      where: {
        hotelId: req.user.hotelId,
      },
      include: {
        room: true,
        guest: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
};