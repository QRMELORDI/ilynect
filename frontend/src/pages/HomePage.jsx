import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVideos, getPhotos, getDailyContent } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ videos: 0, photos: 0 });
  const [dailyFact, setDailyFact] = useState('');
  const [healthTip, setHealthTip] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadDailyPreview();
  }, []);

  const loadStats = async () => {
    try {
      const [vData, pData] = await Promise.all([
        getVideos().catch(() => ({ videos: [] })),
        getPhotos().catch(() => ({ photos: [] }))
      ]);
      setStats({
        videos: (vData.videos || []).length,
        photos: (pData.photos || []).length
      });
    } catch {}
  };

  const loadDailyPreview = async () => {
    try {
      const edu = await getDailyContent('education');
      if (edu && edu.fact) setDailyFact(edu.fact);
    } catch {}
    try {
      const health = await getDailyContent('health');
      if (health && health.fact) setHealthTip(health.fact);
    } catch {}
    setLoading(false);
  };

  const quickCards = [
    { icon: '🎬', label: 'Movies', desc: `${stats.videos} Videos`, path: '/videos', color: 'linear-gradient(135deg, #FF375F, #FF6B6B)' },
    { icon: '📸', label: 'Photos', desc: `${stats.photos} Photos`, path: '/photos', color: 'linear-gradient(135deg, #64D2FF, #5AC8FA)' },
    { icon: '🎯', label: 'Reels', desc: 'Watch Reels', path: '/gossips', color: 'linear-gradient(135deg, #BF5AF2, #AF52DE)' },
    { icon: '💬', label: 'Chat', desc: 'Family Chat', path: '/chats', color: 'linear-gradient(135deg, #30D158, #34C759)' },
    { icon: '📚', label: 'Education', desc: 'GK, Tips', path: '/education', color: 'linear-gradient(135deg, #FFD60A, #FF9F1C)' },
    { icon: '💚', label: 'Health', desc: 'Health Tips', path: '/health', color: 'linear-gradient(135deg, #64D2FF, #30D158)' },
  ];

  return (
    <div className="page-wrapper" style={{ paddingBottom: 110 }}>
      <div className="container">
        {/* Header */}
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.8rem', 
            fontWeight: 800, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 6
          }}>
            ILYNECT
          </h1>
          <div style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            letterSpacing: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158' }} />
            FAMILY CONNECT
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158' }} />
          </div>
        </div>

        {/* Welcome Card */}
        <div style={{ marginBottom: 28 }}>
          <div className="glass-elevated" style={{ 
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(191, 90, 242, 0.04))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 58, 
                height: 58, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.8rem',
                boxShadow: '0 10px 25px rgba(10, 132, 255, 0.3)'
              }}>
                👋
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Hello, {user?.displayName || user?.name || 'Family'}!
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Stay connected with your loved ones
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: 0.5 }}>Quick Access</h2>
            <Link to="/upload" style={{ 
              fontSize: '0.75rem', 
              color: '#0A84FF', 
              fontWeight: 700,
              textDecoration: 'none'
            }}>
              + Upload
            </Link>
          </div>
          
          <div className="quick-grid">
            {quickCards.map((card, index) => (
              <Link 
                key={card.path} 
                to={card.path} 
                className="quick-card animate-bounce-in"
                style={{ 
                  animationDelay: `${index * 0.06}s`
                }}
              >
                <div 
                  className="quick-card-icon"
                  style={{ background: card.color }}
                >
                  {card.icon}
                </div>
                <div className="quick-card-label" style={{ fontWeight: 600 }}>{card.label}</div>
                <div className="quick-card-sub" style={{ fontWeight: 500 }}>{card.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Daily Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dailyFact && (
            <Link to="/education" style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.3rem' }}>💡</span>
                  <span style={{ fontSize: '0.65rem', color: '#FFD60A', fontWeight: 700, letterSpacing: 1 }}>
                    DAILY FACT
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {dailyFact}
                </div>
              </div>
            </Link>
          )}

          {healthTip && (
            <Link to="/health" style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.3rem' }}>💚</span>
                  <span style={{ fontSize: '0.65rem', color: '#30D158', fontWeight: 700, letterSpacing: 1 }}>
                    HEALTH TIP
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {healthTip}
                </div>
              </div>
            </Link>
          )}

          <div className="glass" style={{ borderRadius: 20, padding: 18 }} onClick={() => navigate('/history')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>📊</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Your Activity</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    View what you've watched
                  </div>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-muted)">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 20, paddingTop: 20, borderTop: '1px solid var(--apple-border)' }}>
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