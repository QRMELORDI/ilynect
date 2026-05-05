# 🧠 ILYNECT - Family Memory

**Last Updated**: May 7, 2026 (3:00 PM IST)  
**Version**: 3.1.0 (All Issues Fixed - Theme, Delete, Chat, Blank Pages, Mobile Hang)

---

## 🎯 Current Live Status

| Component | Status | URL |
|-----------|--------|-----|
| **GitHub** | ✅ Live | https://github.com/QRMELORDI/ilynect |
| **Backend (Render)** | ✅ Live | https://ilynect-2.onrender.com |
| **Frontend (Vercel)** | ✅ Live | https://ilynect.vercel.app |

---

## 🏠 About This App

**ILYNECT** is a family app built for:
- You (Akshit) in **Prayagraj**
- Your Brother in **Nellore**
- All family members to connect, share & stay together

### What Family Can Do:
- 💬 Chat in real-time
- 🎬 Watch movies & reels
- 📸 Share photos
- 📥 Download videos/photos
- 💚 Health tips
- 📚 Education/GK tips

---

## 🔐 Login

| Your Email | Role |
|-----------|------|
| aviindo863@gmail.com | **Admin** (can upload movies) |
| Any other | **User** (upload reels/photos) |

### How to Login:
1. Open: https://ilynect.vercel.app
2. Enter name + email
3. Click Login
4. Done! ✅

---

## 🚀 How to Use (Step by Step)

### Step 1: Open the App
```
https://ilynect.vercel.app
```

### Step 2: Login
- Enter your name
- Enter your email
- Click "Login" button

### Step 3: Start Using
- **Home** - Quick access to all features
- **Movies** - Watch films together
- **Photos** - See family photos
- **Chat** - Talk with brother
- **Reels** - Watch short videos
- **Health** - Get health tips
- **Education** - GK & learning

---

## ⬇️ How to Download Videos/Photos

1. Go to **Movies** or **Photos**
2. Click on the video/photo
3. Click **Download** button
4. File will download to your phone!

---

## 📱 Install on Phone (APK)

To use as an app on your phone:

1. Build APK first or use the web version
2. Open: https://ilynect.vercel.app in your phone browser
3. Tap "Share" → "Add to Home Screen"
4. It will work like an app!

---

## ❓ Common Questions

### Q: Does it work when laptop is closed?
**A:** YES! Server is on Render.com cloud, not your laptop.

### Q: Can brother see my messages?
**A:** YES! Both connect to the same server.

### Q: Can we share videos both ways?
**A:** YES! Anyone can upload, everyone can view.

### Q: Is it free?
**A:** YES! Completely free - no payment needed.

### Q: Download not working?
**A:** 
1. Make sure you're logged in
2. Check internet connection
3. Try again after a few seconds

---

## 🔧 If Something Wrong

### 1. Can't connect to app
- Check internet is working
- Try opening: https://ilynect-2.onrender.com/api/health
- If error, wait 30 seconds and try again (server waking up)

### 2. Login not working
- Clear browser cache
- Try incognito/private mode
- Re-enter your name and email

### 3. Download fails
- Make sure logged in first
- Check you're on WiFi (not mobile data for large files)
- Try smaller files first

### 4. Videos not loading
- Refresh the page
- Check server is awake (visit health link above)
- Try different video

---

## 💾 Where Files Are Stored

```
Server (Render.com)
├── database/     (messages, users, info)
├── uploads/
│   ├── videos/   (movies, reels)
│   └── photos/  (family photos)
```

All stored safely on cloud server!

---

## 🎨 New Design (v3.1.0)

Now featuring:
- Warm, family-friendly colors (coral, green, gold)
- Smooth animations
- Glass effect cards
- Easy navigation
- Download buttons everywhere

## 🔧 Fixes Applied (v3.1.0)
1. **Theme toggle**: Fixed ProfilePage to use SettingsContext instead of AuthContext
2. **Chat input box**: Fixed height from `100dvh` to `calc(100dvh - 60px)` so input is visible
3. **Uploader delete**: Videos/reels/photos can now be deleted by their uploader OR admin
4. **Blank health/education pages**: Added fallback content when Groq API fails
5. **Mobile hang on back**: Changed `window.history.back()` to `navigate(-1)` in Capacitor
6. **Groq API timeout**: Added 10s timeout to prevent hanging requests
7. **Daily content fallback**: Static Telugu/English content when AI generation fails
8. **60s fetch timeout**: Login and API calls now wait up to 60s for Render wake-up

## ⚠️ Important: Groq API Key
- GROQ_API_KEY must be set in Render Dashboard → Environment Variables
- Without it, health/education pages show static fallback content (still works!)
- Get free key at: https://console.groq.com/keys

---

## 📞 Need Help?

1. Check this file
2. Check Render.com dashboard for errors
3. Refresh and try again

---

*Made with ❤️ for our family*
*Built freely by Akshit (Navy)*