const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'onv_player.db'));

// Compatibility wrappers for routes using async API
db.runAsync = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.run(params);
};

db.getAsync = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.get(params);
};

db.allAsync = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.all(params);
};

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema initialization
const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    avatar_color TEXT DEFAULT '#E50914',
    avatar_index INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    sub_type TEXT DEFAULT 'movie',
    filename TEXT NOT NULL,
    original_name TEXT,
    thumbnail TEXT DEFAULT '',
    size_bytes INTEGER DEFAULT 0,
    duration_sec REAL DEFAULT 0,
    mime_type TEXT,
    uploaded_by TEXT,
    uploader_name TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    editors TEXT DEFAULT '[]',
    viewers TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS daily_content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content_json TEXT NOT NULL,
    active_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS user_interactions (
    user_id TEXT NOT NULL,
    content_id TEXT NOT NULL,
    type TEXT NOT NULL,
    PRIMARY KEY (user_id, content_id)
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    title TEXT DEFAULT 'Untitled',
    filename TEXT NOT NULL,
    original_name TEXT,
    size_bytes INTEGER DEFAULT 0,
    mime_type TEXT,
    uploaded_by TEXT,
    uploader_name TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    downloads INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    user_name TEXT,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    action TEXT NOT NULL,
    content_title TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS watch_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    video_id TEXT,
    last_position_sec INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );


  CREATE TABLE IF NOT EXISTS presence (
    user_id TEXT PRIMARY KEY,
    user_name TEXT,
    last_seen INTEGER DEFAULT (strftime('%s','now'))
  );
`;

db.exec(schema);

// Migrations for existing databases
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN avatar_index INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN thumbnail TEXT DEFAULT ''"); } catch {}

console.log('✅ ILYNECT Database Initialized (better-sqlite3)');
module.exports = db;
