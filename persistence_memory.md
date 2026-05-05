# 🧠 ILYNECT - Persistence Memory
**Last Updated**: May 7, 2026 (Render Live)  
**Version**: 3.0.0 (Premium Family Edition - Firebase Free, Render Deployed, Real-Time Chat)  

---

## 🟢 Current Live Status
| Component | Status | URL/Location |
|-----------|--------|---------------|
| **GitHub Repo** | ✅ Live | https://github.com/QRMELORDI/ilynect.git |
| **Backend (Render)** | ✅ Live | https://ilynect-2.onrender.com |
| **API Base** | ✅ Live | https://ilynect-2.onrender.com/api |
| **Health Check** | ✅ Live | https://ilynect-2.onrender.com/api/health |
| **Database** | ✅ Initialized | better-sqlite3 (SQLite) |
| **Node.js Version** | ✅ 20.20.2 | As configured in Render |
**Status**: ✅ LIVE at https://ilynect-2.onrender.com

---

## 🏗️ 1. Project Architecture (Current State)
### **Full Stack Overview**
| Component | Technology | Notes |
|-----------|-------------|-------|
| **Frontend** | React 19 + Vite + Capacitor | iOS-style premium UI, PWA ready |
| **Backend** | Express.js + SQLite | Local file storage, no cloud dependencies |
| **Database** | better-sqlite3 | Synchronous, cross-platform prebuilds, no GLIBC issues |
| **Real-Time** | Socket.io | Instant chat between Prayagraj & Nellore |
| **Deployment** | Render.com (Backend) | Free tier, public URL |
| **AI** | Groq API | Free tier, health/education assistant |
| **Storage** | Local filesystem | No Firebase, no Google Drive |

### **Key Features**
1. **Real-Time Chat**: Socket.io for instant messaging, online presence tracking
2. **Media Streaming/Download**: Range request support, progress tracking, direct download
3. **Admin Controls**: Movie upload restricted to `aviindo863@gmail.com`
4. **Daily Content**: Health tips, education facts, puzzles cached daily
5. **Premium UI**: Glassmorphism, dynamic theming, smooth animations (Outfit font)
6. **Multi-Platform**: Web, Android (via Capacitor)

---

## 🛠️ 2. Key Implementation Steps Taken
### **Firebase/Drive Removal**
- ✅ Deleted `functions/`, `google-services.json`, `.firebaserc`, service account files
- ✅ Removed `frontend/src/firebase.js` and imports
- ✅ Removed hardcoded API keys, using env variables only

### **Download Fixes**
- ✅ Updated `DownloadsPage.jsx` with XHR-based progress tracking
- ✅ Fixed backend download routes with proper `Content-Disposition` headers
- ✅ Ensured `apiConfig.js` uses `VITE_API_URL` for Render backend

### **Real-Time Chat**
- ✅ Added Socket.io to backend and frontend
- ✅ Replaced polling with WebSocket events
- ✅ Broadcast messages instantly to all connected clients

### **Render Deployment**
- ✅ Created `render.yaml` for one-click deployment
- ✅ Backend configured for free tier (ephemeral storage)
- ✅ Environment variables configured (GROQ_API_KEY, JWT_SECRET)
- ✅ Node.js 20.x enforced via `.nvmrc` (required for better-sqlite3 prebuilds)
- ✅ Deployed successfully: **https://ilynect-2.onrender.com**
- ✅ Port: 3001
- ✅ Commit: `99039b4` — switched from `sqlite3` to `better-sqlite3` to fix GLIBC_2.38 error

---

## 🚀 3. Build & Deployment Guide
### **Prerequisites**
- GitHub account
- Render.com account (free)
- Android Studio (for APK build)
- Node.js 18+

### **Step 1: GitHub Setup**
1. Create new repo: `https://github.com/new` → Name: `ILYNECT` → Public → No README
2. Copy repo URL (e.g., `https://github.com/YOUR_USERNAME/ILYNECT.git`)
3. Initialize local repo (already done):
   ```bash
   git add .
   git commit -m "ILYNECT v3.0 - Premium Family Edition"
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```

### **Step 2: Render Backend Deployment (✅ COMPLETED)**
- **Live URL**: `https://ilynect-2.onrender.com`
- **API Base**: `https://ilynect-2.onrender.com/api`
- **Root Directory**: `.`
- **Build Command**: `cd backend && npm install --production`
- **Start Command**: `cd backend && node server.js`
- **Node Version**: 20.20.2 (via `.nvmrc`)
- **Database**: `better-sqlite3` (no native rebuild needed)

### **Step 3: Frontend Deployment (Vercel)**
1. Sign up at [vercel.com](https://vercel.com) (GitHub login)
2. New Project → Import `ILYNECT` repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL` = `https://ilynect-2.onrender.com/api`
4. Deploy

### **Step 4: Android App Build**
1. Build frontend: `cd frontend && npm run build`
2. Add Android platform: `npx cap add android`
3. Sync: `npx cap sync`
4. Open in Android Studio: `npx cap open android`
5. Build APK: **Build** → **Build APKs** (output: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`)

---

## 👥 4. User Access Details
| User | Location | Role | Access |
|------|----------|------|--------|
| You (Akshit) | Prayagraj | Admin | Full access, movie upload |
| Brother | Nellore | User | Chat, stream, download media |

**Connection**: Both use Render backend URL for real-time chat and media access.

---

## ⚠️ 5. Known Limitations & Fixes
1. **Render Ephemeral Storage**: Files lost on restart → Fix: Use Cloudflare R2 (free 10GB storage)
2. **Backend Sleep**: Free tier sleeps after 15 mins → Fix: Use UptimeRobot to ping `/api/health`
3. **Android Download Path**: May need storage permissions → Add to `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   ```

---

## 📝 6. Important File Paths
- **Backend**: `backend/server.js` (main entry)
- **Frontend**: `frontend/src/` (React code)
- **Database**: `backend/data/onv_player.db` (better-sqlite3)
- **Uploads**: `backend/uploads/` (videos/photos/thumbnails)
- **Config**: `frontend/src/apiConfig.js` (API endpoints)
- **Database Module**: `backend/db/database.js` (better-sqlite3 wrapper)

## 📝 7. API Configuration (Update After Deploy)
Update `frontend/src/apiConfig.js` with:
```javascript
export const RENDER_API_URL = 'https://ilynect-2.onrender.com/api';
```
Then rebuild frontend: `cd frontend && npm run build`, copy `dist` to `backend/dist`, commit & push.

---

*Memory Updated: May 7, 2026 - Backend LIVE at https://ilynect-2.onrender.com*
*Next: Update frontend apiConfig.js → build → deploy to Vercel → build Android APK*