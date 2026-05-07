import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVideos, getPhotos } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ videos: 0, photos: 0, reels: 0 });
  const navigate = useNavigate();

  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    loadStats();
    checkUpdate();
  }, []);

  const checkUpdate = async () => {
    try {
      const { checkVersion } = await import('../services/api');
      const data = await checkVersion();
      // App version is 1.2.0. If server has higher, show update card.
      if (data.version !== '1.2.0') {
        setUpdateInfo(data);
      }
    } catch (err) {
      console.error('Update check failed:', err);
    }
  };

  const loadStats = async () => {
    try {
      const [vData, pData] = await Promise.all([
        getVideos({ sub_type: 'movie' }).catch(() => ({ videos: [] })),
        getPhotos().catch(() => ({ photos: [] })),
        getVideos({ sub_type: 'gossip' }).catch(() => ({ videos: [] })),
      ]);
      setStats({
        videos: (vData.videos || []).length,
        photos: (pData.photos || []).length,
        reels: (pData.videos || []).length,
      });
    } catch {}
  };

  const quickCards = [
    { icon: '🌐', label: 'Browse', desc: `MovieRulz`, path: '/movierulz', gradient: 'linear-gradient(135deg, #0A84FF, #0071E3)' },
    { icon: '🎬', label: 'Cinema', desc: `${stats.videos} Movies`, path: '/videos', gradient: 'linear-gradient(135deg, #FF375F, #FF2D55)' },
    { icon: '📸', label: 'Photos', desc: `${stats.photos} Photos`, path: '/photos', gradient: 'linear-gradient(135deg, #64D2FF, #5AC8FA)' },
    { icon: '🎯', label: 'Reels', desc: `${stats.reels} Reels`, path: '/reels', gradient: 'linear-gradient(135deg, #BF5AF2, #AF52DE)' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome Header */}
        <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 4
          }}>
            ILYNECT
          </h1>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            letterSpacing: 3,
          }}>
            FAMILY CONNECT
          </div>
        </div>

        {/* Welcome Card */}
        <div style={{ marginBottom: 28 }}>
          <div className="glass-elevated" style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(191, 90, 242, 0.05))',
            border: '1px solid var(--apple-border-light)',
            borderRadius: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 54, 
                height: 54, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.6rem',
                boxShadow: '0 8px 20px rgba(10, 132, 255, 0.3)',
              }}>
                <span className="wave-hand">👋</span>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Hello, {user?.displayName || user?.name || 'Family'}!
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Stay connected with your loved ones
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: 0.5 }}>Quick Access</h2>
            <Link to="/upload" style={{ 
              fontSize: '0.8rem', 
              color: '#0A84FF', 
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              + Upload
            </Link>
          </div>

          {updateInfo && (
            <div 
              className="glass fade-up" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 45, 85, 0.1))',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                borderRadius: 20, 
                padding: '20px', 
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 15
              }}
            >
              <div style={{ fontSize: '2rem' }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, color: '#FF3B30', fontSize: '0.9rem', marginBottom: 4 }}>NEW VERSION {updateInfo.version} AVAILABLE!</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{updateInfo.message || 'Get the latest features and bug fixes.'}</div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => window.open(updateInfo.updateUrl, '_blank')}
                style={{ background: '#FF3B30', padding: '8px 16px', fontSize: '0.75rem', borderRadius: 12 }}
              >
                UPDATE
              </button>
            </div>
          )}
          
          <div className="quick-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
            {/* Super Prominent MovieRulz */}
            <Link to="/movierulz" className="quick-card pulse-glow" style={{ 
              background: 'linear-gradient(135deg, #0A84FF, #0071E3)', 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 20,
              textAlign: 'left',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2.5rem' }}>🌐</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', marginBottom: 2 }}>BROWSE MOVIES</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Latest Telugu Cinema & Mirrors</div>
              </div>
              <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>→</div>
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <Link to="/videos" className="quick-card" style={{ padding: '16px 12px' }}>
                <div className="quick-card-icon" style={{ background: 'linear-gradient(135deg, #FF375F, #FF2D55)', width: 40, height: 40, fontSize: '1.2rem' }}>🎬</div>
                <div className="quick-card-label" style={{ fontSize: '0.8rem' }}>Cinema</div>
                <div className="quick-card-sub" style={{ fontSize: '0.65rem' }}>{stats.videos} Family</div>
              </Link>
              <Link to="/gossips" className="quick-card" style={{ padding: '16px 12px' }}>
                <div className="quick-card-icon" style={{ background: 'linear-gradient(135deg, #BF5AF2, #AF52DE)', width: 40, height: 40, fontSize: '1.2rem' }}>🎯</div>
                <div className="quick-card-label" style={{ fontSize: '0.8rem' }}>Reels</div>
                <div className="quick-card-sub" style={{ fontSize: '0.65rem' }}>Fun Moments</div>
              </Link>
              <Link to="/photos" className="quick-card" style={{ gridColumn: 'span 2', padding: '14px 20px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="quick-card-icon" style={{ background: 'linear-gradient(135deg, #64D2FF, #5AC8FA)', margin: 0, width: 36, height: 36, fontSize: '1.1rem' }}>📸</div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div className="quick-card-label" style={{ fontSize: '0.85rem' }}>Photos Gallery</div>
                      <div className="quick-card-sub" style={{ fontSize: '0.7rem' }}>{stats.photos} Shared Memories</div>
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.3 }}>→</div>
                 </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div 
          className="glass" 
          style={{ borderRadius: 20, padding: 18, cursor: 'pointer' }} 
          onClick={() => navigate('/history')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Your Activity</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  View what you've watched
                </div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-muted)">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 20, paddingTop: 20, borderTop: '1px solid var(--apple-border-light)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            DESIGNED FOR OUR FAMILY
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            Made with ❤️ in Prayagraj
          </div>
        </div>
      </div>
    </div>
  );
}
