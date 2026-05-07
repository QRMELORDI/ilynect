const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const db = require('../db/database');

// Get comments for a content item
router.get('/:contentId', async (req, res) => {
  try {
    const comments = await db.allAsync(
      `SELECT c.*, u.avatar_color, u.avatar_index 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.content_id = ? 
       ORDER BY c.created_at DESC`,
      [req.params.contentId]
    );
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a comment
router.post('/', async (req, res) => {
  try {
    const { contentId, userId, userName, text } = req.body;
    if (!contentId || !userId || !text) return res.status(400).json({ error: 'Missing data' });

    const id = randomUUID();
    await db.runAsync(
      'INSERT INTO comments (id, content_id, user_id, user_name, text) VALUES (?, ?, ?, ?, ?)',
      [id, contentId, userId, userName || 'User', text]
    );

    // Record history
    const video = await db.getAsync('SELECT title FROM videos WHERE id = ?', [contentId]);
    await db.runAsync(
      `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'video', 'comment', ?)`,
      [userId, userName || 'User', contentId, video?.title || 'Video']
    );

    const comment = await db.getAsync('SELECT * FROM comments WHERE id = ?', [id]);
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body; // To verify ownership
    const comment = await db.getAsync('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) return res.status(404).json({ error: 'Not found' });

    // Admin or owner can delete
    const user = await db.getAsync('SELECT role FROM users WHERE id = ?', [userId]);
    const isAdmin = user?.role === 'admin';

    if (!isAdmin && comment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.runAsync('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
