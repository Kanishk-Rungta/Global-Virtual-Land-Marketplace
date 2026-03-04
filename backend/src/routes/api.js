const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

// Land Routes
router.get('/lands', landController.getLands);
router.post('/lands/buy', landController.buyLand);

// Basic health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', region: process.env.REGION || 'unknown' });
});

module.exports = router;
