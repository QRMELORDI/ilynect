import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getHistory, updateMovieRulzConfig, getMovieRulzConfig } from '../services/api';

const FLOWERS = ['🌸','🌹','🌻','🌺','🌷','🌼','💐','🌿','🍀','🌾'];

export default function ProfilePage() {
  const { user, logout, updateName } = useAuth();
  const { language, toggleLanguage, theme, toggleTheme } = useSettings();
  const [stats, setStats] = useState({ views: 0, uploads: 0 });
  const [history, setHistory] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || user?.displayName || '');
  const [newDomain, setNewDomain] = useState('https://www.5movierulz.camera');
  const [updatingDomain, setUpdatingDomain] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.email === 'aviindo863@gmail.com';

  useEffect(() => {
    if (user?.id) {
      getHistory(user.id).then(data => setHistory(data || [])).catch(() => {});
    }
    if (isAdmin) {
      getMovieRulzConfig().then(data => {
        if (data.domain) setNewDomain(data.domain);
      }).catch(() => {});
    }
  }, [user?.id, isAdmin]);

  const handleSaveName = async () => {
    if (newName.trim() && newName !== user?.name) {
      await updateName(user.uid, newName.trim());
    }
    setEditing(false);
  };

  const handleUpdateDomain = async () => {
    if (!newDomain.trim()) return;
    setUpdatingDomain(true);
    try {
      const data = await updateMovieRulzConfig(newDomain.trim());
      if (data.success) {
        alert('MovieRulz domain updated successfully!');
      }
    } catch (err) {
      alert('Failed to update domain: ' + err.message);
    } finally {
      setUpdatingDomain(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const flower = FLOWERS[user?.avatar_index || 0] || '🌸';
  const APP_VERSION = '1.1.2';

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 500, paddingTop: 20 }}>
        
        {/* Version Badge - Visible for auto-update verification */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 10,
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          fontWeight: 700,
          letterSpacing: 1
        }}>
          VERSION 1.1.2 • ILYNECT PREMIUM
          {isAdmin ? ' • ADMIN' : ''}
        </div>
        
        {/* Auto-Update Status */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 20,
          fontSize: '0.55rem',
          color: 'var(--mint)',
          fontWeight: 600
        }}>
          ✅ AUTO-UPDATE ENABLED • Backend wakes automatically
        </div>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div 
            className="profile-avatar profile-avatar-lg animate-bounce-in"
            style={{ 
              margin: '0 auto 16px',
              background: `linear-gradient(135deg, ${user?.avatar_color || '#7B2FFF'}, var(--moody-mauve))`,
              boxShadow: '0 15px 40px rgba(123, 47, 255, 0.35)'
            }}
          >
            {flower}
          </div>
          
          {editing ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
              <input
                className="input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ maxWidth: 200, textAlign: 'center' }}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleSaveName} style={{ padding: '12px 20px' }}>
                SAVE
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {user?.name || user?.displayName || 'Family Member'}
                <button 
                  onClick={() => setEditing(true)}
                  style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {user?.email}
          </div>
          
          {isAdmin && (
            <div style={{ 
              marginTop: 12, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6,
              background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#fff'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              ADMIN
            </div>
          )}
        </div>

        <div className="glass-elevated" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', padding: 16 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--royal-purple)' }}>
                {history.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5 }}>
                ACTIVITY
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--border-glass)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--mint)' }}>
                {user?.avatar_index + 1 || 1}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5 }}>
                MEMBER
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12, letterSpacing: 1, color: 'var(--text-muted)' }}>
            SETTINGS
          </h2>
          
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div 
              className="list-item"
              onClick={toggleTheme}
              style={{ borderBottom: '1px solid var(--border-glass)' }}
            >
              <div style={{ 
                width: 36, height: 36, borderRadius: 10, 
                background: theme === 'dark' ? 'linear-gradient(135deg, #3D5A80, #1a1a2e)' : 'linear-gradient(135deg, #FFD700, #FFF8DC)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={theme === 'dark' ? '#fff' : '#000'}>
                  {theme === 'dark' ? (
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                  ) : (
                    <path d="M6.76 4.84l-1.14-1.14 1.41 1.41L8.17 6.25l-1.41-1.41zM4 10.5H1v2h3v-2zm9-9h-2v3h2V1zm7.14 3.64l1.41-1.41 1.41 1.41-1.41 1.41-1.41-1.41zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16h2v-2h-2v2z"/>
                  )}
                </svg>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">Dark Mode</div>
                <div className="list-item-sub">{theme === 'dark' ? 'Currently dark' : 'Currently light'}</div>
              </div>
              <div style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: theme === 'dark' ? 'var(--royal-purple)' : 'var(--bg-card)',
                position: 'relative',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: theme === 'dark' ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'all 0.3s'
                }} />
              </div>
            </div>
            
            <div className="list-item" onClick={() => navigate('/history')}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 10, 
                background: 'linear-gradient(135deg, #4CC9F0, #5AC8FA)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 17.9 10.51 19 13 19c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>
                </svg>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">Watch History</div>
                <div className="list-item-sub">View your activity</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-muted)">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
            
            <div className="list-item" onClick={() => navigate('/downloads')} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 10, 
                background: 'linear-gradient(135deg, #30D158, #34C759)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v3h14v-3H5z"/>
                </svg>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">Downloads</div>
                <div className="list-item-sub">Manage offline content</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-muted)">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>

            <div className="list-item" onClick={() => window.location.reload(true)}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 10, 
                background: 'linear-gradient(135deg, #5856D6, #AF52DE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">Update App</div>
                <div className="list-item-sub">Sync latest changes from server</div>
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 8, color: 'var(--text-muted)' }}>
                v1.1.2
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12, letterSpacing: 1, color: 'var(--text-muted)' }}>
              ADMIN: MOVIERULZ CONFIG
            </h2>
            <div className="glass" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>
                Current MovieRulz Domain:
              </div>
              <input 
                className="input"
                placeholder="https://www.5movierulz.camera"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                style={{ marginBottom: 12, fontSize: '0.85rem' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateDomain}
                disabled={updatingDomain}
                style={{ width: '100%', padding: '12px' }}
              >
                {updatingDomain ? 'UPDATING...' : 'UPDATE DOMAIN'}
              </button>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.4 }}>
                💡 Tip: If MovieRulz changes their domain, just paste the new link here and click Update.
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12, letterSpacing: 1, color: 'var(--text-muted)' }}>
            QUICK ACTIONS
          </h2>
          
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="list-item" onClick={() => navigate('/gossips')}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 10, 
                background: 'linear-gradient(135deg, #E53170, #FF6B6B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">Watch Reels</div>
                <div className="list-item-sub">Short family videos</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-muted)">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            background: 'var(--primary-pink)',
            marginBottom: 40
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          LOGOUT
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
            ILYNECT FAMILY CONNECT
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Made with ♥ in Prayagraj
          </div>
        </div>
      </div>
    </div>
  );
}