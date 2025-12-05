const seatModel = require('../models/newSeatModel');

async function getSeatsByShowtime(req, res) {
  const { scheduleId } = req.params;
  console.log('scheduleId received in controller:', scheduleId);
  
  if (isNaN(scheduleId)) {
    return res.status(400).json({ error: 'Invalid scheduleId' });
    }

  try {
    console.log("Fetching schedule...");
    const seatsData = await seatModel.getSeatsByShowtime(scheduleId);
    console.log("seatsData raw:", seatsData);
    res.json(seatsData);
    console.log("seatsData:", seatsData);
  } catch (err) {
     console.error('Error caught in controller:', err);
     res.status(500).json({ error: 'Failed to fetch seats' });
  }
}

async function reserveSeats(req, res) {
  const { scheduleId, seats } = req.body;
  try {
    const result = await seatModel.reserveSeats(scheduleId, seats);
    res.json(result);
  } catch (err) {
    console.error('Error caught in controller (reserveSeats):', err);
    res.status(500).json({ error: 'Failed to reserve seats' });
  }
}

async function releaseSeats(req, res) {
  const { scheduleId, seats } = req.body;
  try {
    const result = await seatModel.releaseSeats(scheduleId, seats);
    res.json(result);
  } catch (err) {
    console.error('Error caught in controller (releaseSeats):', err);
    res.status(500).json({ error: 'Failed to release seats' });
  }
}

async function getSeatsByBooking(req, res) {
    const { booking_id } = req.params;

    try {
        const result = await seatModel.getSeatsByBooking(booking_id);
        res.json(result);
    } catch (err) {
        console.error('Error caught in controller (getSeatsByBooking):', err);
        res.status(500).json({ error: 'Failed to get seats by booking' });
    }
}

module.exports = { getSeatsByShowtime, reserveSeats, releaseSeats, getSeatsByBooking};
