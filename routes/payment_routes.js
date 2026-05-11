const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware');
const Razorpay = require('razorpay');

// Helper to get Razorpay instance dynamically to prevent startup crashes
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in environment variables.');
  }

  return new Razorpay({ key_id, key_secret });
};

// ═══════════════════════════════════════════════════════════════
// 1. Simple Order — For Subscription Payments (no split/route)
//    Owner pays FieldCrest → 100% goes to platform
// ═══════════════════════════════════════════════════════════════
router.post('/createOrder', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in paise (e.g., Rs 999 = 99900 paise)
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ order_id: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 2. Route Order — For Customer Booking Payments (split to owner)
//    Customer pays → 90% to turf owner, 10% platform fee
// ═══════════════════════════════════════════════════════════════
router.post('/createRouteOrder', authMiddleware, async (req, res) => {
  try {
    const { amount, ownerLinkedAccountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!ownerLinkedAccountId) {
      return res.status(400).json({ error: 'Owner linked account ID is required' });
    }

    const razorpay = getRazorpayInstance();

    // Keep 10% platform fee, transfer 90% to Owner
    const platformFee = Math.round(amount * 0.10);
    const transferAmount = amount - platformFee;

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `book_${Date.now()}`,
      transfers: [
        {
          account: ownerLinkedAccountId,
          amount: transferAmount,
          currency: 'INR',
          on_hold: false,
        }
      ]
    };

    const order = await razorpay.orders.create(options);
    res.json({ order_id: order.id });
  } catch (error) {
    console.error('Error creating route order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 3. Verify Payment Signature
// ═══════════════════════════════════════════════════════════════
router.post('/verifyAndTransfer', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified and split successfully!' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid Signature verification' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
