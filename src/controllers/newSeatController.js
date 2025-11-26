const seatModel = require('../models/seatModel');

async function getSeatsByShowtime(req, res) {
  const { scheduleId } = req.params;
  try {
    const seatsData = await seatModel.getSeatsByShowtime(scheduleId);
    res.json(seatsData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
}

async function reserveSeats(req, res) {
  const { scheduleId, seats } = req.body;
  try {
    const result = await seatModel.reserveSeats(scheduleId, seats);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reserve seats' });
  }
}

async function releaseSeats(req, res) {
  const { scheduleId, seats } = req.body;
  try {
    const result = await seatModel.releaseSeats(scheduleId, seats);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to release seats' });
  }
}

module.exports = { getSeatsByShowtime, reserveSeats, releaseSeats };
