# 🧠 ILYNECT - Persistence Memory

**Last Updated**: May 7, 2026 (4:00 PM IST)  
**Version**: 3.1.1 (Fixed: Login error, chat unification, and storage cleanup)  
**Status**: ✅ LIVE  
**Backend**: https://ilynect-2.onrender.com  
**Frontend**: https://ilynect.vercel.app  
**GitHub**: https://github.com/QRMELORDI/ilynect  

---

## 🏗️ Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 19 + Vite + Capacitor 7 | iOS-style UI, dark/light theme |
| **Backend** | Express.js + better-sqlite3 | Node 20.x, port 3001 |
| **Database** | SQLite (better-sqlite3) | File-based, no GLIBC issues |
| **Real-Time** | Socket.io 4.8 | WebSocket chat + presence |
| **Storage** | Local filesystem on Render | `backend/uploads/` |
| **AI** | Groq API (llama3-8b) | Fallback to static content |
| **Auth** | JWT (30-day expiry) | localStorage storage |

---

## 📂 Project Structure

```
ILYNECT/
├── backend/
│   ├── server.js              # Express entry, routes, AI endpoint
│   ├── db/database.js          # better-sqlite3 wrapper (runAsync, getAsync, allAsync)
│   ├── routes/
│   │   ├── videos.js           # Video CRUD, upload, stream, download
│   │   ├── photos.js           # Photo CRUD, upload, download
│   │   ├── chats.js            # Chat messages, voting
│   │   ├── content.js          # Video interactions, watch sessions
│   │   ├── daily.js            # Daily content generation (AI + fallback)
│   │   └── files.js            # File streaming & download with Range support
│   ├── data/onv_player.db      # SQLite database (not tracked in git)
│   ├── uploads/
│   │   ├── videos/             # .mp4, .webm files
│   │   └── photos/             # .jpg, .png files
│   └── dist/                   # Built frontend (served as static)
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Router, Capacitor back handler
│   │   ├── apiConfig.js        # RENDER_API_URL = https://ilynect-2.onrender.com/api
│   │   ├── services/
│   │   │   ├── api.js          # REST API wrapper (fetchWithAuth, 60s timeout)
│   │   │   └── aiService.js    # AI ask endpoint wrapper
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx  # Login, logout, user state
│   │   │   └── SettingsContext.jsx # Theme toggle, translations
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # Email + name login
│   │   │   ├── HomePage.jsx     # Quick cards, daily previews
│   │   │   ├── VideosPage.jsx   # Movies grid, search, categories
│   │   │   ├── GossipPage.jsx   # Reels scroll-snap, delete button
│   │   │   ├── PhotosPage.jsx   # Gallery grid, lightbox
│   │   │   ├── ChatPage.jsx     # Messages, input box, online users
│   │   │   ├── UploadPage.jsx   # File upload (movies, reels, photos)
│   │   │   ├── ProfilePage.jsx  # Settings, theme toggle, logout
│   │   │   ├── HealthPage.jsx   # Tips + AI assistant
│   │   │   ├── EducationPage.jsx # GK, puzzles + AI tutor
│   │   │   └── HistoryPage.jsx  # Activity log
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── BottomNav.jsx    # Fixed bottom: 5 items
│   │       ├── VideoPlayer.jsx
│   │       └── ContentActionModal.jsx
│   ├── android/                 # Capacitor Android project
│   └── dist/                    # Vite build output
├── render.yaml                  # Render Blueprint config
├── .nvmrc                       # Node 20
└── persistence_memory.md
```

---

## 🔌 API Reference

**Base URL**: `https://ilynect-2.onrender.com/api`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login/create user (body: `{ name, email }`) |
| PATCH | `/auth/update-name` | Update display name |
| GET | `/auth/user/:id` | Get user by ID |
| GET | `/auth/family` | Get all family members |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/videos` | List videos (query: `sub_type`, `category`, `search`) |
| POST | `/videos/upload` | Upload video (multipart) |
| DELETE | `/videos/:id` | Delete video (admin or uploader only) |
| POST | `/videos/:id/view` | Record view |
| POST | `/videos/:id/download` | Record download |
| POST | `/videos/:id/interact` | Like/dislike |
| POST | `/videos/:id/watch-position` | Save watch progress |
| GET | `/videos/:id/watch-position` | Get saved position |

### Photos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/photos` | List all photos |
| POST | `/photos/upload` | Upload photo |
| DELETE | `/photos/:id` | Delete photo (admin or uploader only) |
| POST | `/photos/:id/download` | Record download |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/files/stream/video/:id` | Stream video with Range support |
| GET | `/files/download/video/:id` | Force download video |
| GET | `/files/download/photo/:id` | Force download photo |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats` | Get all messages |
| POST | `/chats` | Send message |
| POST | `/chats/:id/vote` | Upvote/downvote |

### Daily Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/daily` | Get today's content (fact, gk, quiz, health_tips, etc.) |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/ask` | Ask AI question (body: `{ prompt, type: 'health'\|'education' }`) |

### Presence
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/presence` | Update online status |
| GET | `/presence/online` | Get online users |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/version` | App version check |

---

## 🔐 Authentication

- **Admin email**: `aviindo863@gmail.com` (auto-assigned on first login)
- **JWT secret**: Auto-generated by Render (`JWT_SECRET` env var)
- **Token storage**: `localStorage` key `ilynect_token`
- **User storage**: `localStorage` key `ilynect_user`
- **Token expiry**: 30 days

