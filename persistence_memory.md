# 🧠 ILYNECT — Persistence Memory (v2.0)

**Last Updated:** 2026-05-06
**Project:** ILYNECT — FAMILY CONNECT
**Package:** `com.ilynect.app`
**GitHub:** https://github.com/QRMELORDI/ilynect

---

## 🏗️ ARCHITECTURE (Complete)

### Frontend: React + Vite + Capacitor
- **Framework:** React 19, Vite 6, React Router 7
- **Mobile Wrapper:** Capacitor 7 (Android)
- **UI Paradigm:** iPhone/iOS Ultra-Premium Design
  - **Font:** Outfit (geometric, premium)
  - **Effects:** Glassmorphism with 1px refraction borders, spring physics
  - **Themes:** Light/Dark mode + Custom BG Palettes (Mint Purple, Juicy Orange, Rose Red, Premium Dark)
  - **Animations:** Royal purple wave, wave hand, human float
  - **Safe Areas:** Responsive padding with `env(safe-area-inset-*)`

### Backend: Express.js + SQLite (v2.0 — Firebase-Free)
- **Runtime:** Node.js + Express
- **Database:** SQLite (`backend/data/onv_player.db`) — file-based, no external DB
- **Auth:** JWT tokens (30-day expiry), no Firebase Auth
- **File Storage:** Local server disk (`backend/uploads/videos/`, `backend/uploads/photos/`)
- **File Serving:** Express routes with Range-request support (seek/scrub) + download headers
- **AI:** Groq API (optional) with rich built-in fallback responses
- **No External Services:** Zero Firebase, Zero Google Drive, Zero API keys required

### Tech Stack Summary
```
App (Capacitor/Android APK)
    ↓ HTTP/REST
Backend (Express on Render — Free)
    ├── SQLite Database (persistent, local)
    ├── File Storage (local disk)
    └── AI (Groq API or fallback)
```

---

## 📁 PROJECT STRUCTURE

```
ILYNECT/
├── backend/
│   ├── server.js              ← Main entry point (Express + all routes)
│   ├── db/database.js         ← SQLite init + schema + helper methods
│   ├── middleware/auth.js     ← JWT generateToken, authenticateToken, requireAdmin
│   ├── routes/
│   │   ├── auth.js            ← POST /api/auth/login, PATCH /update-name, GET /user/:id
│   │   ├── videos.js          ← CRUD for videos, upload, interactions, comments, watch-position
│   │   ├── photos.js          ← CRUD for photos, upload, download tracking
│   │   ├── chats.js           ← GET/POST messages
│   │   ├── content.js         ← Daily AI-generated education + health content
│   │   ├── daily.js           ← Alternative daily content endpoint
│   │   ├── files.js           ← File streaming (Range), download, photo view
│   │   ├── history.js         ← User activity history
│   │   ├── social.js          ← Social interactions
│   │   └── version.js         ← App version check
│   ├── uploads/               ← Local file storage (not tracked in git)
│   │   ├── videos/            ← Video files
│   │   ├── photos/            ← Photo files
│   │   └── thumbnails/        ← Thumbnail images
│   ├── data/                  ← SQLite database (not tracked in git)
│   ├── package.json
│   └── .env                   ← PORT, ADMIN_EMAIL, JWT_SECRET, GROQ_API_KEY
├── frontend/
│   ├── src/
│   │   ├── App.jsx            ← Router, presence tracking, version check
│   │   ├── firebase.js        ← DELETED (removed in v2.0)
│   │   ├── apiConfig.js       ← API_BASE_URL, ENDPOINTS config
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      ← JWT login, logout, user session
│   │   │   └── SettingsContext.jsx  ← Theme, language, bgColor toggles
│   │   ├── services/
│   │   │   ├── api.js               ← ALL REST API calls (replaced Firebase)
│   │   │   ├── aiService.js         ← AI ask function (calls backend)
│   │   │   ├── driveService.js      ← DELETED (removed in v2.0)
│   │   │   └── translations.js      ← EN/TE translations
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        ← Email + name login, admin login button
│   │   │   ├── HomePage.jsx         ← Dashboard with all sections
│   │   │   ├── VideosPage.jsx       ← Movies grid, category filter, modal
│   │   │   ├── GossipPage.jsx       ← Instagram-style reels scroll
│   │   │   ├── PhotosPage.jsx       ← Photo grid + lightbox
│   │   │   ├── ChatPage.jsx         ← Real-time chat, polling, presence
│   │   │   ├── HealthPage.jsx       ← AI health assistant + daily tips
│   │   │   ├── EducationPage.jsx    ← Daily knowledge + AI tutor
│   │   │   ├── UploadPage.jsx       ← Movie/reel/photo upload with progress
│   │   │   ├── HistoryPage.jsx      ← User activity log
│   │   │   ├── DownloadsPage.jsx    ← Download queue + available videos
│   │   │   └── ProfilePage.jsx      ← Settings, theme, language, logout
│   │   └── components/
│   │       ├── BottomNav.jsx        ← Fixed bottom navigation (5 tabs)
│   │       ├── Navbar.jsx           ← Top header bar
│   │       ├── VideoPlayer.jsx      ← Full-screen video player with comments
│   │       ├── ContentActionModal.jsx ← Watch/Download popup
│   │       ├── VideoCard.jsx        ← Video thumbnail card
│   │       ├── EditModal.jsx        ← Edit video metadata
│   │       └── Toast.jsx            ← Notification toast
│   ├── capacitor.config.json  ← App ID, name, webDir
│   ├── package.json
│   └── index.html
├── render.yaml                ← Render deployment config
├── README.md                  ← Project documentation
└── .gitignore                 ← Git ignore rules
```

