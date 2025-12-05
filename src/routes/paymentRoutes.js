const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout', paymentController.createCheckoutSession);
router.get('/get-checkout', paymentController.getCheckoutSessionStatus);
router.get('/get-checkout/:session_id/items');

router.post('/tickets/create', paymentController.createTickets);
router.put('/tickets/confirm', paymentController.updateTickets);

router.post('/create', paymentController.createPayment);

router.post('/email/send', paymentController.sendEmail)
module.exports = router;