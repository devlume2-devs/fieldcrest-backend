const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware');
const { sendMail, getWelcomeTemplate, getTurfRegisteredTemplate, getCustomerWelcomeTemplate } = require('../helpers/email_helper');

router.post('/sendNotification', authMiddleware, async (req, res) => {
  res.json({ success: true });
});

router.post('/sendWelcomeEmail', authMiddleware, async (req, res) => {
  const { email, ownerName } = req.body;
  if (!email || !ownerName) {
    return res.status(400).json({ error: 'Email and ownerName are required.' });
  }

  const html = getWelcomeTemplate(ownerName);
  const result = await sendMail({
    to: email,
    subject: 'Welcome to FieldCrest! 🏏⚽ Your Owner Account is Ready',
    html
  });

  res.json(result);
});

router.post('/sendTurfRegisteredEmail', authMiddleware, async (req, res) => {
  const { email, ownerName, turfName } = req.body;
  if (!email || !ownerName || !turfName) {
    return res.status(400).json({ error: 'Email, ownerName, and turfName are required.' });
  }

  const html = getTurfRegisteredTemplate(ownerName, turfName);
  const result = await sendMail({
    to: email,
    subject: '🎉 Congratulations! Your Turf is Live on FieldCrest',
    html
  });

  res.json(result);
});

// Send Customer Welcome Email
router.post('/sendCustomerWelcomeEmail', async (req, res) => {
  const { email, customerName } = req.body;
  if (!email || !customerName) {
    return res.status(400).json({ error: 'Email and customerName are required.' });
  }

  const html = getCustomerWelcomeTemplate(customerName);
  const result = await sendMail({
    to: email,
    subject: 'Welcome to FieldCrest! 🎉 Ready to Play?',
    html
  });

  res.json(result);
});

module.exports = router;
