const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'photos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: photoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|heic)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT p.*, u.name as uploader_display_name, u.avatar_color
               FROM photos p LEFT JOIN users u ON p.uploaded_by = u.id WHERE 1=1`;
    const params = [];
    if (search) { sql += ' AND (p.title LIKE ? OR p.original_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY p.created_at DESC';
    const photos = await db.allAsync(sql, params);
    res.json({ photos });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/upload', upload.array('photos', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No photos' });
    const { userId, userName, title } = req.body;
    const uploaded = [];
    for (const file of req.files) {
      const id = uuidv4();
      const t = title || file.originalname.replace(/\.[^/.]+$/, '');
      await db.runAsync(
        `INSERT INTO photos (id, title, filename, original_name, size_bytes, mime_type, uploaded_by, uploader_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, t, file.filename, file.originalname, file.size, file.mimetype, userId || null, userName || 'Anonymous']
      );
      if (userId) {
        await db.runAsync(
          `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'photo', 'upload', ?)`,
          [userId, userName, id, t]
        );
      }
      uploaded.push(await db.getAsync('SELECT * FROM photos WHERE id = ?', [id]));
    }
    res.json({ success: true, photos: uploaded });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { title, userId, userName } = req.body;
    const photo = await db.getAsync('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (!photo) return res.status(404).json({ error: 'Not found' });
    await db.runAsync('UPDATE photos SET title = ? WHERE id = ?', [title || photo.title, req.params.id]);
    if (userId) {
      await db.runAsync(
        `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'photo', 'edit', ?)`,
        [userId, userName || 'User', req.params.id, title || photo.title]
      );
    }
    res.json({ success: true, photo: await db.getAsync('SELECT * FROM photos WHERE id = ?', [req.params.id]) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const photo = await db.getAsync('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (!photo) return res.status(404).json({ error: 'Not found' });
    const filePath = path.join(__dirname, '..', 'uploads', 'photos', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await db.runAsync('DELETE FROM photos WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/download', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    await db.runAsync('UPDATE photos SET downloads = downloads + 1 WHERE id = ?', [req.params.id]);
    if (userId) {
      const photo = await db.getAsync('SELECT * FROM photos WHERE id = ?', [req.params.id]);
      if (photo) {
        await db.runAsync(
          `INSERT INTO history (user_id, user_name, content_id, content_type, action, content_title) VALUES (?, ?, ?, 'photo', 'download', ?)`,
          [userId, userName || 'User', req.params.id, photo.title]
        );
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
