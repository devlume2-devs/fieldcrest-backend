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
    const { name, email, accountNo, ifsc, pan } = req.body;
    
    // Get instance dynamically
    const razorpay = getRazorpayInstance();

    // Create Razorpay Route Linked Account
    const account = await razorpay.accounts.create({
      type: 'route',
      email: email,
      phone: req.user?.phone || '9999999999', // Fallback from authenticated user
      profile: {
        category: 'sports_and_recreation',
        subcategory: 'sports_club',
        addresses: {
          registered: {
            street1: 'Turf Address',
            city: 'City',
            state: 'State',
            postal_code: '000000',
            country: 'IN'
          }
        }
      },
      legal_business_name: name,
      business_type: 'individual',
      bank_account: {
        ifsc_code: ifsc,
        account_number: accountNo,
        beneficiary_name: name,
      }
    });

    // Save this linked_account_id to your owner profile database
    res.json({ linked_account_id: account.id });
  } catch (error) {
    console.error('Error creating linked account:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
