# 🎬 ILYNECT - PROJECT MANIFEST & PUTTU PURVATRALU
**Author: Akshit Vinay Neelam**
**Role: Lead Architect & Developer**

---

## 1. 🌟 THE VISION (Puttu Purvatralu)
ILYNECT was born from a simple yet powerful idea: **Family first, convenience always.** 
I wanted to build a "Private Family Super-App" that combines the warmth of family memories with the thrill of global entertainment. It's not just an app; it's a bridge between my family in Prayagraj and Nellore.

**Core Philosophy:**
- **Zero Ads:** Bypassing the messy UI of movie sites.
- **Privacy:** Only for the family. No tracking, no public leaks.
- **Dynamic Evolution:** The app should change when I want it to, without asking family members to download a new APK every week.

---

## 2. 🏗️ APP TYPE & ARCHITECTURE
ILYNECT is a **Hybrid Native App** built using the **Capacitor 7** framework.

- **Frontend:** React 19 (Web Core). This handles the UI/UX.
- **Native Wrapper:** Capacitor. This turns the web code into an Android app that can access the camera and file system.
- **Backend:** Node.js Express. The "Brain" that scrapes MovieRulz and manages the database.
- **Database:** SQLite (better-sqlite3). Fast, local, and reliable.
- **Auto-Update Engine:** The app uses a "Web-to-Native" bridge. When I update the backend/hosting, the app reloads the new UI automatically for every user without a new APK.

---

## 3. 📁 ROOT STRUCTURE (The Skeleton)
```bash
ILYNECT/
├── backend/                # THE BRAIN (Server-side)
│   ├── db/                 # Database schema (SQLite)
│   ├── routes/             # API Endpoints (movierulz.js, auth.js, etc.)
│   ├── services/           # Logic (scraper.js for MovieRulz)
│   ├── uploads/            # Local media storage (Photos/Videos)
│   └── server.js           # Entry point
├── frontend/               # THE FACE (User Interface)
│   ├── src/                # React Source Code
│   │   ├── components/     # Reusable UI parts (Navbar, VideoPlayer)
│   │   ├── pages/          # Full Screens (MovierulzPage, PhotosPage)
│   │   ├── services/       # API connection (api.js)
│   │   └── utils/          # Helper logic (image compression, platform detection)
│   ├── android/            # Native Android Studio Project
│   ├── package.json        # Dependencies
│   └── vite.config.js      # Build configurations
└── README.md               # Main instructions
```

---

## 4. 🛠️ THE "ZERO-UPDATE" RELEASE STRATEGY
This is the most important part of my idea. I release the APK **once**, but the app stays fresh forever.

### How it works:
1. **Host the Backend/Frontend:** I host the backend on Render and the frontend "build" is served by the backend.
2. **The App Loader:** When the user opens the ILYNECT APK, it points to my hosted URL.
3. **Dynamic MovieRulz:** The scraper logic lives on the **Server**, not in the APK. If I change the domain in the Admin Profile, the server immediately starts scraping the new site, and every family member sees the new links instantly.
4. **Download Logic:** Since EasySyncr links are fetched live, they will always be the "current" working links.

---

## 5. 🔍 DEBUGGING PROTOCOL (Problem Solving)

| If this happens... | Check here... | Reason |
| :--- | :--- | :--- |
| **"Fetching Links..." hangs** | `backend/services/scraper.js` | MovieRulz might have changed their HTML structure or domain. |
| **Photos not uploading** | `frontend/src/utils/image.js` | Compression might be failing or file size is too huge. |
| **"Server not found"** | `frontend/src/apiConfig.js` | The Render backend might be sleeping. Wait 30 seconds. |
| **Blank Screen on Open** | `frontend/android/.../AndroidManifest.xml` | Check Internet permissions and CleartextTraffic (HTTP vs HTTPS). |
| **Download doesn't start** | `frontend/src/pages/MovierulzPage.jsx` | EasySyncr might be blocking the request; check the Browser intent. |

---

## 6. ✅ PRE-BUILD CHECKLIST (Before generating APK)
Before I open Android Studio to build the final APK, I must check these 5 things:

1. [ ] **Backend URL:** Ensure `frontend/src/apiConfig.js` points to the **Production** Render URL, not `localhost`.
2. [ ] **Version Check:** Update `APP_VERSION` in `frontend/src/App.jsx` and `backend/server.js`.
3. [ ] **MovieRulz Domain:** Verify the current working domain in `backend/services/scraper.js`.
4. [ ] **Build Command:** Run `npm run build` inside `frontend/` and then `npx cap sync android`.
5. [ ] **Admin Access:** Ensure my email (`aviindo863@gmail.com`) is set as the admin in the database.

---

## 🚀 FINAL RELEASE STEPS
1. **Clean:** Delete the `android/app/build` folder to avoid old bugs.
2. **Build:** In Android Studio, go to **Build > Generate Signed APK**.
3. **Distribute:** Send the APK to the family.
4. **Maintenance:** I never need to send them a file again. I only update the code on GitHub/Render, and their app will auto-update on the next open.

---
**This is ILYNECT. Built by Akshit Vinay Neelam for the family.**
