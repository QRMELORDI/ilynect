# 🎬 ILYNECT - Complete Family Connect App

**Built for our family. Designed with love. Deployed for free.**

[![Live Frontend](https://img.shields.io/badge/Live-Vercel-000000?style=for-the-badge)](https://ilynect.vercel.app)
[![Live Backend](https://img.shields.io/badge/Live-Render-46e3b4?style=for-the-badge)](https://ilynect-2.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-QRMELORDI/ilynect-181717?style=for-the-badge&logo=github)](https://github.com/QRMELORDI/ilynect)

---

## 📖 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Complete Project Structure](#complete-project-structure)
4. [All Changes Made](#all-changes-made)
5. [Ideas Discussed](#ideas-discussed)
6. [Setup Instructions](#setup-instructions)
7. [How to Test Everything](#how-to-test-everything)
8. [Release to Relatives](#release-to-relatives)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**ILYNECT** is a premium family connect app built for **Akshit (Prayagraj)** and **Brother (Nellore)**.

### Key Features
- ✅ **Real-Time Chat** with Socket.io (instant messaging)
- ✅ **Video Streaming** (Movies, Reels, Series)
- ✅ **Photo Gallery** with lightbox view
- ✅ **Daily Knowledge** (Health tips, Education, puzzles)
- ✅ **AI Assistant** (Groq API - Telugu + English)
- ✅ **Auto-Update** (App reloads when new version detected)
- ✅ **Auto-Wake Backend** (UptimeRobot pings every 5 mins)
- ✅ **Local Downloads** (Capacitor Filesystem for Android)
- ✅ **Premium UI** (iOS-style glassmorphism, Outfit font)

### Live URLs
| Service | URL | Status |
|---------|-----|--------|
| **Web App** | https://ilynect.vercel.app | ✅ Live |
| **Backend API** | https://ilynect-2.onrender.com/api | ✅ Live |
| **Health Check** | https://ilynect-2.onrender.com/api/health | ✅ Live |
| **UptimeRobot** | https://stats.uptimerobot.com/RwdMEFtOlW | ✅ Monitoring |
| **GitHub Repo** | https://github.com/QRMELORDI/ilynect | ✅ Source |

---

## 🏗️ Architecture

### Tech Stack
| Component | Technology | Purpose |
|-----------|-------------|---------|
| **Frontend** | React 19 + Vite + Capacitor 7 | iOS-style UI, PWA, Android app |
| **Backend** | Express.js + better-sqlite3 | RESTful API, local file storage |
| **Database** | SQLite (better-sqlite3) | Lightweight, zero-config, cross-platform |
| **Real-Time** | Socket.io 4.8 | Instant chat between Prayagraj & Nellore |
| **AI** | Groq API (free tier) | Health & Education assistant |
| **Deployment** | Vercel (Frontend) + Render (Backend) | 100% free, public URLs |

### How It Works
```
User (Prayagraj/Nellore)
    ↓
Frontend (Vercel) ←→ Backend API (Render)
    ↓                    ↓
  localStorage        SQLite DB + File Storage
    ↓
  Auto-update via version check
    ↓
  Capacitor → Android APK
```

---

## 📂 Complete Project Structure

```
ILYNECT/
├── backend/                          # Express.js Backend
│   ├── server.js                 # Entry point, Socket.io, all routes
│   ├── database.js               # better-sqlite3 wrapper
│   ├── render.yaml               # Render deployment config
│   ├── .env                      # Environment variables (not in git)
│   ├── routes/
│   │   ├── auth.js             # Login, register, update name
│   │   ├── videos.js            # Video CRUD, upload, stream
│   │   ├── photos.js            # Photo CRUD, upload, download
│   │   ├── chats.js             # Chat messages, Socket.io events
│   │   ├── presence.js          # Online users tracking
│   │   ├── daily.js             # Daily content (fallback)
│   │   ├── files.js             # File streaming, download
│   │   ├── version.js           # Version check for auto-update
│   │   └── health.js            # (if exists) Health check
│   ├── middleware/
│   │   └── auth.js              # JWT token generation
│   ├── services/
│   │   └── (removed)           # Drive service removed!
│   ├── uploads/                   # Local file storage
│   │   ├── videos/              # Uploaded videos
│   │   ├── photos/              # Uploaded photos
│   │   ├── thumbnails/          # Video thumbnails
│   │   └── tmp/                 # Temporary files
│   └── data/
│       └── onv_player.db        # SQLite database
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── App.jsx                # Router, auto-update, wake-up logic
│   │   ├── index.css               # Global styles, themes
│   │   ├── apiConfig.js           # API base URLs
│   │   ├── services/
│   │   │   ├── api.js             # REST API, fetchWithAuth, wake-up
│   │   │   ├── aiService.js       # AI ask wrapper
│   │   │   └── translations.js     # Telugu/English text
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # Login, logout, user state
│   │   │   └── SettingsContext.jsx # Theme, language toggle
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation
│   │   │   ├── BottomNav.jsx       # Fixed bottom navigation
│   │   │   ├── VideoPlayer.jsx     # Video player with controls
│   │   │   └── ContentActionModal.jsx # Action sheet for videos
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Login with wake-up
│   │   │   ├── HomePage.jsx        # Dashboard, quick cards
│   │   │   ├── VideosPage.jsx      # Movies grid, search
│   │   │   ├── GossipPage.jsx      # Reels (under 60s)
│   │   │   ├── PhotosPage.jsx      # Gallery with lightbox
│   │   │   ├── ChatPage.jsx        # WhatsApp-style chat
│   │   │   ├── UploadPage.jsx      # Video/Photo upload
│   │   │   ├── DownloadsPage.jsx   # Download manager
│   │   │   ├── ProfilePage.jsx     # Settings, version display
│   │   │   ├── HistoryPage.jsx     # Activity log
│   │   │   ├── EducationPage.jsx   # Daily knowledge
│   │   │   └── HealthPage.jsx      # Health tips + AI
│   │   └── utils/
│   │       └── platform.js        # Capacitor platform detection
│   ├── android/                      # Capacitor Android project
│   │   └── app/
│   │       ├── build/                # Build outputs
│   │       └── src/main/             # Android source
│   ├── dist/                         # Vite build output
│   └── capacitor.config.json        # Capacitor config
│
├── memory/                          # Memory files (not in git)
├── skills/                          # Skills discussed
│   └── persistence_memory.md         # This file!
├── .gitignore
├── .nvmrc                           # Node 20
├── render.yaml                      # Render deployment
└── README.md                        # This file
```

---

## 📝 All Changes Made

### Phase 1: Initial Setup
- ✅ Created React + Vite frontend
- ✅ Added Capacitor for Android
- ✅ Created Express backend with SQLite
- ✅ Added Socket.io for real-time chat
- ✅ Configured Vercel (frontend) + Render (backend)

### Phase 2: Firebase/Drive Removal
- ✅ Deleted `functions/` folder (Google Drive uploads)
- ✅ Deleted `firebase.js` from frontend
- ✅ Deleted `service-account.json`
- ✅ Removed `google-services.json`
- ✅ Removed all Drive API dependencies
- ✅ Rewrote `photos.js` to use local storage
- ✅ Rewrote `videos.js` to use local storage

### Phase 3: Critical Fixes
- ✅ Fixed `server.js` syntax errors
- ✅ Added missing `presence.js` route
- ✅ Fixed auth routes (`/api/auth/*`)
- ✅ Added `/api/wakeup` endpoint
- ✅ Fixed `fetchWithAuth()` to wake backend before requests
- ✅ Added UptimeRobot for 24/7 backend availability

### Phase 4: Auto-Update & Wake-Up
- ✅ `App.jsx` checks version on focus/resume
- ✅ `api.js` has `wakeUpBackend()` before ALL API calls
- ✅ `LoginPage.jsx` wakes backend before login
- ✅ UptimeRobot pings every 5 minutes

### Phase 5: UI/UX Overhaul
- ✅ Rewrote `ChatPage.jsx` (WhatsApp-style)
- ✅ Fixed chat bar visibility
- ✅ Removed duplicate online users display
- ✅ Added 3D button styles
- ✅ Fixed theme toggle (light/dark mode)
- ✅ Adjusted padding for Android safe areas
- ✅ Added version display in Profile page

### Phase 6: Download & Persistence
- ✅ Added Capacitor Filesystem for Android downloads
- ✅ Files save to device Downloads folder
- ✅ `localStorage` for caching (videos, daily content)
- ✅ User data persists in `localStorage`

---

## 💡 Ideas Discussed

### ✅ Implemented
1. **Auto-Wake Backend** - UptimeRobot + `fetchWithAuth()`
2. **Auto-Update** - Version check → Auto-reload from Vercel
3. **Local File Storage** - No Firebase, no Google Drive
4. **WhatsApp-Style Chat** - Visible input bar, real-time messages
5. **Download to Device** - Capacitor Filesystem for Android
6. **Premium UI** - Glassmorphism, animations, Outfit font
7. **Admin Role** - Auto-assign via email `aviindo863@gmail.com`

### 🔄 Discussed but Not Implemented (Future Ideas)
1. **Cloudflare R2** - Persistent storage (10GB free)
2. **Video Compression** - Automatic compression before upload
3. **Push Notifications** - New message alerts
4. **Offline Mode** - Service worker for full offline support
5. **Multiple Themes** - More color schemes
6. **Family Polls** - Voting on movies/photos
7. **Shared Calendar** - Family events

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ (v20 used)
- Git
- Android Studio (for APK build)
- GitHub account
- Render.com account (free)
- Vercel.com account (free)

### 1. Clone & Install
```bash
git clone https://github.com/QRMELORDI/ilynect.git
cd ilynect

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=3001
ADMIN_EMAIL=aviindo863@gmail.com
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
```

**Frontend (Vercel Environment):**
```
VITE_API_URL=https://ilynect-2.onrender.com/api
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Frontend**: http://localhost:5173  
**Backend**: http://localhost:3001/api

---

## 🧪 How to Test Everything

### Step 1: Wake Up Backend (Critical!)
Open in browser:
```
https://ilynect-2.onrender.com/api/health
```
**Should return:** `{"status":"ok", "version":"1.0.5", ...}`

### Step 2: Test Login (Fully Automatic)
1. Open: **https://ilynect.vercel.app**
2. Click **"User Login"**
3. Enter:
   - **Name**: `akshit`
   - **Email**: `aviindo863@gmail.com`
4. Click **"User Login"**
5. **App auto-wakes backend** → Logs you in as **Admin**!

### Step 3: Test Upload (Movies/Photos/Reels)
1. Click **"Upload"** → Select file
2. **Movies**: Admin only (you)
3. **Reels**: Under 60 seconds, auto-check duration
4. **Photos**: Any user can upload

### Step 4: Test Download (Saves to Device)
1. Click any video/photo → Click **"Download"**
2. **Android**: File saves to **Downloads folder**
3. **Web**: Browser download
4. Check `Downloads` page for progress

### Step 5: Test Real-Time Chat
1. Open chat page
2. Type message → Press **Enter**
3. **Instant delivery** via Socket.io
4. Online users shown at top (no duplicates!)

### Step 6: Test Auto-Update
1. Make a small UI change
2. Commit & push to GitHub
3. Render & Vercel auto-deploy
4. Refresh app → **Auto-reloads** with new version!

### Step 7: Test AI Assistant
1. Go to **Education** or **Health** page
2. Type question → Click **"Ask"**
3. Get response in Telugu-English mix
4. Fallback responses if API unavailable

---

## 🚀 Release to Relatives (Brother in Nellore)

### Step 1: Share Web App (Easiest!)
Send to brother:
```
https://ilynect.vercel.app
```
He can:
- Login with any email
- Chat with you in real-time
- Stream videos/photos
- Download content to his device

### Step 2: Build Android APK (Optional)
```bash
cd frontend

# Build frontend
npm run build

# Sync to Android
npx cap sync

# Open in Android Studio
npx cap open android
```

**In Android Studio:**
1. **Build** → **Build APKs**
2. APK location: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
3. Share APK via WhatsApp/email to brother

### Step 3: Brother Installs APK
1. Brother downloads APK
2. Enables "Install from unknown sources" on Android
3. Installs APK
4. Opens app → Logs in → Enjoys family connect!

---

## 🔧 Troubleshooting

### Issue: Login Failed / Server Error
**Cause**: Backend asleep or wrong URL  
**Fix**:
1. Wake up: https://ilynect-2.onrender.com/api/health
2. Check Vercel env variable: `VITE_API_URL`
3. Open browser console (F12) → Check red errors

### Issue: Backend Sleeping (Free Tier)
**Cause**: Render sleeps after 15 mins of inactivity  
**Fix**: UptimeRobot already configured!  
- Status page: https://stats.uptimerobot.com/RwdMEFtOlW
- Pings every 5 minutes → Keeps awake 24/7

### Issue: Database Wiped on Restart
**Cause**: Render free tier has ephemeral storage  
**Fix**: 
1. Re-register after restart (auto-admin for `aviindo863@gmail.com`)
2. Future: Upgrade to paid plan or use Cloudflare R2

### Issue: Downloads Not Working
**Cause**: Capacitor Filesystem not installed or permissions  
**Fix**:
```bash
cd frontend
npm install @capacitor/filesystem @capacitor/share --legacy-peer-deps
npx cap sync
```
Also add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Issue: Auto-Update Not Working
**Cause**: Version mismatch or cache  
**Fix**:
1. Check `backend/routes/version.js` → Current version: `1.0.5`
2. Check `frontend/src/App.jsx` → `APP_VERSION = '1.0.5'`
3. Clear browser cache → Refresh

### Issue: Chat Messages Not Showing
**Cause**: Socket.io not connected or CORS  
**Fix**:
1. Open console (F12) → Check for Socket.io connection errors
2. Verify backend is awake: https://ilynect-2.onrender.com/api/health
3. Check `socket.io` is properly initialized in `server.js`

---

## 📜 License & Credits

**Built by**: Akshit (Prayagraj)  
**For**: Our family (Prayagraj ↔ Nellore)  
**With**: React, Express, Socket.io, and love ❤️  

**ILYNECT** - *FAMILY CONNECT*

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Web App** | https://ilynect.vercel.app |
| **Backend API** | https://ilynect-2.onrender.com/api |
| **GitHub** | https://github.com/QRMELORDI/ilynect |
| **UptimeRobot** | https://stats.uptimerobot.com/RwdMEFtOlW |
| **Render Dashboard** | https://dashboard.render.com |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Groq API** | https://console.groq.com |

---

**Last Updated**: May 7, 2026  
**Version**: 3.0.0 (Premium Family Edition)  
**Status**: ✅ LIVE & READY FOR RELEASE!
