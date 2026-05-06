import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import VideosPage from './pages/VideosPage';
import GossipPage from './pages/GossipPage';
import EducationPage from './pages/EducationPage';
import HealthPage from './pages/HealthPage';
import PhotosPage from './pages/PhotosPage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import DownloadsPage from './pages/DownloadsPage';
import ProfilePage from './pages/ProfilePage';
import { checkVersion, setUserOnline, getAPIBaseURL } from './services/api';
import './index.css';

const APP_VERSION = '1.0.5';

// Wake up backend on app start
const wakeUpBackend = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${getAPIBaseURL()}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return true;
    } catch (e) {
      console.log(`Wake-up attempt ${i + 1} failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initial wakeup
    wakeUpBackend().then(() => setAppReady(true));

    // Handle Hardware Back Button
    const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack || window.location.pathname === '/') {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });

    // Auto-update check logic
    const checkForUpdates = async () => {
      try {
        const data = await checkVersion();
        if (data.version && data.version !== APP_VERSION) {
          console.log(`New version available: ${data.version}, reloading...`);
          window.location.reload(true);
        }
      } catch (e) {
        console.warn('Update check failed:', e);
      }
    };

    // Listen for app coming to foreground
    const stateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        wakeUpBackend();
        checkForUpdates();
      }
    });

    checkForUpdates();

    return () => {
      backListener.remove();
      stateListener.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const updateStatus = () => {
        setUserOnline(user.uid, user.displayName || user.name)
          .catch(err => console.error("Presence Error:", err));
      };
      updateStatus();
      const interval = setInterval(updateStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/gossips" element={<GossipPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
