const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'videos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: videoStorage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }
});

// GET /api/videos
router.get('/', async (req, res) => {
  try {
    const { category, search, sub_type } = req.query;
    let sql = `SELECT v.*, u.name as uploader_display_name, u.avatar_color
               FROM videos v LEFT JOIN users u ON v.uploaded_by = u.id WHERE 1=1`;
    const params = [];
    if (sub_type) { sql += ' AND v.sub_type = ?'; params.push(sub_type); }
    if (category && category !== 'All') { sql += ' AND v.category = ?'; params.push(category); }
    if (search) { sql += ' AND (v.title LIKE ? OR v.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY v.created_at DESC';
    const videos = await db.allAsync(sql, params);
    res.json({ videos });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const video = await db.getAsync(
      `SELECT v.*, u.name as uploader_display_name, u.avatar_color
       FROM videos v LEFT JOIN users u ON v.uploaded_by = u.id WHERE v.id = ?`,
      [req.params.id]
    );
    if (!video) return res.status(404).json({ error: 'Not found' });
    res.json(video);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/videos/upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file' });
    const { title, description, category, userId, userName, sub_type, duration_sec } = req.body;

    // Admin-only movie upload protection
    const finalSubType = sub_type || 'movie';
    if (finalSubType === 'movie' && userId) {
      const uploader = await db.getAsync('SELECT role FROM users WHERE id = ?', [userId]);
      if (!uploader || uploader.role !== 'admin') {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: 'Only admin can upload movies.' });
      }
    }

    // Server-side constraint for Gossip (Reels)
    if (finalSubType === 'gossip' && parseFloat(duration_sec || 0) > 65) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Gossip videos must be under 60 seconds.' });
    }

    const id = uuidv4();
    await db.runAsync(
      `INSERT INTO videos (id, title, description, category, sub_type, filename, original_name, thumbnail,
        size_bytes, duration_sec, mime_type, uploaded_by, uploader_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title || req.file.originalname, description || '',
       category || 'General', finalSubType, req.file.filename, req.file.originalname,
       req.body.thumbnail || '', req.file.size, duration_sec || 0, req.file.mimetype, userId || null, userName || 'Anonymous']
    );
    if (userId) {
      await db.runAsync(
        `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title)
         VALUES (?, ?, ?, 'video', 'upload', ?)`,
        [userId, userName, id, title || req.file.originalname]
      );
    }
    const video = await db.getAsync('SELECT * FROM videos WHERE id = ?', [id]);
    res.json({ success: true, video });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/videos/:id
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, category, userId, userName } = req.body;
    const video = await db.getAsync('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (!video) return res.status(404).json({ error: 'Not found' });
    await db.runAsync(
      'UPDATE videos SET title = ?, description = ?, category = ? WHERE id = ?',
      [title || video.title, description !== undefined ? description : video.description, category || video.category, req.params.id]
    );
    if (userId) {
      const editors = JSON.parse(video.editors || '[]');
      if (!editors.includes(userId)) editors.push(userId);
      await db.runAsync('UPDATE videos SET editors = ? WHERE id = ?', [JSON.stringify(editors), req.params.id]);
      await db.runAsync(
        `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'video', 'edit', ?)`,
        [userId, userName || 'User', req.params.id, title || video.title]
      );
    }
    const updated = await db.getAsync('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    res.json({ success: true, video: updated });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/videos/:id
router.delete('/:id', async (req, res) => {
  try {
    const video = await db.getAsync('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (!video) return res.status(404).json({ error: 'Not found' });
    const filePath = path.join(__dirname, '..', 'uploads', 'videos', video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await db.runAsync('DELETE FROM videos WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/videos/:id/view
router.post('/:id/view', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    await db.runAsync('UPDATE videos SET views = views + 1 WHERE id = ?', [req.params.id]);
    if (userId) {
      const video = await db.getAsync('SELECT * FROM videos WHERE id = ?', [req.params.id]);
      if (video) {
        const viewers = JSON.parse(video.viewers || '[]');
        if (!viewers.includes(userId)) viewers.push(userId);
        await db.runAsync('UPDATE videos SET viewers = ? WHERE id = ?', [JSON.stringify(viewers), req.params.id]);
        await db.runAsync(
          `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'video', 'view', ?)`,
          [userId, userName || 'User', req.params.id, video.title]
        );
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/videos/:id/download
router.post('/:id/download', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    await db.runAsync('UPDATE videos SET downloads = downloads + 1 WHERE id = ?', [req.params.id]);
    if (userId) {
      const video = await db.getAsync('SELECT * FROM videos WHERE id = ?', [req.params.id]);
      if (video) {
        await db.runAsync(
          `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'video', 'download', ?)`,
          [userId, userName || 'User', req.params.id, video.title]
        );
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// INTERACTIONS: Like/Dislike
router.post('/:id/interact', async (req, res) => {
  try {
    const { userId, type } = req.body; // type: 'like', 'dislike'
    if (!userId || !['like', 'dislike'].includes(type)) return res.status(400).json({ error: 'Invalid data' });

    const existing = await db.getAsync('SELECT * FROM user_interactions WHERE user_id = ? AND content_id = ?', [userId, req.params.id]);
    
    if (existing) {
      if (existing.type === type) {
        // Toggle off
        await db.runAsync('DELETE FROM user_interactions WHERE user_id = ? AND content_id = ?', [userId, req.params.id]);
        await db.runAsync(`UPDATE videos SET ${type}s = ${type}s - 1 WHERE id = ?`, [req.params.id]);
      } else {
        // Switch type
        const oldType = existing.type;
        await db.runAsync('UPDATE user_interactions SET type = ? WHERE user_id = ? AND content_id = ?', [type, userId, req.params.id]);
        await db.runAsync(`UPDATE videos SET ${oldType}s = ${oldType}s - 1, ${type}s = ${type}s + 1 WHERE id = ?`, [req.params.id]);
      }
    } else {
      await db.runAsync('INSERT INTO user_interactions (user_id, content_id, type) VALUES (?, ?, ?)', [userId, req.params.id, type]);
      await db.runAsync(`UPDATE videos SET ${type}s = ${type}s + 1 WHERE id = ?`, [req.params.id]);
    }

    const video = await db.getAsync('SELECT likes, dislikes FROM videos WHERE id = ?', [req.params.id]);
    const userIteraction = await db.getAsync('SELECT type FROM user_interactions WHERE user_id = ? AND content_id = ?', [userId, req.params.id]);
    
    res.json({ success: true, likes: video.likes, dislikes: video.dislikes, userType: userIteraction ? userIteraction.type : null });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// COMMENTS
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await db.allAsync('SELECT * FROM comments WHERE content_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(comments);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, userName, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO comments (id, content_id, user_id, user_name, text) VALUES (?, ?, ?, ?, ?)', 
      [id, req.params.id, userId, userName, text]);
    const comment = await db.getAsync('SELECT * FROM comments WHERE id = ?', [id]);
    res.json(comment);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST/GET /api/videos/:id/watch-position
router.post('/:id/watch-position', async (req, res) => {
  try {
    const { userId, positionSec } = req.body;
    if (!userId) return res.json({ success: true });
    const existing = await db.getAsync(
      'SELECT * FROM watch_sessions WHERE user_id = ? AND video_id = ?', [userId, req.params.id]
    );
    if (existing) {
      await db.runAsync(
        'UPDATE watch_sessions SET last_position_sec = ?, updated_at = strftime(\'%s\',\'now\') WHERE id = ?',
        [positionSec, existing.id]
      );
    } else {
      await db.runAsync(
        'INSERT INTO watch_sessions (user_id, video_id, last_position_sec) VALUES (?, ?, ?)',
        [userId, req.params.id, positionSec]
      );
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id/watch-position', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json({ positionSec: 0 });
    const session = await db.getAsync(
      'SELECT * FROM watch_sessions WHERE user_id = ? AND video_id = ?', [userId, req.params.id]
    );
    res.json({ positionSec: session ? session.last_position_sec : 0 });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
