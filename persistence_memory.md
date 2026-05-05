# 🧠 ILYNECT - Persistence Memory
**Last Updated**: May 7, 2026  
**Version**: 3.0.0 (Premium Family Edition - Firebase Free, Render Deployed, Real-Time Chat)

---

## 🏗️ 1. Project Architecture (Current State)
### **Full Stack Overview**
| Component | Technology | Notes |
|-----------|-------------|-------|
| **Frontend** | React 19 + Vite + Capacitor | iOS-style premium UI, PWA ready |
| **Backend** | Express.js + SQLite | Local file storage, no cloud dependencies |
| **Database** | SQLite3 | Lightweight, file-based, zero config |
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

### **Step 2: Render Backend Deployment**
1. Sign up at [render.com](https://render.com) (use GitHub login)
2. New → Web Service → Connect GitHub repo
3. Configure:
   - **Name**: `ilynect-backend`
   - **Root Directory**: `.`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: Free
4. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `ADMIN_EMAIL`: `aviindo863@gmail.com`
   - `JWT_SECRET`: (auto-generated)
5. Deploy → Get public URL (e.g., `https://ilynect-backend.onrender.com`)

### **Step 3: Frontend Deployment (Vercel)**
1. Sign up at [vercel.com](https://vercel.com) (GitHub login)
2. New Project → Import `ILYNECT` repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL` = `https://ilynect-backend.onrender.com/api`
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
- **Database**: `backend/data/onv_player.db` (SQLite file)
- **Uploads**: `backend/uploads/` (videos/photos/thumbnails)
- **Config**: `frontend/src/apiConfig.js` (API endpoints)

---

*Memory Updated: May 7, 2026 - Ready for Production*