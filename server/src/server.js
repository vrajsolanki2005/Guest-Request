const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/database");

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(env.port, () => {
      console.log(
        `GuestRequest server running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();