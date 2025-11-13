const seatModel = require('../models/seatModel');

// Hae auditorion paikat
async function getSeatsByAuditorium(req, res) {
  const { auditoriumId } = req.params;
  try {
    const seats = await seatModel.getSeatsByAuditorium(auditoriumId);
    res.json(seats);
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
}

// Varaa paikat
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
};
