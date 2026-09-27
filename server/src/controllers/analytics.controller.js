const prisma = require("../config/database");

const getAnalytics = async (req, res, next) => {
  try {
    const hotelId = req.user.hotelId;

    const requests = await prisma.request.findMany({
      where: { hotelId },
      select: {
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        resolvedAt: true,
        slaDeadline: true,
        escalatedAt: true,
      },
    });

    const total = requests.length;
    const open = requests.filter((r) => r.status === "OPEN").length;
    const inProgress = requests.filter(
      (r) => r.status === "ACKNOWLEDGED" || r.status === "IN_PROGRESS",
    ).length;
    const resolved = requests.filter(
      (r) => r.status === "RESOLVED" || r.status === "CLOSED",
    ).length;
    const breached = requests.filter((r) => r.escalatedAt !== null).length;

    const completedRequests = requests.filter((r) => r.resolvedAt !== null);

    const averageResolutionMinutes =
      completedRequests.length === 0
        ? 0
        : Math.round(
            completedRequests.reduce(
              (sum, r) =>
                sum +
                (new Date(r.resolvedAt).getTime() -
                  new Date(r.createdAt).getTime()) /
                  60000,
              0,
            ) / completedRequests.length,
          );

    const priorityBreakdown = ["LOW", "MEDIUM", "HIGH", "URGENT"].map(
      (priority) => ({
        name: priority,
        count: requests.filter((r) => r.priority === priority).length,
      }),
    );

    const categoryBreakdown = [
      "HOUSEKEEPING",
      "MAINTENANCE",
      "ROOM_SERVICE",
      "RECEPTION",
      "OTHER",
    ].map((category) => ({
      name: category.replace("_", " "),
      count: requests.filter((r) => r.category === category).length,
    }));

    const dailyVolume = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      return {
        date: date.toISOString().slice(0, 10),
        count: requests.filter(
          (r) => r.createdAt >= date && r.createdAt < nextDate,
        ).length,
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          total,
          open,
          inProgress,
          resolved,
          breached,
          averageResolutionMinutes,
        },
        priorityBreakdown,
        categoryBreakdown,
        dailyVolume,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
