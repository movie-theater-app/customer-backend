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

const getAuditoriumByID = async (req, res) => {
    try {
        const auditorium = await auditoriumModel.getAuditoriumByID(req.params.auditorium_id);
        res.json(auditorium);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to fetch auditoriums by id: ${req.params.auditorium_id}` });
    }
};

module.exports = {
  getAllAuditoriums,
  getAuditoriumsByTheater,
  getAuditoriumByID,
};
