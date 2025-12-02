const bookingModel = require('../models/bookingModel');

exports.createBooking = async (req, res) => {
  const { seats, movieId, scheduleId } = req.body;

  // validate input
   if (!Array.isArray(seats) || seats.length === 0 || !movieId || !scheduleId) {
    return res.status(400).json({ error: "Invalid or missing data" });
    }

    try {
        const result = await bookingModel.createBooking(scheduleId, seats, movieId);
        res.json(result);
    } catch (error) {
        console.error("Create booking failed:", error.message);
        res.status(500).json({error: error.message});
    }
};
