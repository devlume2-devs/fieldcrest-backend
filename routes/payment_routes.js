const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order with Split Routing
router.post('/createOrder', authMiddleware, async (req, res) => {
  try {
    const { amount, ownerLinkedAccountId } = req.body; // Amount in paise (e.g., Rs 100 = 10000 paise)

    // Example calculation: Keep 10% platform fee, transfer 90% to Owner
    const platformFee = Math.round(amount * 0.10); 
    const transferAmount = amount - platformFee;

    const options = {
      amount: amount, // Total amount paid by customer (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      transfers: [
        {
          account: ownerLinkedAccountId, // Owner's Linked Account ID (acc_xxxxxx)
          amount: transferAmount,       // Net amount routed to owner (paise)
          currency: 'INR',
          on_hold: false,               // false = Instantly settles to their account
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

// Verification Endpoint
router.post('/verifyAndTransfer', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment verified! Routing has already been scheduled automatically by the Order
      res.json({ success: true, message: 'Payment verified and split successfully!' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid Signature verification' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
