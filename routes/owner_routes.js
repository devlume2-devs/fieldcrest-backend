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

router.post('/createLinkedAccount', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, accountNo, ifsc, pan } = req.body;
    
    const razorpay = getRazorpayInstance();

    // Create Razorpay Route Linked Account (API v2 format)
    const account = await razorpay.accounts.create({
      email: email,
      phone: phone,
      type: 'route',
      legal_business_name: name,
      business_type: 'individual',
      legal_info: {
        pan: pan,
      },
      profile: {
        category: 'healthcare',
        subcategory: 'clinic',
        addresses: {
          registered: {
            street1: 'Turf Address',
            street2: 'NA',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: 400001,
            country: 'IN'
          }
        }
      },
      contact_name: name,
    });

    // Save this linked_account_id to your owner profile database
    res.json({ linked_account_id: account.id });
  } catch (error) {
    console.error('Error creating linked account:', error?.error || error);
    res.status(500).json({ error: error?.error?.description || error.message || 'Linked account creation failed' });
  }
});

module.exports = router;
