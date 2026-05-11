const express = require('express');
const helmet = require('helmet'); // Security headers
const cors = require('cors'); // Allow Flutter app to call this API
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

//  Security Middleware 
app.use(helmet()); // Sets secure HTTP headers automatically
app.use(cors({ origin: '*' })); // Flutter apps call from mobile — allow all
app.use(express.json());

//  Trust Render's Reverse Proxy (required for rate limiter + correct client IP)
app.set('trust proxy', 1);

//  Rate Limiting 
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // Max 30 requests per minute per IP
  message: { error: 'Too many requests' }
});

app.use('/api', limiter);

//  Routes 
app.use('/api', require('./routes/payment_routes'));
app.use('/api', require('./routes/owner_routes'));
app.use('/api', require('./routes/notification_routes'));
app.use('/api', require('./routes/subscription_routes'));
app.use('/api', require('./routes/storage_routes'));

//  Health Check + Env Debug
app.get('/health', (req, res) => {
  const mask = (val) => val ? `${val.substring(0,8)}...${val.slice(-4)} (len:${val.length})` : '❌ MISSING';
  res.json({
    status: 'FieldCrest API running',
    env: {
      RAZORPAY_KEY_ID: mask(process.env.RAZORPAY_KEY_ID),
      RAZORPAY_KEY_SECRET: mask(process.env.RAZORPAY_KEY_SECRET),
      API_SECRET_KEY: process.env.API_SECRET_KEY ? '✅ SET' : '❌ MISSING',
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FieldCrest API on port ${PORT}`));
