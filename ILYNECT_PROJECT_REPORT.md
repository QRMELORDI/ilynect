# ILYNECT Project: Puttu Purvatralu (Detailed Report)
**Author:** Akshit Vinay Neelam  
**Date:** May 6, 2026  
**Version:** 3.0 (Premium Release)

---

## 1. Puttu Purvatralu (Origin & History)
ILYNECT was born from a simple yet powerful idea: **Connecting our family in a private, high-end digital space.** 

The name is a blend of "Family" and "Connect," representing a bridge across generations. It started as a basic media player (ONV Player) and evolved into a "Super App" specifically tailored for our family's needs—combining entertainment, memories, and daily wisdom.

## 2. The Built-up Idea (Core Vision)
The vision is to provide:
- **Exclusive Entertainment**: A private hub for Telugu movies (via MovieRulz) and family reels.
- **Memories First**: A high-fidelity photo gallery that feels like a native iOS experience.
- **Daily Connection**: Wisdom (Neethivaakyam), health tips, and educational content in Telugu.
- **Premium Aesthetics**: A "MacBook/iPhone" feel with glassmorphism and smooth transitions to "WOW" our relatives.

## 3. Structure & Process
The app follows a modern Hybrid-Cloud architecture:

### Root Structure:
```text
ILYNECT/
├── frontend/                # React 19 UI (Capacitor Mobile Layer)
│   ├── src/pages/           # Screen components (Home, MovieRulz, Photos)
│   ├── src/services/        # API communication (api.js)
│   └── android/             # Native Android Bridge
├── backend/                 # Node.js Express Server
│   ├── routes/              # API endpoints (videos, photos, scraper)
│   ├── services/            # Scraper (MovieRulz) & Drive Integration
│   └── data/                # SQLite Database (onv_player.db)
└── README.md                # Technical Documentation
```

### The "How it Works" Process:
1. **The Scraper**: The backend constantly monitors MovieRulz for the latest Telugu movies.
2. **The Cloud**: Photos and Videos are backed up to **Google Drive** automatically, keeping local storage light.
3. **The Sync**: When I (Akshit) change the MovieRulz domain in the admin panel, the backend updates immediately. Every relative's app then points to the new domain instantly.

## 4. Pre-Build & Release Checklist
Before you hit "Build APK" in Android Studio, ensure these are checked:

### Pre-Build (Mandatory):
- [x] **Backend Status**: Ensure the Render/Server URL is updated in `frontend/src/services/api.js`.
- [x] **Database Schema**: Verify all tables (users, videos, photos, history) are initialized.
- [x] **Admin Privileges**: Ensure my email (`aviindo863@gmail.com`) is set as admin in the DB.
- [x] **UI Cleanliness**: Check that footer spacing and header alignment are perfect (Fixed in v3.0).

### Release Checklist:
1. **Frontend Build**: Run `npm run build` inside the `frontend` folder.
2. **Capacitor Sync**: Run `npx cap sync android`.
3. **Android Studio Build**: Generate the "Signed Bundle / APK".
4. **Distribution**: Share the APK with relatives via WhatsApp or Telegram.

## 5. Automatic Updates & Domain Management
### The "No-Rebuild" Strategy:
I designed ILYNECT so you only have to release the APK **once**. 
- **Movie Links**: If MovieRulz changes their domain, **do not rebuild the app**. Just go to your **Profile -> Admin Settings** and paste the new domain. All relatives will immediately get working links.
- **New Movies/Photos**: These are fetched live from the backend. They appear automatically for everyone.
- **UI Changes**: Significant layout changes still require an APK update, but the core content is 100% dynamic.

## 6. Debugging & Error Handling
If something goes wrong, here is how to find the problem:

| Problem | Cause | How to Check / Fix |
| :--- | :--- | :--- |
| **Blank Profile Page** | SQL Error | Check backend logs for "no such column". (Note: Fixed in v3.0 by correcting quotes in `presence.js`). |
| **"No Movies Found"** | Blocked Domain | Check if MovieRulz changed their domain. Update it in Admin settings. |
| **Upload Fails** | Drive Error | Check `backend/services/driveService.js` credentials. |
| **App is Slow** | Server Sleep | If using Render Free, the first request takes ~30s to wake the server. This is normal. |

## 7. Conclusion
ILYNECT is more than an app; it's a digital home for our family. By managing it through the backend and admin panel, we ensure that our relatives always have a working, beautiful experience without ever needing to update the APK manually.

**Signed,**  
*Akshit Vinay Neelam*