---

## 🗄️ Database Schema (SQLite)

### users
```sql
id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, role TEXT DEFAULT 'user',
avatar_color TEXT, avatar_index INTEGER, created_at INTEGER
```

### videos
```sql
id TEXT PRIMARY KEY, title TEXT, description TEXT, category TEXT,
sub_type TEXT DEFAULT 'movie', filename TEXT, original_name TEXT,
thumbnail TEXT DEFAULT '', size_bytes INTEGER, duration_sec REAL,
mime_type TEXT, uploaded_by TEXT, uploader_name TEXT,
created_at INTEGER, views INTEGER, downloads INTEGER,
likes INTEGER, dislikes INTEGER, editors TEXT DEFAULT '[]',
viewers TEXT DEFAULT '[]'
```

### photos
```sql
id TEXT PRIMARY KEY, title TEXT, filename TEXT, original_name TEXT,
size_bytes INTEGER, mime_type TEXT, uploaded_by TEXT, uploader_name TEXT,
created_at INTEGER, downloads INTEGER
```

### messages
```sql
id TEXT PRIMARY KEY, sender_id TEXT, sender_name TEXT,
text TEXT, created_at INTEGER
```

### daily_content
```sql
id TEXT PRIMARY KEY, type TEXT, content TEXT, active_date TEXT
```

### comments, history, watch_sessions, chats, presence, user_interactions

---

## 🚀 Deployment

### Render Backend (Already Deployed)
- **URL**: `https://ilynect-2.onrender.com`
- **Node**: 20.20.2 (via `.nvmrc`)
- **Build**: `cd backend && npm install --production`
- **Start**: `cd backend && node server.js`
- **Port**: 3001
- **Env vars**: `GROQ_API_KEY`, `ADMIN_EMAIL`, `JWT_SECRET` (auto-generated)

### Vercel Frontend
- **URL**: `https://ilynect.vercel.app`
- **Env**: `VITE_API_URL` = `https://ilynect-2.onrender.com/api`

### Android APK
```
Location: frontend/android/app/build/outputs/apk/debug/app-debug.apk
Build: cd frontend && npm run build && npx cap sync android && cd android && gradlew assembleDebug
JAVA_HOME: C:\Program Files\Android\Android Studio\jbr
```

---

## 🔧 Fixes Applied (v3.1.0)

| Issue | Fix | File |
|-------|-----|------|
| **Theme toggle not working** | ProfilePage uses `useSettings()` instead of `useAuth()` | `ProfilePage.jsx` |
| **Chat input hidden behind nav** | ChatPage height: `calc(100dvh - 60px)` | `ChatPage.jsx` |
| **Uploader can't delete** | Check `uploaded_by === user.uid` OR admin | `VideosPage.jsx`, `GossipPage.jsx`, `PhotosPage.jsx` |
| **Health/Education blank** | Fallback content when API fails + static daily content | `HealthPage.jsx`, `EducationPage.jsx`, `daily.js` |
| **Mobile hang on back** | `navigate(-1)` instead of `window.history.back()` | `App.jsx` |
| **Groq API timeout** | 10s AbortController timeout | `server.js` |
| **Daily content fails** | Static Telugu/English fallback on AI failure | `daily.js` |
| **Login timeout** | 60s fetch timeout for Render wake-up | `api.js`, `LoginPage.jsx` |
| **Duplicate eduResponses** | Removed duplicate declaration | `server.js` |

---

## ⚠️ Known Limitations

1. **Render free tier sleeps** after 15 min of inactivity → First request takes 30-50s to wake up
2. **Ephemeral storage** → Files persist across sleeps but may be lost on redeploy from scratch
3. **No persistent database across rebuilds** → `onv_player.db` is on Render disk, not committed to git
4. **Groq API key optional** → Without it, AI falls back to static Telugu/English responses

---

## 🔑 Important Values

| Key | Value |
|-----|-------|
| Admin email | `aviindo863@gmail.com` |
| Backend URL | `https://ilynect-2.onrender.com` |
| API base | `https://ilynect-2.onrender.com/api` |
| Vercel URL | `https://ilynect.vercel.app` |
| Port | 3001 |
| Database file | `backend/data/onv_player.db` |
| Uploads dir | `backend/uploads/` |
| Groq model | `llama3-8b-8192` |

---

*Built by Akshit (Navy) for the KRGN family*  
---

### 🟢 1.0.4: Final Stability Update
1.  **Login Fix**: Replaced ESM-only `uuid` with Node's native `crypto.randomUUID()`. This was the cause of the "Server error" during login.
2.  **Storage Fix**: Migrated `videos.js` back to local filesystem storage from Google Drive to ensure 100% self-reliance.
3.  **Chat Unification**: Unified `chats` and `messages` tables into a single `messages` table. Socket.io and REST API now share the same source of truth.
4.  **UI Polish**: Fixed `maxWidth` CSS warning and set production API URL to `https://ilynect-2.onrender.com`.
5.  **Automatic Updates**: App now correctly checks for version `1.0.4` and handles cold-starts with better timeout messaging.

### UptimeRobot Status Page
**URL**: https://stats.uptimerobot.com/RwdMEFtOlW
(Keep backend awake 24/7)
