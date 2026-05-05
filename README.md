# ILYNECT - Family Connect App v2.0

A premium family communication and media sharing app. **Zero Firebase, Zero Google Drive** — 100% free hosting.

## Features
- Real-time Chat (Prayagraj ↔ Nellore)
- Movies & Reels (watch online + download)
- Photos Gallery
- AI Health & Education Assistant
- Daily Knowledge Content (auto-generated)
- Admin-only movie uploads, user reels/photos/chat
- Light/Dark mode + Telugu/English toggle

## Architecture
- **Frontend**: React + Vite + Capacitor (Android APK)
- **Backend**: Express.js + SQLite (file-based, no external DB needed)
- **File Storage**: Local server storage with direct streaming/download links
- **AI**: Groq (free tier) + rich fallback responses
- **Auth**: JWT tokens (no Firebase)

## Free Hosting: Render.com

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "ILYNECT v2.0 - Firebase-free family app"
git remote add origin https://github.com/YOUR_USERNAME/ilynect.git
git push -u origin main
```

### Step 2: Deploy to Render (Free)
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Blueprint** → Select your `ilynect` repo
3. Render auto-detects `render.yaml` and sets up the service
4. Click **Apply** — deployment takes ~3 minutes

**OR Manual Setup:**
1. New → **Web Service** → Connect your GitHub repo
2. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `cd ../frontend && npm install && npm run build && cd ../backend && npm install --production`
   - **Start Command**: `node server.js`
   - **Plan**: Free
3. Add Environment Variables:
   ```
   NODE_ENV=production
   ADMIN_EMAIL=aviindo863@gmail.com
   JWT_SECRET=your-secret-key-here
   GROQ_API_KEY=your-groq-key (optional, fallback works without it)
   ```
4. Click **Create Web Service**

Your app URL will be: `https://ilynect-XXXX.onrender.com`

### Step 3: Update Frontend API URL
Edit `frontend/src/apiConfig.js`:
```javascript
const RENDER_API_URL = "https://ilynect-XXXX.onrender.com/api"; // Your Render URL
```

### Step 4: Build APK
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android  # Opens Android Studio
```
In Android Studio: Build → Build APK

## Local Development

### Backend
```bash
cd backend
npm install
npm start  # Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

## API Endpoints
- `POST /api/auth/login` - Login with email + name
- `GET /api/videos` - List all videos
- `POST /api/videos/upload` - Upload video (admin for movies)
- `GET /api/files/stream/video/:id` - Stream video online
- `GET /api/files/download/video/:id` - Download video
- `GET /api/files/photo/:id` - View photo
- `GET /api/chats` - Get chat messages
- `POST /api/chats` - Send message
- `POST /api/ai/ask` - Ask AI (health/education)
- `GET /api/daily` - Daily knowledge content
- `POST /api/presence` - Update online status
- `GET /api/presence/online` - Get online users

## Storage Info
- Files stored on Render server disk (free tier)
- Direct download links like: `https://your-app.onrender.com/api/files/download/video/:id`
- Streaming with seek support: `https://your-app.onrender.com/api/files/stream/video/:id`
- For large-scale: consider adding external storage (Backblaze B2, Wasabi, etc.)

## Admin Setup
- Default admin email: `aviindo863@gmail.com`
- Change via `ADMIN_EMAIL` environment variable on Render

---
Built with ❤️ for family connection
