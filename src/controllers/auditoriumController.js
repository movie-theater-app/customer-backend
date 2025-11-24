const auditoriumModel = require('../models/auditoriumModel');

const getAllAuditoriums = async (req, res) => {
  try {
    const auditoriums = await auditoriumModel.getAllAuditoriums();
    res.json(auditoriums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch auditoriums' });
  }
};

const getAuditoriumsByTheater = async (req, res) => {
  try {
    const auditoriums = await auditoriumModel.getAuditoriumsByTheater(req.params.theaterId);
    res.json(auditoriums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch auditoriums for theater' });
  }
};

module.exports = {
  getAllAuditoriums,
  getAuditoriumsByTheater,
};
