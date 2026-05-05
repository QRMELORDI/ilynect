import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function Navbar() {
  const { user } = useAuth();
  const { language, setLanguage, theme, setTheme, t } = useSettings();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logo.jpeg"
            alt="ILYNECT"
            className="nav-logo"
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-glass)' }}
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
          {!isHome && <span style={{ marginLeft: 8, fontWeight: 900, fontSize: '1rem', color: 'var(--royal-purple)' }}>ILYNECT</span>}
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme */}
        <button className="nav-icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary-pink), var(--moody-mauve))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.2rem', color: '#fff', border: '2px solid rgba(255,255,255,0.2)'
            }}>
               👤
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
