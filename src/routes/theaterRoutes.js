const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');

router.get('/', theaterController.getAllTheaters);
router.get('/:id', theaterController.getTheaterById);

module.exports = router;
