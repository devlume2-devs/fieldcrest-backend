const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware');

router.post('/createLinkedAccount', authMiddleware, async (req, res) => {
  res.json({ linked_account_id: 'acc_dummy' });
});

router.get('/getLinkedAccountStatus', authMiddleware, async (req, res) => {
  res.json({ status: 'active' });
});

module.exports = router;
