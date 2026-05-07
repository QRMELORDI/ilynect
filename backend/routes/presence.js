const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/presence - Update user online status
router.post('/', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    if (!userId) return res.json({ success: true });
    
    await db.runAsync(
      "INSERT OR REPLACE INTO presence (user_id, user_name) VALUES (?, ?)",
      [userId, userName]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Presence error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/presence/online - Get online users
router.get('/online', async (req, res) => {
  try {
    const fiveMinAgo = Math.floor(Date.now() / 1000) - 300;
    const users = await db.allAsync(
      'SELECT user_id as id, user_name as userName FROM presence WHERE last_seen > ?',
      [fiveMinAgo]
    );
    res.json(users || []);
  } catch (err) {
    console.error('Online users error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
