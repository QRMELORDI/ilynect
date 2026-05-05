import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVideos, getPhotos, getDailyContent } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const FAMILY_MEMBERS = [
  { name: 'Brother', location: 'Nellore', icon: '👨‍🎓' },
  { name: 'Sister', location: 'Delhi', icon: '👩‍💼' },
  { name: 'Parents', location: 'Home', icon: '👨‍👩‍👧' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { theme } = useSettings();
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
    { icon: '🎬', label: 'Movies', desc: `${stats.videos} Videos`, path: '/videos', color: 'linear-gradient(135deg, #E53170, #FF6B6B)' },
    { icon: '📸', label: 'Photos', desc: `${stats.photos} Photos`, path: '/photos', color: 'linear-gradient(135deg, #4CC9F0, #5AC8FA)' },
    { icon: '🎯', label: 'Reels', desc: 'Watch Reels', path: '/gossips', color: 'linear-gradient(135deg, #7B2FFF, #AF52DE)' },
    { icon: '💬', label: 'Chat', desc: 'Family Chat', path: '/chats', color: 'linear-gradient(135deg, #30D158, #34C759)' },
    { icon: '📚', label: 'Education', desc: 'GK, Tips', path: '/education', color: 'linear-gradient(135deg, #FFD700, #FF9F1C)' },
    { icon: '💚', label: 'Health', desc: 'Health Tips', path: '/health', color: 'linear-gradient(135deg, #06D6A0, #30D158)' },
  ];

  return (
    <div className="page-wrapper" style={{ paddingBottom: 110 }}>
      <div className="container">
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <h1 className="royal-purple-wave" style={{ fontSize: '2.6rem', marginBottom: 4 }}>
            ILYNECT
          </h1>
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            color: 'var(--text-muted)', 
            letterSpacing: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)' }} />
            FAMILY CONNECT
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)' }} />
          </div>
        </div>

        <div style={{ marginBottom: 28, paddingTop: 8 }}>
          <div className="glass-elevated" style={{ 
            padding: '20px 20px 16px',
            background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.1), rgba(229, 49, 112, 0.05))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.6rem',
                boxShadow: '0 10px 25px rgba(123, 47, 255, 0.3)'
              }}>
                👋
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>
                  Hello, {user?.displayName || user?.name || 'Family'}!
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Stay connected with your loved ones <span className="wave-hand">👋</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: 0.5 }}>QUICK ACCESS</h2>
            <Link to="/upload" style={{ 
              fontSize: '0.75rem', 
              color: 'var(--royal-purple)', 
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              UPLOAD +
            </Link>
          </div>
          
          <div className="quick-grid">
            {quickCards.map((card, index) => (
              <Link 
                key={card.path} 
                to={card.path} 
                className="quick-card"
                style={{ 
                  animation: 'slide-up 0.4s ease-out',
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <div 
                  className="quick-card-icon"
                  style={{ background: card.color }}
                >
                  {card.icon}
                </div>
                <div className="quick-card-label">{card.label}</div>
                <div className="quick-card-sub">{card.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <div 
          className="glass-elevated" 
          style={{ 
            marginBottom: 24, 
            padding: 20, 
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.08), rgba(229, 49, 112, 0.04))'
          }}
          onClick={() => window.open('https://drive.google.com/file/d/1vi2Sr6a4JfL1rM8lj2grMd0alo2Lnabx/preview', '_blank')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 14, 
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📽️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', marginBottom: 2 }}>
                HOW TO USE
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Watch the 1-minute intro
              </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--text-muted)">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dailyFact && (
            <Link to="/education" style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  marginBottom: 10
                }}>
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: '#FFD700', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: 1 
                  }}>
                    Daily Fact
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-primary)', 
                  lineHeight: 1.5, 
                  fontWeight: 500 
                }}>
                  {dailyFact}
                </div>
              </div>
            </Link>
          )}

          {healthTip && (
            <Link to="/health" style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  marginBottom: 10
                }}>
                  <span style={{ fontSize: '1.2rem' }}>💚</span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--mint)', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: 1 
                  }}>
                    Health Tip
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-primary)', 
                  lineHeight: 1.5, 
                  fontWeight: 500 
                }}>
                  {healthTip}
                </div>
              </div>
            </Link>
          )}

          <div 
            className="glass" 
            style={{ 
              borderRadius: 20, 
              padding: 18,
              border: '1px solid var(--border-glow)'
            }}
            onClick={() => navigate('/history')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>📊</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Your Activity
                  </div>
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

        <div style={{ 
          textAlign: 'center', 
          marginTop: 36, 
          marginBottom: 20,
          padding: '16px 0',
          borderTop: '1px solid var(--border-glass)'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 8
          }}>
            <span style={{ 
              fontSize: '0.65rem', 
              color: 'var(--text-muted)', 
              fontWeight: 800,
              letterSpacing: 1 
            }}>
              DESIGNED FOR OUR FAMILY
            </span>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Made with ♥ in Prayagraj
          </div>
        </div>
      </div>
    </div>
  );
}