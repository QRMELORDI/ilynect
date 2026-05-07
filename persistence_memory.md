# 🧠 ILYNECT - Persistence Memory

**Last Updated**: May 7, 2026  
**Version**: 3.2.0 (The "Family Reels & Cinema" Update)  
**Status**: ✅ ACTIVE  
**Vision**: ILYNECT is a private family social ecosystem. It bridges the gap between traditional social media and private family archives by providing a space for Cinema (Movies), Reels (Short-form video), and Photos (Shared memories).

---

## 🚀 App Idea Knowledge

| Feature | Description | Status |
|---------|-------------|--------|
| **Family Cinema** | High-quality movie streaming and MovieRulz integration for Telugu content. | ✅ Live |
| **Family Reels** | Short, swipeable videos (up to 60s) with vertical scroll-snap and interaction. | ✅ Live |
| **Shared Gallery** | High-resolution photo sharing with downloadable memories. | ✅ Live |
| **Family Reply** | Integrated commenting system on all movies, videos, and reels. | ✅ Live |
| **Daily Family** | AI-powered or static daily content (Health, Education, GK) for the family. | ✅ Live |

---

## 🏗️ Technical Architecture

- **Frontend**: React 19 + Vite + Capacitor 7. Modern iOS-inspired glassmorphism.
- **Backend**: Node.js (Express) + SQLite (better-sqlite3). Port 3001.
- **Storage**: Local filesystem at `backend/uploads/` (videos, reels, photos).
- **Mobile**: Capacitor-powered Android app with native browser and back-button handling.

---

## 🔧 Latest Modifications (v3.2.0)

- **UI Glitch Fix**: Increased `page-wrapper` padding and adjusted navbar `z-index` to fix unclickable top tabs.
- **Photo Viewer**: Added `.lightbox-info` with download button. Fixed "zoomed in" cropping with `object-fit: contain`.
- **Reels Transition**: Renamed "Gossip" to "Reels" across the entire app for clarity.
- **Global Comments**: Integrated commenting system into the `VideoPlayer` component for all Cinema content.
- **MovieRulz Fix**: Preservation of MovieRulz section while investigating download link restrictions.

---

## 🔑 Key Configuration

- **Admin**: `aviindo863@gmail.com` (Grants access to MovieRulz config and admin deletes).
- **API URL**: `https://ilynect-2.onrender.com/api` (Render backend).
- **Frontend URL**: `https://ilynect.vercel.app` (Vercel frontend).
- **Database**: `backend/data/onv_player.db`.

---

## 📂 Sorted Workspace structure
- `backend/`: Express server, SQLite DB, Scrapers, and API Routes.
- `frontend/`: React source code, Assets, and Capacitor Android project.
- `package.json`: Main project configuration.
- `persistence_memory.md`: This file (Project source of truth).
- `render.yaml`: Deployment blueprint for Render.

---
*Built for the KRGN Family. Private. Secure. Connected.*
