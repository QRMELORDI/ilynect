import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import VideosPage from './pages/VideosPage';
import MovierulzPage from './pages/MovierulzPage';
import GossipPage from './pages/GossipPage';
import PhotosPage from './pages/PhotosPage';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import DownloadsPage from './pages/DownloadsPage';
import ProfilePage from './pages/ProfilePage';
import { checkVersion, setUserOnline } from './services/api';
import './index.css';

const APP_VERSION = '1.1.0';

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const historyRef = useRef([]);

  useEffect(() => {
    if (user) {
      const updateStatus = () => {
        setUserOnline(user.uid, user.displayName || user.name).catch(() => {});
      };
      updateStatus();
      const interval = setInterval(updateStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleFocus = async () => {
      try {
        const data = await checkVersion();
        if (data.version !== APP_VERSION && data.update_required) {
          window.location.reload();
        }
      } catch {}
    };
    window.addEventListener('focus', handleFocus);
    handleFocus();

    let backListener;
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const path = location.pathname;
      if (path === '/' || path === '/profile') {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    }).then(listener => { backListener = listener; });

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (backListener) backListener.remove();
    };
  }, [navigate, location]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--apple-bg)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/movierulz" element={<MovierulzPage />} />
        <Route path="/gossips" element={<GossipPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
