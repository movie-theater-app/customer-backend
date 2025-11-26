const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout', paymentController.createCheckoutSession);
router.get('/get-checkout', paymentController.getCheckoutSessionStatus)
module.exports = router;