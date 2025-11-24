const theaterModel = require('../models/theatreModel');

const getAllTheaters = async (req, res) => {
  try {
    const theaters = await theaterModel.getAllTheaters();
    res.json(theaters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch theaters' });
  }
};

const getTheaterById = async (req, res) => {
  try {
    const theater = await theaterModel.getTheaterById(req.params.id);
    if (!theater) return res.status(404).json({ error: 'Theater not found' });
    res.json(theater);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch theater' });
  }
};

module.exports = {
  getAllTheaters,
  getTheaterById,
};
