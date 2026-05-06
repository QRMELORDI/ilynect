import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme, t } = useSettings();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img
          src="/logo.png"
          alt="ILYNECT"
          className="nav-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--apple-blue)', letterSpacing: '-0.02em' }}>ILYNECT</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--apple-purple), var(--apple-pink))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.1rem', color: '#fff'
            }}>
              👤
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
