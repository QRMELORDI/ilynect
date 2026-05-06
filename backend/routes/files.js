const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const driveService = require('../services/driveService');

const UPLOADS_BASE = path.join(__dirname, '..', 'uploads');

async function getFileRecord(id, type) {
  if (type === 'photo') {
    return db.getAsync('SELECT filename, original_name, mime_type, drive_file_id FROM photos WHERE id = ?', [id]);
  }
  return db.getAsync('SELECT filename, original_name, mime_type, drive_file_id FROM videos WHERE id = ?', [id]);
}

function getLocalPath(id, type) {
  const dir = type === 'photo' ? 'photos' : 'videos';
  return path.join(UPLOADS_BASE, dir);
}

router.get('/stream/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const record = await getFileRecord(id, type);
    if (!record) return res.status(404).json({ error: 'File not found' });

    if (record.drive_file_id) {
      try {
        const range = req.headers.range || null;
        const { stream } = await driveService.getFileStream(record.drive_file_id, range);
        res.setHeader('Content-Type', record.mime_type || 'application/octet-stream');
        res.setHeader('Accept-Ranges', 'bytes');
        if (range) {
          const [start, end] = range.replace('bytes=', '').split('-').map(Number);
          const headResp = await driveService.getFileInfo(record.drive_file_id);
          const fileSize = parseInt(headResp.size);
          const chunkSize = (end || fileSize - 1) - start + 1;
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end || fileSize - 1}/${fileSize}`,
            'Content-Length': chunkSize,
            'Content-Type': record.mime_type || 'application/octet-stream',
          });
        }
        stream.pipe(res);
        return;
      } catch (driveErr) {
        console.error('Drive stream failed, falling back to local:', driveErr.message);
      }
    }

    const localPath = path.join(getLocalPath(id, type), record.filename);
    if (!fs.existsSync(localPath)) return res.status(404).json({ error: 'File not found' });

    const stat = fs.statSync(localPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = path.extname(localPath).toLowerCase();
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
      const file = fs.createReadStream(localPath, { start, end });
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
      fs.createReadStream(localPath).pipe(res);
    }
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/download/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const record = await getFileRecord(id, type);
    if (!record) return res.status(404).json({ error: 'File not found' });

    const downloadName = record.original_name || record.filename;
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    if (record.drive_file_id) {
      try {
        const { stream } = await driveService.getFileStream(record.drive_file_id);
        stream.pipe(res);
        return;
      } catch (driveErr) {
        console.error('Drive download failed, falling back to local:', driveErr.message);
      }
    }

    const localPath = path.join(getLocalPath(id, type), record.filename);
    if (!fs.existsSync(localPath)) return res.status(404).json({ error: 'File not found' });
    fs.createReadStream(localPath).pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/photo/:id', async (req, res) => {
  try {
    const record = await getFileRecord(req.params.id, 'photo');
    if (!record) return res.status(404).json({ error: 'Not found' });

    if (record.drive_file_id) {
      try {
        const { stream } = await driveService.getFileStream(record.drive_file_id);
        res.setHeader('Content-Type', record.mime_type || 'image/jpeg');
        stream.pipe(res);
        return;
      } catch (driveErr) {
        console.error('Drive photo stream failed, falling back to local:', driveErr.message);
      }
    }

    const localPath = path.join(getLocalPath(req.params.id, 'photo'), record.filename);
    if (!fs.existsSync(localPath)) return res.status(404).json({ error: 'Not found' });
    const ext = path.extname(localPath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
    fs.createReadStream(localPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
