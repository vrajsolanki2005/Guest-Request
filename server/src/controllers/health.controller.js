const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "GuestRequest API is running",
    environment: process.env.NODE_ENV || "development",
  });
};

module.exports = {
  getHealth,
};