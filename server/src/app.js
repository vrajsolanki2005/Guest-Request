const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");
const env = require("./config/env");

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  })
);

app.use(express.json());
app.use("/api", routes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;