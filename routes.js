const express = require("express");
const { Op } = require("sequelize");
const { User, Train, Booking, sequelize } = require("./database");
const {
  authenticateUser,
  requireAdmin,
  hashPassword,
  comparePassword,
  generateToken,
} = require("./utils");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/add-train", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { trainName, source, destination, totalSeats } = req.body;

    if (!trainName || !source || !destination || !totalSeats) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const train = await Train.create({
      trainName,
      source,
      destination,
      totalSeats,
      availableSeats: totalSeats,
    });

    res.status(201).json({
      message: "Train added successfully",
      trainId: train.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add train" });
  }
});

router.get("/trains/availability", authenticateUser, async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res
        .status(400)
        .json({ error: "Source and destination are required" });
    }

    const trains = await Train.findAll({
      where: {
        source,
        destination,
        availableSeats: { [Op.gt]: 0 },
      },
      attributes: [
        "id",
        "trainName",
        "source",
        "destination",
        "availableSeats",
      ],
    });

    res.json(trains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch train availability" });
  }
});

router.post("/bookings", authenticateUser, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { trainId } = req.body;
    const userId = req.user.id;

    const train = await Train.findOne({
      where: {
        id: trainId,
        availableSeats: { [Op.gt]: 0 },
      },
      transaction,
      lock: transaction.LOCK.UPDATE, //race condition fix
    });

    if (!train) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "No seats available or invalid train" });
    }

    const existingBooking = await Booking.findOne({
      where: {
        UserId: userId,
        TrainId: trainId,
        status: "confirmed",
      },
      transaction,
    });

    if (existingBooking) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "You have already booked a seat on this train" });
    }

    const booking = await Booking.create(
      {
        UserId: userId,
        TrainId: trainId,
        seatNumber: train.totalSeats - train.availableSeats + 1,
      },
      { transaction }
    );

    train.availableSeats -= 1;
    await train.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      message: "Booking Successful",
      bookingId: booking.id,
      seatNumber: booking.seatNumber,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Booking failed" });
  }
});

router.get("/bookings", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: {
        UserId: userId,
        status: "confirmed",
      },
      include: [
        {
          model: Train,
          attributes: ["trainName", "source", "destination"],
        },
      ],
      attributes: ["id", "seatNumber", "createdAt"],
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong! Please try again!" });
  }
});

router.get("/bookings/:bookingId", authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        UserId: userId,
        status: "confirmed",
      },
      include: [
        {
          model: Train,
          attributes: ["trainName", "source", "destination"],
        },
      ],
      attributes: ["id", "seatNumber", "createdAt"],
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong! Please try again!" });
  }
});

module.exports = router;
