const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      hotelId: user.hotelId,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: String(env.jwtExpiresIn || "7d"),
    }
  );
};

module.exports = {
  generateToken,
};