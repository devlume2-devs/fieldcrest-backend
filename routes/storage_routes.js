const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware');

router.post('/deletePhoto', authMiddleware, async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
