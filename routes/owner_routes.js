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
    const { name, email, phone, account_number, ifsc, pan } = req.body;
    
    const razorpay = getRazorpayInstance();

    const getBusinessType = (panNumber) => {
      if (!panNumber || panNumber.length < 4) return 'individual';
      const typeChar = panNumber.charAt(3).toUpperCase();
      switch (typeChar) {
        case 'P': return 'individual';
        case 'C': return 'private_limited';
        case 'F': return 'partnership';
        case 'T': return 'trust';
        case 'H': return 'huf';
        case 'A':
        case 'B': return 'society';
        case 'G':
        case 'J':
        case 'L': return 'public_limited';
        default: return 'individual';
      }
    };

    const businessType = getBusinessType(pan);

    // Create Razorpay Route Linked Account
    const account = await razorpay.accounts.create({
      email: email,
      phone: phone,
      type: 'route',
      legal_business_name: name,
      business_type: businessType,
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
      bank_account: {
        account_number: account_number,
        ifsc_code: ifsc,
        beneficiary_name: name
      },
      contact_name: name,
    });

    res.json({ linked_account_id: account.id });
  } catch (error) {
    console.error('Error creating linked account:', error?.error || error);
    res.status(500).json({ error: error?.error?.description || error.message || 'Linked account creation failed' });
  }
});

router.post('/updateLinkedAccount', authMiddleware, async (req, res) => {
  try {
    const { linked_account_id, name, email, phone, account_number, ifsc, pan } = req.body;
    
    const razorpay = getRazorpayInstance();

    const getBusinessType = (panNumber) => {
      if (!panNumber || panNumber.length < 4) return 'individual';
      const typeChar = panNumber.charAt(3).toUpperCase();
      switch (typeChar) {
        case 'P': return 'individual';
        case 'C': return 'private_limited';
        case 'F': return 'partnership';
        case 'T': return 'trust';
        case 'H': return 'huf';
        case 'A':
        case 'B': return 'society';
        case 'G':
        case 'J':
        case 'L': return 'public_limited';
        default: return 'individual';
      }
    };

    const businessType = getBusinessType(pan);

    // Update Razorpay Route Linked Account
    // Note: Razorpay prevents updating 'email', 'business_type', and 'bank_account' 
    // after an account is created for security reasons. 
    // These must be updated through the Razorpay Dashboard or support.
    await razorpay.accounts.edit(linked_account_id, {
      phone: phone,
      legal_business_name: name,
      contact_name: name,
      // legal_info: { pan: pan } // Often restricted after verification too
    });

    res.json({ success: true, message: 'Razorpay profile updated. Note: Bank details must be updated via Razorpay Dashboard for security.' });
  } catch (error) {
    console.error('Error updating linked account:', error?.error || error);
    res.status(500).json({ error: error?.error?.description || error.message || 'Linked account update failed' });
  }
});

module.exports = router;
