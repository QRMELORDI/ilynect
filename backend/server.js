const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const http = require('http');

const { generateToken } = require('./middleware/auth');
const db = require('./db/database');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'aviindo863@gmail.com').toLowerCase();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Wake-up endpoint
app.get('/api/wakeup', (req, res) => {
  res.json({ success: true, message: 'Server is awake!', timestamp: Date.now() });
});

// Create upload directories
['videos', 'photos', 'thumbnails', 'tmp'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movierulz', require('./routes/movierulz'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/content', require('./routes/content'));
app.use('/api/daily', require('./routes/daily'));
app.use('/api/files', require('./routes/files'));
app.use('/api/presence', require('./routes/presence'));
app.use('/api/history', require('./routes/history'));
app.use('/api/version', require('./routes/version'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '1.1.0' });
});



// Serve frontend static files (if exists)
const frontDist = path.join(__dirname, 'dist');
if (fs.existsSync(frontDist)) {
  app.use(express.static(frontDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontDist, 'index.html')));
}

// Start server
const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n🎬 ILYNECT v3.0 - PREMIUM FAMILY EDITION`);
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🔗 API: http://localhost:${port}/api`);
    console.log(`☁️ Storage: Google Drive (with local fallback)`);
    console.log(`💾 Database: SQLite (onv_player.db)`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);
