const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET SOCIAL DATA (Likes, Dislikes, Comments)
router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.query;

  try {
    const counts = await db.getAsync(
      `SELECT 
        SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
        SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes
      FROM user_interactions WHERE content_id = ?`,
      [videoId]
    );

    const userInteraction = await db.getAsync(
      `SELECT type FROM user_interactions WHERE content_id = ? AND user_id = ?`,
      [videoId, userId]
    );

    const comments = await db.allAsync(
      `SELECT * FROM comments WHERE content_id = ? ORDER BY created_at DESC`,
      [videoId]
    );

    res.json({
      likes: counts.likes || 0,
      dislikes: counts.dislikes || 0,
      userInteraction: userInteraction ? userInteraction.type : null,
      comments: comments || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIKE / DISLIKE
router.post('/interact', async (req, res) => {
  const { videoId, userId, type } = req.body; // type: 'like' or 'dislike'

  try {
    // Remove existing
    await db.runAsync(`DELETE FROM user_interactions WHERE content_id = ? AND user_id = ?`, [videoId, userId]);
    
    // Add new if type is provided (toggle off if same type)
    if (type) {
      await db.runAsync(
        `INSERT INTO user_interactions (user_id, content_id, type) VALUES (?, ?, ?)`,
        [userId, videoId, type]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COMMENT
router.post('/comment', async (req, res) => {
  const { videoId, userId, userName, text } = req.body;
  const id = Math.random().toString(36).substr(2, 9);

  try {
    await db.runAsync(
      `INSERT INTO comments (id, content_id, user_id, user_name, text) VALUES (?, ?, ?, ?, ?)`,
      [id, videoId, userId, userName, text]
    );
    res.json({ success: true, commentId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
