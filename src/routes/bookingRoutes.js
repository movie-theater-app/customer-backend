const express = require("express");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

// create booking after user presses btn "Proceed to checkout"
router.post("/create", bookingController.createBooking);


module.exports = router;
