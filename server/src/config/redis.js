const IORedis = require("ioredis");

const redis = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis error:", error.message);
});

module.exports = redis;