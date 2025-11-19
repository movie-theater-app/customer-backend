const seatModel = require('../models/seatModel');

// get auditorium seats
async function getSeatsByAuditorium(req, res) {
  const { auditoriumId } = req.params;
  try {
    const seatsData = await seatModel.getSeatsByAuditorium(auditoriumId);
    res.json(seatsData); // {seats, rows, columns}
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
}

// reserve seats for 5 min hold
async function reserveSeats(req, res) {
  const { auditoriumId, seats } = req.body;
  try {
    const result = await seatModel.reserveSeats(auditoriumId, seats);
    res.json(result);
  } catch (error) {
    console.error("Error reserving seats:", error);
    res.status(500).json({ error: "Failed to reserve seats" });
  }
}

module.exports = {
  getSeatsByAuditorium,
  reserveSeats
}