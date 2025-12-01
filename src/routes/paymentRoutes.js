const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout', paymentController.createCheckoutSession);
router.get('/get-checkout', paymentController.getCheckoutSessionStatus)
router.get('/get-checkout/:session_id/items')
module.exports = router;