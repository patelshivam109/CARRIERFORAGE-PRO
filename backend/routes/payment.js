const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createCheckoutSession, createPortalSession,
  handleWebhook, getSubscriptionStatus,
} = require('../controllers/paymentController');

const router = express.Router();

// Webhook must use raw body (set in server.js)
router.post('/webhook', handleWebhook);

router.use(protect);
router.post('/create-checkout', createCheckoutSession);
router.post('/portal', createPortalSession);
router.get('/status', getSubscriptionStatus);

module.exports = router;
