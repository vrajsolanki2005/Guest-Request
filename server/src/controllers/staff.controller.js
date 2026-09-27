const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

const getStaff = async (req, res, next) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        hotelId: req.user.hotelId,
        role: { in: ["STAFF", "FRONT_DESK"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const allowedRoles = ["STAFF", "FRONT_DESK"];
    const assignedRole = allowedRoles.includes(req.body.role) ? req.body.role : "STAFF";

    const staff = await prisma.user.create({
      data: {
        hotelId: req.user.hotelId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  createStaff,
};