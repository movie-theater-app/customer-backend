const express = require("express");
const { getSeatsByAuditorium, reserveSeats } = require("../controllers/seatController");

const router = express.Router();

// get auditorium seats by auditorium id
router.get('/:auditoriumId/seats', getSeatsByAuditorium);

//reserve selected seats for 5 min
router.post('/:auditoriumId/seats/reserve', reserveSeats);

module.exports = router;