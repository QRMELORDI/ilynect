# 🎬 ILYNECT - Premium Family Hub & MovieRulz Browser

**The Ultimate Family Connection App. Built for Akshit & Family.**

> **Status**: 🚀 PRODUCTION READY (Version 2.0.0)  
> **Concept**: A unified platform for family photos, health AI, and an integrated MovieRulz browser for instant downloads.

---

## 💎 The Vision
ILYNECT was born from the need for a private, premium family space. It replaces generic chat apps with a focused hub for what matters:
1.  **Shared Memories**: A high-speed photo gallery for family events.
2.  **Modern Browsing**: An integrated MovieRulz experience that bypasses ads and gives you direct Easysyncr download links.
3.  **Family Wellness**: AI-powered health and education assistants that speak your language (Telugu + English).
4.  **Instant Content**: A "Reels" section for short family clips and gossips.

---

## 🛠️ Technology Stack (The "ILYNECT" Engine)

### Frontend (Mobile & Web)
- **React 19**: State-of-the-art UI with premium glassmorphism.
- **Capacitor 7**: Turning our web code into a high-performance native Android app.
- **Vite**: Ultra-fast build tool for a smooth development experience.

### Backend (The Brain)
- **Node.js (Express)**: Scalable API logic.
- **Cheerio & Axios**: Our custom-built "MovieRulz Scraper" engine.
- **SQLite**: Lightweight, zero-maintenance database for high speed.
- **Render.com**: Automated deployment and scaling.

---

## 🚀 Key Features

### 🌐 Integrated MovieRulz Browser
No more navigating messy websites with infinite ads. ILYNECT scrapes MovieRulz directly:
- **Instant Search**: Find any movie in seconds.
- **Direct Downloads**: One-tap access to Easysyncr download pages.
- **Auto-Domain**: Admin can update the MovieRulz domain instantly if it changes.

### 📸 Premium Photo Gallery
- **High Speed**: Local file storage for instant loading.
- **Lightbox View**: View photos in full screen with smooth animations.
- **Admin Controlled**: Safe, private, and just for family.

### 🧠 Family AI (Groq Powered)
- **Health Advisor**: Simple Telugu-English health tips.
- **Education Assistant**: Encourages curiosity for the kids.
- **Fallback Logic**: Works even if the AI server is busy.

### 📱 Native Android Experience
- **Hardware Back Button**: Full support for native navigation.
- **Auto-Update**: The app reloads itself whenever a new version is pushed to Vercel.
- **Safe Areas**: Perfectly fits the status bar and bottom nav on all modern phones.

---

## 📂 Project Structure

```bash
ILYNECT/
├── frontend/             # The Premium UI (React + Capacitor)
│   ├── src/pages/       # MovierulzPage, PhotosPage, HomePage, etc.
│   ├── src/services/    # API & AI integration
│   └── android/         # Native Android Project
├── backend/              # The "Brain" (Express + Scraper)
│   ├── routes/          # API endpoints (Auth, Movierulz, Photos)
│   ├── services/        # Scraper engine (Cheerio based)
│   └── uploads/         # Local storage for family media
└── README.md             # This document
```

---

## 📝 Change Log (Project Evolution)

### Phase 1: Architecture Shift
- Removed Firebase & Google Drive to eliminate complexity and cost.
- Implemented **Local Storage Engine** on Render for media uploads.
- Built a custom **SQLite Database** for lightning-fast user management.

### Phase 2: Feature Refinement
- **Removed Chatting**: Decided to focus on content consumption and sharing rather than redundant messaging.
- **Implemented Scraper**: Built a custom Node.js service to fetch movies from MovieRulz and resolve Easysyncr links.
- **Hardware Integration**: Fixed Android back button and auto-update listeners.

### Phase 3: UI/UX Polish
- Applied **Apple-style Glassmorphism** throughout the app.
- Fixed chat/input overlaps and adjusted safe-area padding for Android.
- Added **3D Upload Buttons** and wave animations for a premium feel.

---

## ⚙️ Deployment & Setup

### Prerequisites
- Node.js 20+
- Android Studio (for APK generation)

### Installation
```bash
# Clone the repo
git clone https://github.com/QRMELORDI/ilynect.git

# Setup Backend
cd backend && npm install

# Setup Frontend
cd ../frontend && npm install
```

### Building the Android APK
1. Run `npm run build` in the frontend folder.
2. Run `npx cap sync android`.
3. Open `android` folder in Android Studio.
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🛡️ Security & Privacy
- **Private Access**: Only family members with approved emails can access the app.
- **No Third-Party Tracking**: Your data stays on our Render server.
- **Secure Auth**: JWT-based token authentication for all requests.

---

**Built with ❤️ by Antigravity (Senior Tech Manager) for Akshit & Family.**
"Connecting Prayagraj and Nellore, one movie at a time."
