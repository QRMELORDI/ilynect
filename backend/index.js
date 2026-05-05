const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- API Endpoints ---

// Upload Media
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, filename, mimetype, size } = req.file;
  const fileType = mimetype.startsWith('video/') ? 'video' : (mimetype.startsWith('image/') ? 'photo' : 'other');

  db.run(
    'INSERT INTO media (originalName, fileName, fileType, mimeType, size) VALUES (?, ?, ?, ?, ?)',
    [originalname, filename, fileType, mimetype, size],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, originalName: originalname, fileName: filename, fileType });
    }
  );
});

// List all media history
app.get('/api/media', (req, res) => {
  db.all('SELECT * FROM media ORDER BY uploadDate DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Rename Media
app.put('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;
  if (!newName) {
    return res.status(400).json({ error: 'New name is required' });
  }

  db.run('UPDATE media SET originalName = ? WHERE id = ?', [newName, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json({ success: true, message: 'Renamed successfully' });
  });
});

// Delete Media
app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT fileName FROM media WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const filePath = path.join(__dirname, 'uploads', row.fileName);
    fs.unlink(filePath, (unlinkErr) => {
      // Continue deleting from DB even if file doesn't exist on disk
      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
        console.error('Failed to delete file:', unlinkErr);
      }
      
      db.run('DELETE FROM media WHERE id = ?', [id], function(deleteErr) {
        if (deleteErr) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, message: 'Deleted successfully' });
      });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
