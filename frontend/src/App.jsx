import React, { useEffect } from 'react';
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
import { checkVersion, setUserOnline } from './services/api';
import './index.css';

const APP_VERSION = '1.0.3';

function AppRoutes() {
  const { user, loading } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const updateStatus = () => {
        setUserOnline(user.uid, user.displayName || user.name)
          .catch(err => console.error("Presence Error:", err));
      };
      
      updateStatus();
      // Keep presence updated every 30 seconds for better responsiveness
      const interval = setInterval(updateStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleFocus = async () => {
      try {
        const data = await checkVersion();
        if (data.version !== APP_VERSION && data.update_required) {
          alert(`✨ ILYNECT కొత్త వెర్షన్ (${data.version}) అందుబాటులో ఉంది! App will restart to apply updates.`);
          window.location.reload(true);
        }
      } catch {}
    };
    window.addEventListener('focus', handleFocus);
    handleFocus();

    const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/') {
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        window.history.back();
      } else {
        navigate('/');
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      backListener.then(l => l.remove());
    };
  }, [navigate, location]);

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
