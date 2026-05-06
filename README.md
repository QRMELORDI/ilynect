# ILYNECT - Premium Family Connect App

<div align="center">

**Version:** 1.1.0 | **Platform:** Android + Web | **Status:** ✅ Production Ready

A beautiful, premium iOS-style family media sharing app with Google Drive cloud storage.

[Features](#-features) • [Architecture](#-architecture) • [Setup](#-setup) • [API](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📱 Overview

ILYNECT is a family media sharing application that lets your family upload, watch, and share Movies, Reels, and Photos. Built with a premium iOS-inspired UI, it runs entirely on free services:

- **Backend:** Node.js + Express on Render (free tier)
- **Database:** SQLite (embedded, no separate server)
- **Storage:** Google Drive (via Service Account)
- **Frontend:** React + Vite + Capacitor (Android APK)

**Zero Firebase, zero paid services, zero monthly costs.**

## ✨ Features

### Media Management
- 🎬 **Movies** - Admin-only upload, categorized viewing
- 📸 **Photos** - Family photo gallery with cloud storage
- 🎯 **Reels** - Short-form vertical video feed (TikTok-style)
- ☁️ **Google Drive Storage** - All media stored in Drive folders
- 📥 **Download** - Save content to device
- 🔄 **Auto-wake Backend** - Render free tier sleeps, app wakes it automatically

### User Experience
- 🎨 **Premium iOS UI** - Glassmorphism, smooth animations, dark/light mode
- 👋 **Waving Hand Greeting** - Personalized welcome on home screen
- 📱 **Android Back Button** - Proper navigation (doesn't exit app)
- 🌐 **Bilingual** - English + Telugu translations
- 🔒 **Auth System** - Token-based authentication with SQLite users

### Removed Features
- ❌ Chat (replaced by direct sharing)
- ❌ Health section
- ❌ Education section

## 🏗️ Architecture

```
ILYNECT/
├── backend/                    # Node.js Express API
│   ├── server.js              # Main server + Socket.io (legacy)
│   ├── db/database.js         # SQLite schema + migrations
│   ├── services/
│   │   └── driveService.js    # Google Drive API integration
│   ├── routes/
│   │   ├── auth.js            # Login, register, user management
│   │   ├── videos.js          # Video upload, list, stream, delete
│   │   ├── photos.js          # Photo upload, list, delete
│   │   ├── files.js           # Stream/download/photo endpoints
│   │   ├── presence.js        # Online user tracking
│   │   ├── history.js         # User activity history
│   │   └── version.js         # App version checking
│   └── dist/                  # Frontend production build
│
├── frontend/                   # React + Vite + Capacitor
│   ├── src/
│   │   ├── App.jsx            # Routing + Capacitor back button
│   │   ├── apiConfig.js       # API endpoints configuration
│   │   ├── services/
│   │   │   ├── api.js         # All API calls (upload, fetch, etc.)
│   │   │   └── translations.js # EN/TE translations
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # User authentication state
│   │   │   └── SettingsContext.jsx # Theme + language state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Welcome + quick access cards
│   │   │   ├── VideosPage.jsx     # Movies browser
│   │   │   ├── PhotosPage.jsx     # Photo gallery
│   │   │   ├── GossipPage.jsx     # Reels (vertical feed)
│   │   │   ├── UploadPage.jsx     # Upload form
│   │   │   ├── HistoryPage.jsx    # User activity
│   │   │   ├── DownloadsPage.jsx  # Downloaded content
│   │   │   ├── ProfilePage.jsx    # User profile + settings
│   │   │   └── LoginPage.jsx      # Auth screen
│   │   └── components/
│   │       ├── Navbar.jsx         # Top navigation
│   │       └── BottomNav.jsx      # Floating bottom nav
│   └── android/               # Capacitor Android project
│       └── app/build/outputs/apk/debug/app-debug.apk
```

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Java JDK 17+ (for Android builds)
- Android Studio (for APK builds)

### Backend Setup

```bash
cd backend
npm install

# Create .env file:
PORT=3001
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...}  # Full JSON
ADMIN_EMAIL=your-admin@email.com

npm start
```

### Google Drive Setup
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a Service Account
4. Download the JSON key
5. **Share your Drive folders** with the service account email (Editor access)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev          # Development
npm run build        # Production build
npx cap sync android # Sync to Android
```

### Build APK

```bash
cd frontend/android
# With JAVA_HOME set to Android Studio JBR:
./gradlew assembleDebug

# APK location:
# frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

## ☁️ Google Drive Integration

### Folder Structure
| Type | Folder ID |
|------|-----------|
| Root (ONV_MEDIA) | `1vi2Sr6a4JfL1rM8lj2grMd0alo2Lnabx` |
| Movies | `12Syy28-nBlUd5Qxc-3bESiD-L9R3y_gT` |
| Photos | `1DvVjFqkTxxipvIr8mvKJAVDb_HxITFSI` |
| Reels | `1hcj3cqng0hKuytACJeP3eZB9tztSPcFL` |

### Upload Flow
1. User selects file in app
2. Frontend sends `multipart/form-data` to `/api/videos/upload` or `/api/photos/upload`
3. Backend saves to local temp, then uploads to Google Drive via `driveService.uploadFile()`
4. Drive returns `fileId`, stored in DB `drive_file_id` column
5. Local temp file is deleted
6. If Drive upload fails, falls back to local storage

### Stream/Download Flow
1. App requests `/api/files/stream/:type/:id`
2. Backend checks if `drive_file_id` exists in DB
3. If yes → streams from Google Drive
4. If no → falls back to local file
5. Supports Range headers for video seeking

## 🔌 API Reference

### Base URL
- Production: `https://ilynect-2.onrender.com/api`
- Local: `http://localhost:3001/api`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (also wakes server) |
| POST | `/auth/login` | Login with email + name |
| POST | `/videos/upload` | Upload video (admin for movies) |
| GET | `/videos` | List videos (filter: `sub_type`, `category`, `search`) |
| DELETE | `/videos/:id` | Delete video |
| POST | `/photos/upload` | Upload photo |
| GET | `/photos` | List photos |
| DELETE | `/photos/:id` | Delete photo |
| GET | `/files/stream/:type/:id` | Stream video/photo (supports Range) |
| GET | `/files/download/:type/:id` | Download file |
| GET | `/files/photo/:id` | Direct photo view |
| POST | `/videos/:id/view` | Record view |
| POST | `/videos/:id/interact` | Like/dislike |
| GET | `/history/:userId` | User activity history |
| POST | `/presence` | Set user online |
| GET | `/presence/online` | Get online users |
| GET | `/version` | Check app version |

### Auth
All endpoints (except `/health`) require:
```
Authorization: Bearer <token>
```

### Upload (Video)
```
POST /api/videos/upload
Content-Type: multipart/form-data

video: <file>
title: string
category: string
sub_type: movie|reels|gossip
userId: string
userName: string
```

### Upload (Photo)
```
POST /api/photos/upload
Content-Type: multipart/form-data

photos: <file>
title: string
userId: string
userName: string
```

## 🚢 Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect repo to Render as Web Service
3. Set environment variables:
   - `GOOGLE_SERVICE_ACCOUNT` - Full JSON string
   - `ADMIN_EMAIL` - Admin email address
   - `NODE_ENV` - production
4. Deploy - Render auto-deploys on push
5. **Auto-wake**: Frontend pings `/api/health` before every request

### Frontend (APK)
1. Build: `npm run build`
2. Sync: `npx cap sync android`
3. Build APK: `cd android && ./gradlew assembleDebug`
4. Install on device

## 🗄️ Database Schema

### Tables
- **users** - id, name, email, role, avatar_color, avatar_index, created_at
- **videos** - id, title, description, category, sub_type, filename, original_name, thumbnail, size_bytes, duration_sec, mime_type, uploaded_by, uploader_name, drive_file_id, views, downloads, likes, dislikes, created_at
- **photos** - id, title, filename, original_name, size_bytes, mime_type, uploaded_by, uploader_name, drive_file_id, downloads, created_at
- **history** - id, user_id, user_name, content_id, content_type, action, content_title, created_at
- **presence** - user_id, user_name, last_seen
- **comments** - id, content_id, user_id, user_name, text, created_at
- **user_interactions** - user_id, content_id, type

### Migrations
New columns added via `ALTER TABLE` with `try/catch` to avoid errors on fresh installs:
- `videos.drive_file_id TEXT`
- `photos.drive_file_id TEXT`

## 🔐 Security

- Service account credentials stored in Render env vars (not in code)
- Token-based auth with `better-sqlite3`
- Admin-only movie uploads
- CORS configured for all origins (adjust for production)
- File size limits: 5GB videos, 50MB photos

## 📊 Version History

| Version | Changes |
|---------|---------|
| 1.1.0 | Google Drive integration, chat removal, premium UI, auto-wake |
| 1.0.5 | Presence tracking, version checking, profile page |
| 1.0.4 | SQLite migration, chat unified |
| 1.0.3 | Auto-update, Capacitor downloads |

## 🛠️ Troubleshooting

### Backend won't start
- Check `GOOGLE_SERVICE_ACCOUNT` env var is valid JSON
- Verify port 3001 is free

### Upload fails
- Check Drive Service Account has **Editor** access to folders
- Verify folder IDs in `driveService.js`
- Check logs: `Drive upload failed` message indicates Drive issue

### APK won't install
- Enable "Unknown sources" in Android settings
- Check Java/Gradle versions match

### Videos don't stream
- Drive API quota may be exceeded
- Check `drive_file_id` exists in DB
- Fallback to local storage if Drive fails

## 📄 License

Private - Family use only.

---

<div align="center">
Made with ❤️ in Prayagraj
</div>
