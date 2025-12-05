const express = require('express');
const { getSeatsByShowtime, reserveSeats, releaseSeats, getSeatsByBooking} = require("../controllers/newSeatController");

const router = express.Router();

    // get seats for a specific showtime
    router.get('/:scheduleId', getSeatsByShowtime);

    // reserve selected seats for 5 min
    router.post('/reserve', reserveSeats);

    // release held seats
    router.post('/release', releaseSeats);

    router.get('/get/booking/:booking_id', getSeatsByBooking);

    module.exports = router;
