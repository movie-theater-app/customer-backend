const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// get auditorium seats by auditorium id
router.get('/:auditoriumId/seats', seatController.getSeatsByAuditorium);

// Reserve selected seats
router.post('/:auditoriumId/seats/reserve', seatController.reserveSeats);

module.exports = router;
