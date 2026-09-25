const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(
    `GuestRequest server running on http://localhost:${env.port}`
  );
});