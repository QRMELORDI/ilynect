const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const messages = await db.allAsync('SELECT * FROM messages ORDER BY created_at ASC');
    res.json(messages);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { userId, userName, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO messages (id, sender_id, sender_name, text) VALUES (?, ?, ?, ?)', [id, userId, userName, text]);
    const msg = await db.getAsync('SELECT * FROM messages WHERE id = ?', [id]);
    res.json(msg);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/clear', async (req, res) => {
  try {
    const { userId } = req.body;
    await db.runAsync('DELETE FROM messages WHERE sender_id = ?', [userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