---

## 🔌 API ENDPOINTS (Complete Reference)

### Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{email, name}` | `{success, user, token}` |
| PATCH | `/api/auth/update-name` | `{userId, name}` | `{success, user, token}` |
| GET | `/api/auth/user/:id` | — | User object |

### Videos
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/videos` | Query: `?category=X&sub_type=movie&search=Y` | `{videos: [...]}` |
| POST | `/api/videos/upload` | FormData: `video, title, category, sub_type, userId, userName, thumbnail` | `{success, video}` |
| GET | `/api/videos/:id` | — | Video object |
| PATCH | `/api/videos/:id` | `{title, description, category}` | `{success, video}` |
| DELETE | `/api/videos/:id` | — | `{success}` |
| POST | `/api/videos/:id/view` | `{userId, userName}` | `{success}` |
| POST | `/api/videos/:id/download` | `{userId, userName}` | `{success}` |
| POST | `/api/videos/:id/interact` | `{userId, type: 'like'\|'dislike'}` | `{success, likes, dislikes, userType}` |
| GET | `/api/videos/:id/comments` | — | `[comments]` |
| POST | `/api/videos/:id/comments` | `{userId, userName, text}` | Comment object |
| POST | `/api/videos/:id/watch-position` | `{userId, positionSec}` | `{success}` |
| GET | `/api/videos/:id/watch-position` | Query: `?userId=X` | `{positionSec}` |

### Photos
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/photos` | Query: `?search=X` | `{photos: [...]}` |
| POST | `/api/photos/upload` | FormData: `photos[], title, userId, userName` | `{success, photos}` |
| PATCH | `/api/photos/:id` | `{title}` | `{success, photo}` |
| DELETE | `/api/photos/:id` | — | `{success}` |
| POST | `/api/photos/:id/download` | `{userId, userName}` | `{success}` |

### Chat
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/chats` | — | `[messages]` |
| POST | `/api/chats` | `{userId, userName, text}` | Message object |
| DELETE | `/api/chats/clear` | `{userId}` | `{success}` |

### Files (Streaming & Download)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/stream/video/:id` | Stream video with Range support (seek/scrub) |
| GET | `/api/files/stream/photo/:id` | Stream photo |
| GET | `/api/files/download/video/:id` | Force download video (Content-Disposition: attachment) |
| GET | `/api/files/download/photo/:id` | Force download photo |
| GET | `/api/files/photo/:id` | View photo directly |

### Content & AI
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/ai/ask` | `{prompt, type: 'health'\|'education'}` | `{text, disclaimer}` |
| GET | `/api/daily` | Query: `?type=education\|health` | Daily content JSON |
| GET | `/api/content/daily` | Query: `?type=education\|health` | AI-generated content |

### Presence & Misc
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/presence` | `{userId, userName}` | `{success}` |
| GET | `/api/presence/online` | — | `[{id, userName}]` |
| GET | `/api/history/:userId` | — | `[history]` |
| GET | `/api/version` | — | `{version, update_required}` |
| GET | `/api/health` | — | `{status, time}` |

---

## 🗄️ DATABASE SCHEMA (SQLite)

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',        -- 'admin' or 'user'
  avatar_color TEXT DEFAULT '#E50914',
  avatar_index INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Videos (movies, reels, gossip)
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',  -- 'Movies', 'Series', 'Kids', 'General'
  sub_type TEXT DEFAULT 'movie',    -- 'movie', 'reels', 'gossip'
  filename TEXT NOT NULL,           -- stored on disk
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

