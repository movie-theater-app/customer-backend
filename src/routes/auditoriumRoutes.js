const express = require('express');
const router = express.Router();
const auditoriumController = require('../controllers/auditoriumController');

router.get('/', auditoriumController.getAllAuditoriums);
router.get('/theater/:theaterId', auditoriumController.getAuditoriumsByTheater);
router.get('/get/:auditorium_id', auditoriumController.getAuditoriumByID);

module.exports = router;
