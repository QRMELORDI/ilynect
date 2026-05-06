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
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'aviindo863@gmail.com').toLowerCase();

app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

['videos', 'photos', 'thumbnails', 'tmp'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const avatars = ['🌸','🌹','🌻','🌺','🌷','🌼','💐','🌿','🍀','🌾'];
const avatarColors = ['#E50914','#FF6B35','#3D5A80','#7B2D8B','#F72585','#4CC9F0','#4361EE','#FF9F1C','#06D6A0','#118AB2'];

app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      const { randomUUID } = require('crypto');
      const id = randomUUID();
      const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      const avatarIndex = Math.floor(Math.random() * avatars.length);
      await db.runAsync(
        'INSERT INTO users (id, name, email, avatar_color, avatar_index, role) VALUES (?, ?, ?, ?, ?, ?)',
        [id, cleanName, cleanEmail, color, avatarIndex, cleanEmail === ADMIN_EMAIL ? 'admin' : 'user']
      );
      user = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    } else {
      if (cleanEmail === ADMIN_EMAIL && user.role !== 'admin') {
        await db.runAsync('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);
        user.role = 'admin';
      }
    }

    user.flower = avatars[user.avatar_index || 0];
    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/auth/update-name', async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
    await db.runAsync('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    user.flower = avatars[user.avatar_index || 0];
    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.flower = avatars[user.avatar_index || 0];
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/family', async (req, res) => {
  try {
    const users = await db.allAsync('SELECT id, name, email, avatar_color, avatar_index, role, created_at FROM users ORDER BY name');
    users.forEach(u => u.flower = avatars[u.avatar_index || 0]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/videos', require('./routes/videos'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/content', require('./routes/content'));
app.use('/api/daily', require('./routes/daily'));
app.use('/api/files', require('./routes/files'));

app.post('/api/presence', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    if (!userId) return res.json({ success: true });
    await db.runAsync(
      'INSERT OR REPLACE INTO presence (user_id, user_name, last_seen) VALUES (?, ?, strftime("%s", "now"))',
      [userId, userName]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/presence/online', async (req, res) => {
  try {
    const fiveMinAgo = Math.floor(Date.now() / 1000) - 300;
    const users = await db.allAsync('SELECT user_id as id, user_name as userName FROM presence WHERE last_seen > ?', [fiveMinAgo]);
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/history/:userId', async (req, res) => {
  try {
    const rows = await db.allAsync(
      'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/version', (req, res) => {
  res.json({ version: '1.0.4', update_required: false });
});

app.post('/api/ai/ask', async (req, res) => {
  const { prompt, type } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  const isHealth = type === 'health';

  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (GROQ_API_KEY) {
      const systemPrompt = isHealth
        ? 'You are a caring family health assistant. Give short, helpful advice in simple Telugu-English mix. Always add disclaimer.'
        : 'You are a friendly family education assistant. Explain simply and encourage curiosity. Use Telugu-English mix.';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || null;
      if (text) {
        return res.json({
          text,
          disclaimer: isHealth ? '\u26a0\ufe0f \u0c07\u0c26\u0c3f \u0c38\u0c2e\u0c3e\u0c1a\u0c3e\u0c30 \u0c2e\u0c3e\u0c24\u0c4d\u0c30\u0c2e\u0c47. \u0c35\u0c48\u0c26\u0c4d\u0c2f \u0c38\u0c32\u0c39\u0c3e \u0c15\u0c4b\u0c38\u0c02 \u0c21\u0c3e\u0c15\u0c4d\u0c1f\u0c30\u0c4d\u200c\u0c28\u0c41 \u0c38\u0c02\u0c2a\u0c4d\u0c30\u0c26\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f.' : null
        });
      }
    }
  } catch (error) {
    console.warn('AI API failed, using fallback:', error.message);
  }

  const healthResponses = [
    "\ud83d\udca7 \u0c30\u0c4b\u0c1c\u0c41\u0c15\u0c41 8-10 \u0c17\u0c4d\u0c32\u0c3e\u0c38\u0c41\u0c32 \u0c28\u0c40\u0c30\u0c41 \u0c24\u0c3e\u0c17\u0c02\u0c21\u0c3f. \u0c36\u0c30\u0c40\u0c30\u0c02 \u0c39\u0c48\u0c21\u0c4d\u0c30\u0c47\u0c1f\u0c4d \u0c17\u0c3e \u0c09\u0c02\u0c21\u0c1f\u0c02 \u0c1a\u0c3e\u0c32\u0c3e \u0c2e\u0c41\u0c16\u0c4d\u0c2f\u0c02.",
    "\ud83d\udeb6 \u0c2a\u0c4d\u0c30\u0c24\u0c3f\u0c30\u0c4b\u0c1c\u0c41 30 \u0c28\u0c3f\u0c2e\u0c3f\u0c37\u0c3e\u0c32 \u0c28\u0c21\u0c15 \u0c17\u0c41\u0c02\u0c21\u0c46 \u0c06\u0c30\u0c4b\u0c17\u0c4d\u0c2f\u0c3e\u0c28\u0c3f\u0c15\u0c3f \u0c1a\u0c3e\u0c32\u0c3e \u0c2e\u0c02\u0c1a\u0c3f\u0c26\u0c3f.",
    "\ud83d\ude34 7-8 \u0c17\u0c02\u0c1f\u0c32 \u0c28\u0c3f\u0c26\u0c4d\u0c30 \u0c36\u0c30\u0c40\u0c30\u0c3e\u0c28\u0c4d\u0c28\u0c3f, \u0c2e\u0c28\u0c38\u0c4d\u0c38\u0c41\u0c28\u0c41 \u0c24\u0c3e\u0c1c\u0c3e\u0c17\u0c3e \u0c09\u0c02\u0c1a\u0c41\u0c24\u0c41\u0c02\u0c26\u0c3f.",
    "\ud83c\udf4e \u0c2a\u0c02\u0c21\u0c4d\u0c32\u0c41, \u0c15\u0c42\u0c30\u0c17\u0c3e\u0c2f\u0c32\u0c41 \u0c0e\u0c15\u0c4d\u0c15\u0c41\u0c35\u0c17\u0c3e \u0c24\u0c40\u0c38\u0c41\u0c15\u0c4b\u0c35\u0c21\u0c02 \u0c35\u0c32\u0c4d\u0c32 \u0c30\u0c4b\u0c17\u0c28\u0c3f\u0c30\u0c4b\u0c27\u0c15 \u0c36\u0c15\u0c4d\u0c24\u0c3f \u0c2a\u0c46\u0c30\u0c41\u0c17\u0c41\u0c24\u0c41\u0c02\u0c26\u0c3f.",
    "\ud83e\uddd8 \u0c12\u0c24\u0c4d\u0c24\u0c3f\u0c21\u0c3f \u0c24\u0c17\u0c4d\u0c17\u0c3f\u0c02\u0c1a\u0c21\u0c3e\u0c28\u0c3f\u0c15\u0c3f \u0c30\u0c4b\u0c1c\u0c41 10 \u0c28\u0c3f\u0c2e\u0c3f\u0c37\u0c3e\u0c32\u0c41 \u0c27\u0c4d\u0c2f\u0c3e\u0c28\u0c02 \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f."
  ];
  const eduResponses = [
    "\ud83d\udcda \u0c28\u0c47\u0c30\u0c4d\u0c1a\u0c41\u0c15\u0c4b\u0c35\u0c21\u0c02 \u0c1c\u0c40\u0c35\u0c3f\u0c24\u0c3e\u0c28\u0c4d\u0c28\u0c3f \u0c2e\u0c3e\u0c30\u0c4d\u0c1a\u0c47 \u0c36\u0c15\u0c4d\u0c24\u0c3f. \u0c2a\u0c4d\u0c30\u0c24\u0c3f\u0c30\u0c4b\u0c1c\u0c41 \u0c15\u0c4a\u0c24\u0c4d\u0c24 \u0c35\u0c3f\u0c37\u0c2f\u0c3e\u0c32\u0c28\u0c41 \u0c28\u0c47\u0c30\u0c4d\u0c1a\u0c41\u0c15\u0c4b\u0c02\u0c21\u0c3f.",
    "\ud83d\udd2c \u0c35\u0c3f\u0c1c\u0c4d\u0c1e\u0c3e\u0c28\u0c02: \u0c24\u0c46\u0c28\u0c46 \u0c0e\u0c2a\u0c4d\u0c2a\u0c21\u0c41 \u0c1a\u0c46\u0c21\u0c3f\u0c26\u0c3f \u0c15\u0c3e\u0c26\u0c41. \u0c05\u0c26\u0c3f \u0c30\u0c41\u0c1a\u0c3f \u0c2a\u0c21\u0c26\u0c41.",
    "\ud83e\uddee \u0c17\u0c23\u0c3f\u0c24\u0c02: \u0c38\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c3f\u0c28\u0c3f \u0c0f\u0c26\u0c3f\u0c24\u0c4b \u0c17\u0c41\u0c23\u0c3f\u0c38\u0c4d\u0c24\u0c47 \u0c2b\u0c32\u0c3f\u0c24\u0c02 \u0c38\u0c41\u0c28\u0c4d\u0c28\u0c3e. \u0c15\u0c3e\u0c28\u0c40 \u0c38\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c3f\u0c28\u0c3f \u0c38\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c24\u0c4b \u0c2d\u0c3e\u0c17\u0c3f\u0c02\u0c1a\u0c15\u0c42\u0c21\u0c26\u0c41.",
    "\ud83c\udf0d GK: \u0c2d\u0c3e\u0c30\u0c24\u0c26\u0c47\u0c36\u0c02\u0c32\u0c4b \u0c05\u0c24\u0c4d\u0c2f\u0c27\u0c3f\u0c15 \u0c1c\u0c28\u0c3e\u0c2d\u0c4d\u0c30\u0c3e \u0c17\u0c32 \u0c30\u0c3e\u0c37\u0c4d\u0c1f\u0c4d\u0c30\u0c02 \u0c09\u0c24\u0c4d\u0c24\u0c30 \u0c2a\u0c4d\u0c30\u0c26\u0c47\u0c36\u0c4d.",
    "\ud83d\udca1 \u0c28\u0c40\u0c24\u0c3f\u0c35\u0c3e\u0c15\u0c4d\u0c2f\u0c02: \u0c15\u0c37\u0c4d\u0c1f\u0c2a\u0c21\u0c3f\u0c24\u0c47 \u0c2b\u0c32\u0c3f\u0c24\u0c02 \u0c24\u0c2a\u0c4d\u0c2a\u0c15 \u0c35\u0c38\u0c4d\u0c24\u0c41\u0c02\u0c26\u0c3f. \u0c13\u0c2f\u0c2e\u0c3f \u0c35\u0c3f\u0c2b\u0c32\u0c2f\u0c02 \u0c15\u0c42\u0c21\u0c3e, \u0c12\u0c15 \u0c2c\u0c21\u0c3f."
  ];
  const pool = isHealth ? healthResponses : eduResponses;
  const fallbackText = pool[Math.floor(Math.random() * pool.length)];
  res.json({
    text: fallbackText,
    disclaimer: isHealth ? '⚠️ Idhi samaachaara maathrame. Vaidya salahaa kosam doctorne sampradheenchandam.' : null
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Socket.io Real-Time Chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('send-message', async (data) => {
    const { userId, userName, text } = data;
    if (!userId || !text) return;
    
    const { randomUUID } = require('crypto');
    const id = randomUUID();
    await db.runAsync(
      'INSERT INTO messages (id, sender_id, sender_name, text) VALUES (?, ?, ?, ?)',
      [id, userId, userName, text]
    );
    
    const message = {
      id,
      user_id: userId,
      user_name: userName,
      message: text,
      created_at: Math.floor(Date.now() / 1000)
    };
    
    io.emit('new-message', message);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const frontDist = path.join(__dirname, 'dist');
if (fs.existsSync(frontDist)) {
  app.use(express.static(frontDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontDist, 'index.html')));
}

const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n🎬 ILYNECT v3.0 - PREMIUM FAMILY EDITION`);
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🔗 API: http://localhost:${port}/api`);
    console.log(`💬 Real-Time Chat: Socket.io enabled`);
    console.log(`💾 Storage: LOCAL (No Firebase, No Drive!)`);
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