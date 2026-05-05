# 🚀 Push to GitHub - Quick Guide

## Option 1: Using Command Line (PowerShell)

### First Time Setup (One Time Only)
```powershell
# Check if git is installed
git --version

# Configure your name and email (only once)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### To Push Updates Every Time:

```powershell
# 1. Go to the folder
cd "C:\Users\akshi\Desktop\ILYNECT"

# 2. Add all changes
git add .

# 3. Write what you changed (commit)
git commit -m "v3.0.1 - Family Friendly UI"

# 4. Send to GitHub
git push origin master
```

---

## Option 2: Simple Update Script

Create a file called `update.ps1` in your ILYNECT folder:

```powershell
# Copy this to a .ps1 file and run it
cd "C:\Users\akshi\Desktop\ILYNECT"
git add .
git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin master
Write-Host "✅ Pushed to GitHub!"

# Wait for response
Read-Host "Press Enter to exit"
```

Then double-click to run!

---

## 📋 Every Time You Update:

| Step | Command | What it Does |
|------|---------|-------------|
| 1 | `cd ILYNECT` | Go to folder |
| 2 | `git add .` | Save all changes |
| 3 | `git commit -m "your message"` | Describe changes |
| 4 | `git push origin master` | Send to GitHub |

---

## 🎯 Example - After Making Changes:

```powershell
# Make your changes in code...
# Then run:

cd "C:\Users\akshi\Desktop\ILYNECT"

git add .

git commit -m "Fixed download button"

git push origin master
```

---

## ✅ What Happens:

1. GitHub gets your code
2. Vercel auto-deploys (frontend)
3. Render auto-deploys (backend)
4. Both updates live!

---

## 🔧 If Error "permission denied":

1. Go to GitHub → Settings → Developer settings
2. Personal access tokens → Generate new token
3. When git asks for username/password, use the token as password

---

## 🎉 Done!

After push, your app updates automatically:
- Frontend: https://ilynect.vercel.app (auto-deploys)
- Backend: https://ilynect-2.onrender.com (auto-deploys)

No need to rebuild APK for code changes!