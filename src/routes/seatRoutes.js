import express from "express";
import { getSeatsByAuditorium, reserveSeats } from '../controllers/seatController.js';

const router = express.Router();

// get auditorium seats by auditorium id
router.get('/:auditoriumId/seats', getSeatsByAuditorium);

//reserve selected seats for 5 min
router.post('/:auditoriumId/seats/reserve', reserveSeats);

export default router;
