const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { randomUUID } = require('crypto');

const FLOWER_AVATARS = ['🌸', '🌹', '🌻', '🌺', '🌷', '🌼', '💐', '🌿', '🍀', '🌾'];

const avatarColors = ['#E50914','#FF6B35','#3D5A80','#7B2D8B','#F72585','#4CC9F0','#4361EE','#FF9F1C','#06D6A0','#118AB2'];

router.post('/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      const id = randomUUID();
      const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      const avatarIndex = Math.floor(Math.random() * FLOWER_AVATARS.length);
      await db.runAsync(
        'INSERT INTO users (id, name, email, avatar_color, avatar_index) VALUES (?, ?, ?, ?, ?)', 
        [id, cleanName, cleanEmail, color, avatarIndex]
      );
      user = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    }
    // Add flower emoji to response
    user.flower = FLOWER_AVATARS[user.avatar_index || 0];
    res.json({ success: true, user });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/update-name', async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
    await db.runAsync('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    user.flower = FLOWER_AVATARS[user.avatar_index || 0];
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.flower = FLOWER_AVATARS[user.avatar_index || 0];
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