-- Photos
CREATE TABLE photos (
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

-- Chat Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Comments
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- User Interactions (likes/dislikes)
CREATE TABLE user_interactions (
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  type TEXT NOT NULL,              -- 'like', 'dislike'
  PRIMARY KEY (user_id, content_id)
);

-- Daily Content (AI-generated)
CREATE TABLE daily_content (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,              -- 'education', 'health'
  content_json TEXT NOT NULL,
  active_date TEXT NOT NULL        -- 'YYYY-MM-DD'
);

-- History (user activity log)
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  user_name TEXT,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,      -- 'video', 'photo'
  action TEXT NOT NULL,            -- 'upload', 'view', 'download', 'edit'
  content_title TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Watch Sessions (resume playback)
CREATE TABLE watch_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  video_id TEXT,
  last_position_sec INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Presence (online users)
CREATE TABLE presence (
  user_id TEXT PRIMARY KEY,
  user_name TEXT,
  last_seen INTEGER DEFAULT (strftime('%s','now'))
);
```

---

## 🔐 AUTH & ROLE SYSTEM

### Admin Email
Default: `aviindo863@gmail.com`
Configurable via environment variable: `ADMIN_EMAIL`

### Role Assignment
- On first login, if email matches `ADMIN_EMAIL` → role set to `admin`
- All other users → role set to `user`

### Permissions
| Action | Admin | User |
|--------|-------|------|
| Upload Movies | ✅ | ❌ (403 Forbidden) |
| Upload Reels | ✅ | ✅ |
| Upload Photos | ✅ | ✅ |
| Chat | ✅ | ✅ |
| Watch/Download | ✅ | ✅ |
| Delete own uploads | ✅ | ✅ |

### JWT Flow
1. User logs in → POST `/api/auth/login` → returns `{user, token}`
2. Token stored in `localStorage` as `ilynect_token`
3. All API calls include `Authorization: Bearer <token>`
4. Token expires in 30 days
5. On logout → token and user data cleared from localStorage

---

## 🚀 DEPLOYMENT — RENDER (FREE)

### Why Render?
- Free web hosting for Node.js apps
- Always-on (with 15-min sleep after inactivity — auto-wakes on request)
- Free tier: 750 hours/month (enough for 1 app always running)
- Ephemeral disk (files persist across restarts, lost on redeploy)

### Step-by-Step Deployment

#### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub (same account: `QRMELORDI`)

#### 2. Create Web Service
- Click **New** → **Web Service**
- Select the `ilynect` repository
- Configure:

| Setting | Value |
|---------|-------|
| Name | `ilynect` |
| Root Directory | `backend` |
| Environment | `Node` |
| Build Command | `cd ../frontend && npm install && npm run build && cd ../backend && npm install --production` |
| Start Command | `node server.js` |
| Instance Type | `Free` |

#### 3. Add Environment Variables
In Render dashboard → Environment tab, add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Required |
| `ADMIN_EMAIL` | `aviindo863@gmail.com` | Or your admin email |
| `JWT_SECRET` | Any random string | e.g., `ilynect-secret-2026-random-key` |
| `GROQ_API_KEY` | (Optional) | Get free key at console.groq.com — AI works without it too |

#### 4. Deploy
- Click **Create Web Service**
- Wait 3-5 minutes for build
- Note your URL: `https://ilynect-xxxx.onrender.com`

#### 5. Update Frontend API URL
Edit `frontend/src/apiConfig.js`:
```javascript
const RENDER_API_URL = "https://ilynect-xxxx.onrender.com/api"; // Replace with your URL
```

---

## 📱 BUILD APK — ANDROID STUDIO

### Prerequisites
- Android Studio installed (latest)
- JDK 17+ installed
- Node.js installed

### Step-by-Step

#### 1. Set Production API URL
Edit `frontend/src/apiConfig.js`:
```javascript
const IS_PRODUCTION = true;  // Force production mode
const RENDER_API_URL = "https://ilynect-xxxx.onrender.com/api"; // Your Render URL
const LOCAL_API_URL = "http://localhost:3001/api";
export const API_BASE_URL = IS_PRODUCTION ? RENDER_API_URL : LOCAL_API_URL;
```

#### 2. Build Frontend
```powershell
cd C:\Users\akshi\Desktop\ILYNECT\frontend
npm run build
```

#### 3. Sync with Capacitor
```powershell
npx cap sync android
```

#### 4. Open in Android Studio
```powershell
npx cap open android
```
This opens the Android project in Android Studio.

#### 5. Verify Android Studio Setup
In Android Studio:
- Wait for Gradle sync to complete (bottom progress bar)
- Check for errors in the Build tab
- If errors appear, click **Sync Project with Gradle Files** (elephant icon)

#### 6. Build Debug APK (For Testing)
- Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Wait for build to complete
- Click **locate** in the notification popup
- APK location: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

#### 7. Build Release APK (For Distribution)
If you want a signed APK for sharing:
- Menu: **Build** → **Generate Signed Bundle / APK**
- Select **APK** → Next
- Create new keystore:
  - Key store path: `C:\Users\akshi\Desktop\ILYNECT\ilynect-release.keystore`
  - Password: Choose a strong password (remember it!)
  - Alias: `ilynect`
  - Validity: 25 years
- Build Type: `release`
- Click **Finish**
- APK location: `frontend/android/app/build/outputs/apk/release/app-release.apk`

#### 8. Install on Phone
- Transfer APK to phone (USB, WhatsApp, Google Drive, etc.)
- On phone: Open APK file → Allow "Install from unknown sources" → Install
- Open the ILYNECT app

---

## 🔄 UPDATE WORKFLOW

### Backend-Only Changes (No APK Needed)
1. Edit backend files
2. `git add . && git commit -m "fix" && git push`
3. Render auto-deploys in ~3 minutes
4. App updates instantly (no APK rebuild)

### Frontend/UI Changes (New APK Required)
1. Edit frontend files
2. `git add . && git commit -m "update" && git push`
3. `cd frontend && npm run build`
4. `npx cap sync android`
5. Build new APK in Android Studio
6. Share new APK with users

---

## 🎯 KEY IMPLEMENTATION DETAILS

### File Upload Flow
1. User selects file → FormData created with `video`/`photos` field
2. XHR request to `/api/videos/upload` or `/api/photos/upload`
3. Multer saves file to `backend/uploads/videos/` or `backend/uploads/photos/`
4. Metadata saved to SQLite database
5. Response includes video/photo object with ID
6. Frontend updates UI

### Video Streaming Flow
1. User clicks video → opens VideoPlayer component
2. VideoPlayer sets `src` to `/api/files/stream/video/{id}`
3. Browser requests video with Range header (supports seeking)
4. Server reads file, sends chunked response with `206 Partial Content`
5. Video plays in HTML5 `<video>` element with native controls

### Video Download Flow
1. User clicks Download button
2. Browser navigates to `/api/files/download/video/{id}`
3. Server sets `Content-Disposition: attachment` header
4. Browser downloads file with original filename

### Chat Polling (Real-time Feel)
1. ChatPage mounts → calls `startChatPoll(callback)`
2. Poll fetches `/api/chats` every 3 seconds
3. Callback updates message list
4. On ChatPage unmount → `stopChatPoll()` cleans up
5. New messages appear within 3 seconds

### Online Presence
1. AuthContext: `setUserOnline(userId, userName)` called every 30 seconds
2. Server stores `last_seen` timestamp in `presence` table
3. Users with `last_seen` within 5 minutes = "online"
4. ChatPage shows online users list

### Daily Content Generation
1. `/api/daily` endpoint called
2. Checks if content exists for today in SQLite
3. If yes → returns cached content
4. If no → calls Groq AI to generate content
5. Saves to SQLite → returns response
6. Frontend caches in localStorage (1 day expiry)

### AI Assistant Flow
1. User types question → `askAI(prompt, type)`
2. POST to `/api/ai/ask` with `{prompt, type}`
3. Backend calls Groq API (if key available)
4. If Groq fails → uses built-in Telugu/English fallback responses
5. Response displayed in chat-like UI
6. Health responses include medical disclaimer

---

## ⚠️ IMPORTANT NOTES & LIMITATIONS

### Render Free Tier Limitations
- **Disk is ephemeral**: Files persist across restarts but are lost on redeploy
- **Sleeps after 15 min**: First request after sleep takes ~30 sec to wake up
- **750 hours/month**: Enough for 1 app always running
- **Not CDN-level streaming**: Video streaming quality depends on server location

### File Storage
- All files stored on Render server disk
- For large-scale production, consider adding external storage (Backblaze B2, Wasabi, Cloudflare R2)
- Current setup works fine for family-scale usage (<50GB)

### Database
- SQLite on Render disk — persists across restarts
- Backed up on each deploy (but files in uploads/ are lost on redeploy)
- For true persistence, consider migrating to PostgreSQL (Neon, Supabase free tier)

### Security
- JWT tokens expire after 30 days
- No HTTPS enforcement at app level (Render provides HTTPS automatically)
- Admin role checked server-side for movie uploads
- CORS allows all origins (adjust for production)

---

## 🔧 TROUBLESHOOTING

### "Network Error" in APK
- Check `frontend/src/apiConfig.js` — URL must match your Render URL
- Test in browser: `https://your-app.onrender.com/api/health`

### Videos Not Loading
- Check Render logs for errors
- Verify files exist in `backend/uploads/videos/`
- Check file permissions

### Blank Screen
- Open Chrome DevTools → `chrome://inspect` → inspect phone app
- Check console for errors

### Upload Fails for Large Files
- Render free tier has request size limits
- Compress videos before upload (HandBrake: 720p, RF 24)
- Recommended max file size: 500MB

### Chat Not Updating
- Polling runs every 3 seconds
- Check Network tab in DevTools for failed requests
- Verify `/api/chats` returns data

---

*Memory Updated: 2026-05-06 — Complete v2.0 rewrite, Firebase-free, Render-ready*
