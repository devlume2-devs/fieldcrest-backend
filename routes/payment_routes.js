const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware');

router.post('/createOrder', authMiddleware, async (req, res) => {
  // TODO: Implement Razorpay order creation
  res.json({ order_id: 'order_dummy' });
});

router.post('/verifyAndTransfer', authMiddleware, async (req, res) => {
  // TODO: Implement verify and transfer
  res.json({ success: true });
});

module.exports = router;
