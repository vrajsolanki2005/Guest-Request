const prisma = require("../config/db");
const { scheduleSlaCheck } = require("../jobs/sla.job");
const SLA_MINUTES = {
  LOW: 60,
  MEDIUM: 30,
  HIGH: 15,
  URGENT: 5,
};

const createRequest = async (req, res, next) => {
  try {
    const { roomId, guestId, category, priority, description } = req.body;

    if (!roomId || !guestId || !category || !priority || !description) {
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
    const slaDeadline = new Date(Date.now() + minutes * 60 * 1000);
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

    await scheduleSlaCheck(request);

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

const assignRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "staffId is required",
      });
    }

    const request = await prisma.request.findFirst({
      where: {
        id: requestId,
        hotelId: req.user.hotelId,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const staff = await prisma.user.findFirst({
      where: {
        id: staffId,
        hotelId: req.user.hotelId,
        role: "STAFF",
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const updatedRequest = await prisma.request.update({
      where: {
        id: requestId,
      },
      data: {
        assignedToId: staffId,
        events: {
          create: {
            userId: req.user.userId,
            eventType: "ASSIGNED",
            metadata: {
              staffId,
              staffName: staff.name,
            },
          },
        },
      },
      include: {
        room: true,
        guest: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Request assigned successfully",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "OPEN",
      "ACKNOWLEDGED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const request = await prisma.request.findFirst({
      where: {
        id: requestId,
        hotelId: req.user.hotelId,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const transitions = {
      OPEN: ["ACKNOWLEDGED"],
      ACKNOWLEDGED: ["IN_PROGRESS"],
      IN_PROGRESS: ["RESOLVED"],
      RESOLVED: ["CLOSED"],
      CLOSED: [],
    };

    if (!transitions[request.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${request.status} to ${status}`,
      });
    }

    if (
      ["STAFF"].includes(req.user.role) &&
      request.assignedToId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update requests assigned to you",
      });
    }

    const eventMap = {
      ACKNOWLEDGED: "ACKNOWLEDGED",
      IN_PROGRESS: "STARTED",
      RESOLVED: "RESOLVED",
      CLOSED: "CLOSED",
    };

    const updateData = {
      status,
      events: {
        create: {
          userId: req.user.userId,
          eventType: eventMap[status],
        },
      },
    };

    if (status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    }

    const updatedRequest = await prisma.request.update({
      where: {
        id: requestId,
      },
      data: updateData,
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
    });

    res.json({
      success: true,
      message: `Request marked as ${status}`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  assignRequest,
  updateRequestStatus,
};
