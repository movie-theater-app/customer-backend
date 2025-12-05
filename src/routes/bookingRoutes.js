const express = require("express");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

// create booking after user presses btn "Proceed to checkout"
router.post("/create", bookingController.createBooking);
router.get('/get/:booking_id', bookingController.getBookingByID);
router.get("/seats/:booking_id", bookingController.getBookingSeats)
router.get("/tickets/:booking_id", bookingController.getTicketsFromBooking)
router.put("/confirm", bookingController.confirmBooking)


module.exports = router;
