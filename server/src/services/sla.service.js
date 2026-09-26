const prisma = require("../config/database");

const escalateRequest = async (requestId) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    return;
  }

  // Don't escalate completed requests
  if (
    request.status === "RESOLVED" ||
    request.status === "CLOSED"
  ) {
    return;
  }

  // Don't escalate twice
  if (request.escalatedAt) {
    return;
  }

  await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      escalatedAt: new Date(),

      events: {
        create: {
          eventType: "ESCALATED",
          metadata: {
            reason: "SLA deadline breached",
            slaDeadline: request.slaDeadline,
          },
        },
      },
    },
  });

  console.log(`Request ${requestId} escalated`);
};

module.exports = {
  escalateRequest,
};