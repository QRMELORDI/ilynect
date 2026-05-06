# 🎬 ILYNECT - Premium Family Connect App

**Built for our family. Designed with love. Deployed for free.**

[![Live Frontend](https://img.shields.io/badge/Live-Vercel-000000?style=for-the-badge)](https://ilynect.vercel.app)
[![Live Backend](https://img.shields.io/badge/Live-Render-46e3b4?style=for-the-badge)](https://ilynect-2.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-QRMELORDI/ilynect-181717?style=for-the-badge&logo=github)](https://github.com/QRMELORDI/ilynect)

---

## 🌟 Live URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Vercel)** | https://ilynect.vercel.app | ✅ Live |
| **Backend API (Render)** | https://ilynect-2.onrender.com/api | ✅ Live |
| **Health Check** | https://ilynect-2.onrender.com/api/health | ✅ Live |
| **GitHub Repository** | https://github.com/QRMELORDI/ilynect | ✅ Live |

---

## 🏗️ Tech Stack

| Component | Technology | Purpose |
|-----------|-------------|---------|
| **Frontend** | React 19 + Vite + Capacitor | iOS-style premium UI, PWA, Android app |
| **Backend** | Express.js + better-sqlite3 | RESTful API, local file storage |
| **Database** | SQLite (better-sqlite3) | Lightweight, zero-config, cross-platform |
| **Real-Time** | Socket.io | Instant chat between Prayagraj & Nellore |
| **AI Assistant** | Groq API (free tier) | Health & Education assistant |
| **Deployment** | Vercel (Frontend) + Render (Backend) | 100% free, public URLs |

---

## ✨ Features

### 💬 Real-Time Family Chat
- Instant messaging with Socket.io
- Online presence tracking
- Like/dislike messages
- Tree-avatar system (10 unique avatars)

### 🎥 Movies & Reels
- Upload and stream videos locally
- Admin-only movie uploads (`aviindo863@gmail.com`)
- Reels (under 60 seconds) with camera capture
- Progress tracking for uploads
- Range request support for video seeking

### 📸 Photos Gallery
- Upload and browse family photos
- Add to gallery from camera or gallery
- Download photos directly to device
- Lightbox view with zoom

### 📥 Downloads
- Download videos/photos for offline viewing
- Progress tracking with XHR
- Download queue management
- Direct file download (no Drive dependencies)

### 📚 Daily Knowledge
- Health tips (Telugu + English)
- Education facts & puzzles
- GK questions, Telugu jokes, Neethivaakyam
- Cached daily for performance

### 🤖 AI Assistant (Groq API)
- Health advice in Telugu-English mix
- Education assistance
- Smart fallback responses when API is unavailable

### 🎨 Premium UI
- iOS-style glassmorphism design
- Dynamic theming (Light/Dark mode)
- Smooth animations (Outfit font)
- Royal purple wave branding
- Responsive for all screen sizes

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Git
- (Optional) Android Studio for APK build

### 1. Clone & Install
```bash
git clone https://github.com/QRMELORDI/ilynect.git
cd ilynect

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup
Create `backend/.env`:
```env
PORT=3001
ADMIN_EMAIL=aviindo863@gmail.com
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001/api

---

## 🌐 Deployment (Free Tiers)

### Backend (Render.com)
1. Sign up at [render.com](https://render.com) (use GitHub login)
2. **New + → Web Service** → Connect `QRMELORDI/ilynect`
3. Configure:
   - **Name**: `ilynect-backend`
   - **Root Directory**: `.`
   - **Build Command**: `cd backend && npm install --production`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: Free
4. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `ADMIN_EMAIL`: `aviindo863@gmail.com`
   - `JWT_SECRET`: (auto-generated)
5. Deploy → Copy backend URL

### Frontend (Vercel.com)
1. Sign up at [vercel.com](https://vercel.com) (GitHub login)
2. **New Project** → Import `ilynect` repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL` = `https://your-render-url.onrender.com/api`
4. Deploy → Share the URL!

### Keep Backend Awake (UptimeRobot)
Render free tier sleeps after 15 mins. To keep alive 24/7:
1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. **Add New Monitor** → **HTTP(s)**
3. **URL**: `https://your-render-url.onrender.com/api/health`
4. **Interval**: 5 minutes → Save

---

## 📱 Android App Build

### Prerequisites
- Android Studio installed
- Capacitor configured (already done)

### Build Steps
```bash
cd frontend

# Build frontend
npm run build

# Sync to Android
npx cap sync

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. **Build** → **Build APKs**
2. APK location: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
3. Share APK with family members!

### Android Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## 🔐 User Roles & Access

| User | Email | Role | Access |
|------|-------|------|--------|
| You (Akshit) | aviindo863@gmail.com | Admin | Full access, movie uploads |
| Brother (Nellore) | Any email | User | Chat, stream, download |

**Note**: Admin role is auto-assigned based on email match with `ADMIN_EMAIL` env variable.

---

## ⚠️ Known Limitations

### 1. Render Ephemeral Storage
**Issue**: Files uploaded to Render are lost on server restart/deploy.  
**Workaround**: Re-upload after restart, or upgrade to paid plan with persistent disk.  
**Future Fix**: Integrate Cloudflare R2 (free 10GB storage).

### 2. Backend Sleep
**Issue**: Free tier sleeps after 15 minutes of inactivity.  
**Fix**: Use UptimeRobot to ping `/api/health` every 5 minutes.

### 3. Database Wipes on Restart
**Issue**: SQLite database is recreated on Render restart.  
**Solution**: Re-register users after each restart (auto-admin for `aviindo863@gmail.com`).

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login/register user
- `PATCH /api/auth/update-name` - Update display name
- `GET /api/auth/user/:id` - Get user details

### Videos & Photos
- `GET /api/videos` - List videos (filter by category, type, search)
- `POST /api/videos/upload` - Upload video (admin-only for movies)
- `GET /api/photos` - List photos
- `POST /api/photos/upload` - Upload photo

### Streaming & Downloads
- `GET /api/files/stream/:type/:id` - Stream video/photo (supports Range requests)
- `GET /api/files/download/:type/:id` - Download file (forces attachment)
- `GET /api/files/photo/:id` - Direct photo view

### Chat & Presence
- `GET /api/chats` - Get messages (poll fallback)
- `POST /api/presence` - Update online status
- `GET /api/presence/online` - Get online users
- **Socket.io**: Real-time messaging via WebSocket

### AI & Daily Content
- `POST /api/ai/ask` - Ask AI assistant (health/education)
- `GET /api/daily` - Get daily content (cached per day)

---

## 🛠️ Project Structure

```
ilynect/
├── backend/
│   ├── server.js          # Express server + Socket.io
│   ├── database.js        # SQLite database wrapper
│   ├── routes/           # API routes (videos, photos, chats, etc.)
│   ├── uploads/          # Local file storage (videos/photos/thumbnails)
│   └── .env             # Environment variables (not in git)
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # App pages (Chat, Videos, Photos, etc.)
│   │   ├── services/     # API calls, Socket.io client
│   │   └── contexts/    # React contexts (Auth, Settings)
│   ├── android/         # Android Capacitor project
│   └── dist/           # Build output (not in git)
├── render.yaml           # Render deployment config
├── persistence_memory.md # Project memory & documentation
└── README.md            # This file
```

---

## 🔗 Quick Links

### Live App
- **Web**: https://ilynect.vercel.app
- **API**: https://ilynect-2.onrender.com/api

### Dashboards
- **GitHub**: https://github.com/QRMELORDI/ilynect
- **Render**: https://dashboard.render.com
- **Vercel**: https://vercel.com/dashboard

### External Services
- **Groq API**: https://console.groq.com (Get free API key)
- **UptimeRobot**: https://uptimerobot.com (Keep backend awake)

---

## 💡 Tips for Family Use

1. **First Login**: Click "User Login" (not Admin) → Enter name + email
2. **Admin Access**: Use `aviindo863@gmail.com` to get admin rights automatically
3. **Movie Uploads**: Only available for admin users
4. **Real-Time Chat**: Both users (Prayagraj & Nellore) must be online
5. **Downloads**: Files download directly to your device
6. **Offline Use**: Download videos first, then watch without internet

---

## 🐛 Troubleshooting

### "Check your internet" Error
**Cause**: Vercel frontend missing `VITE_API_URL` env variable.  
**Fix**: Add to Vercel project settings → Environment Variables → Redeploy.

### Login Fails
**Cause**: Render database wiped on restart.  
**Fix**: Wake up backend (visit `/api/health`), then re-register with same email.

### Upload Failed
**Cause**: Backend asleep or file too large for Render free tier.  
**Fix**: Wake up backend first, compress videos to < 100MB.

### Downloads Not Working
**Cause**: Backend URL incorrect or backend asleep.  
**Fix**: Verify `VITE_API_URL` in Vercel, wake up backend.

---

## 📜 License

This project is built for personal family use. All rights reserved.

---

## ❤️ Made For Family

**Built by**: Akshit (Prayagraj)  
**For**: Our family (Prayagraj ↔ Nellore)  
**With**: React, Express, Socket.io, and love ❤️  

**ILYNECT** - *FAMILY CONNECT*

---

*Last Updated: May 7, 2026*  
*Version: 3.0.0 (Premium Family Edition)*
