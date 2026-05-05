const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { userId, limit = 100, type } = req.query;
    let sql = 'SELECT * FROM history WHERE 1=1';
    const params = [];
    if (userId) { sql += ' AND user_id = ?'; params.push(userId); }
    if (type) { sql += ' AND content_type = ?'; params.push(type); }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    const history = await db.allAsync(sql, params);
    res.json({ history });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/stats', async (req, res) => {
  try {
    const totalVideos = (await db.getAsync('SELECT COUNT(*) as c FROM videos')).c;
    const totalPhotos = (await db.getAsync('SELECT COUNT(*) as c FROM photos')).c;
    const totalViews = (await db.getAsync('SELECT COALESCE(SUM(views),0) as s FROM videos')).s;
    const totalDownloads = (await db.getAsync('SELECT COALESCE(SUM(downloads),0) as s FROM videos')).s;
    const totalUsers = (await db.getAsync('SELECT COUNT(*) as c FROM users')).c;
    const recentActivity = await db.allAsync('SELECT * FROM history ORDER BY created_at DESC LIMIT 20');
    res.json({ totalVideos, totalPhotos, totalViews, totalDownloads, totalUsers, recentActivity });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/clear', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await db.runAsync('DELETE FROM history WHERE user_id = ?', [userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
