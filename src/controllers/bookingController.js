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

exports.confirmBooking = async (req, res) => {
    const { booking_id, total_amount, payment_status } = req.body;

    if (!booking_id || !total_amount || !payment_status) {
        return res.status(400).json({ error: "Invalid or missing data" });
    }
    try {
        const result = await bookingModel.confirmBooking(booking_id, total_amount, payment_status);
        res.json(result);
    } catch (error) {
        console.error("Confirming booking failed:", error);
        res.status(500).json({ error: "Failed to confirm booking" });
    }
}

exports.getBookingSeats = async (req, res) => {
    const { booking_id } = req.params;

    try {
        const result = await bookingModel.getBookingSeats(booking_id);
        res.json(result);
    } catch (error) {
        console.error("Getting seats from booking failed:", error);
        res.status(404).json({ error: "Failed to get seats from booking" });
    }
}

exports.getTicketsFromBooking = async (req, res) => {
    const { booking_id } = req.params;

    try {
        const result = await bookingModel.getTicketsFromBooking(booking_id);
        res.json(result);
    } catch (error) {
        console.error("Getting tickets from booking failed:", error);
        res.status(404).json({ error: "Failed to get tickets from booking" });
    }
}
