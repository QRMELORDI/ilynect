const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'media.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      originalName TEXT,
      fileName TEXT,
      fileType TEXT,
      mimeType TEXT,
      size INTEGER,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
