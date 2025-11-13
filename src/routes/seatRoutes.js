const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Hae auditorion paikat
router.get('/:auditoriumId/seats', seatController.getSeatsByAuditorium);

// Varaa valitut paikat
router.post('/reserve', seatController.reserveSeats);

module.exports = router;
