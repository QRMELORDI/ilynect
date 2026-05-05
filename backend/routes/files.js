const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const UPLOADS_BASE = path.join(__dirname, '..', 'uploads');

// Helper: get file path by ID and type
async function getFilePath(id, type) {
  let row;
  if (type === 'photo') {
    row = await db.getAsync('SELECT filename FROM photos WHERE id = ?', [id]);
    return row ? path.join(UPLOADS_BASE, 'photos', row.filename) : null;
  }
  row = await db.getAsync('SELECT filename FROM videos WHERE id = ?', [id]);
  return row ? path.join(UPLOADS_BASE, 'videos', row.filename) : null;
}

// STREAM video online (supports Range requests for seek/scrub)
router.get('/stream/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const filePath = await getFilePath(id, type);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4', '.webm': 'video/webm', '.mkv': 'video/x-matroska',
      '.mov': 'video/quicktime', '.avi': 'video/x-msvideo', '.mp3': 'audio/mpeg',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DOWNLOAD file (forces Content-Disposition attachment)
router.get('/download/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const filePath = await getFilePath(id, type);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const originalName = type === 'photo'
      ? (await db.getAsync('SELECT original_name FROM photos WHERE id = ?', [id]))?.original_name
      : (await db.getAsync('SELECT original_name FROM videos WHERE id = ?', [id]))?.original_name;

    const downloadName = originalName || path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Direct photo/image view
router.get('/photo/:id', async (req, res) => {
  try {
    const filePath = await getFilePath(req.params.id, 'photo');
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
