const { Queue, Worker } = require("bullmq");

const redis = require("../config/redis");
const { escalateRequest } = require("../services/sla.service");

const slaQueue = new Queue("sla-queue", {
  connection: redis,
});

const slaWorker = new Worker(
  "sla-queue",
  async (job) => {
    if (job.name === "check-sla") {
      await escalateRequest(job.data.requestId);
    }
  },
  {
    connection: redis,
  },
);

slaWorker.on("completed", (job) => {
  console.log(`SLA job completed: ${job.id}`);
});

slaWorker.on("failed", (job, error) => {
  console.error(`SLA job failed: ${job?.id}`, error.message);
});

const scheduleSlaCheck = async (request) => {
  if (!request.slaDeadline) {
    return;
  }

  const delay = Math.max(
    new Date(request.slaDeadline).getTime() - Date.now(),
    0,
  );

  await slaQueue.add(
    "check-sla",
    {
      requestId: request.id,
    },
    {
      delay,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  console.log(`SLA check scheduled for request ${request.id}`);
};

module.exports = {
  scheduleSlaCheck,
  slaWorker,
};
