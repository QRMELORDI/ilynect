import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { wakeUpBackend } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { language, setLanguage, theme, setTheme, t } = useSettings();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(language === 'te' ? 'సర్వర్ నిద్రలేస్తోంది...' : 'Waking up server...');
    try {
      // Wake up backend first
      await wakeUpBackend();
      setStatus(language === 'te' ? 'లాగిన్ అవుతుంది...' : 'Logging in...');
      await login(email, name);
    } catch (err) {
      console.error('Login Error:', err.message);
      setStatus('');
      alert(err.message || (language === 'te' ? 'లాగిన్ విఫలయింది.' : 'Login failed.'));
    }
    setLoading(false);
  };

const handleAdminLogin = async () => {
    setLoading(true);
    setStatus(language === 'te' ? 'సర్వర్ నిద్రలేస్తోంది...' : 'Waking up server...');
    try {
      // Wake up backend first
      await wakeUpBackend();
      setStatus(language === 'te' ? 'లాగిన్ అవుతుంది...' : 'Logging in...');
      await login('aviindo863@gmail.com', 'Akshit');
    } catch (err) {
      console.error('Admin Login Error:', err.message);
      setStatus('');
      alert(err.message || (language === 'te' ? 'లాగిన్ విఫలయింది.' : 'Admin Login failed.'));
    }
    setLoading(false);
  };

  return (
    <div className="login-page" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme === 'light' ? '#E6E6FA' : '#000', // Mint purple for light mode
      backgroundImage: theme === 'light' ? 'radial-gradient(circle at 50% -20%, #F4F4FD, #E6E6FA)' : 'radial-gradient(circle at 50% -20%, #1e1e1e, #000)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Bar for toggles */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px', zIndex: 20 }}>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', color: theme === 'light' ? '#333' : '#fff', fontWeight: 'bold' }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Premium Background Decorations */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: '120vw', 
        height: '120vh', 
        background: theme === 'light' ? 'conic-gradient(from 180deg at 50% 50%, #E6E6FA 0deg, #F4F4FD 90deg, #D8BFD8 180deg, #F4F4FD 270deg, #E6E6FA 360deg)' : 'conic-gradient(from 180deg at 50% 50%, #2b2b2b 0deg, #000 90deg, #1a1a1a 180deg, #000 270deg, #2b2b2b 360deg)',
        filter: 'blur(100px)', 
        opacity: 0.4,
        zIndex: 1
      }} />

      <div className="glass" style={{
        padding: '50px 40px',
        borderRadius: '32px', // iPhone like smooth corners
        width: '90%',
        maxWidth: '380px',
        zIndex: 10,
        textAlign: 'center',
        background: theme === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.04)',
        border: theme === 'light' ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: theme === 'light' ? '0 20px 50px rgba(0,0,0,0.1)' : '0 20px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      }}>
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <img 
            src="/logo.jpeg" 
            alt="ILYNECT Logo" 
            className="human-float"
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              border: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)',
              padding: '2px',
              background: theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)',
              objectFit: 'cover'
            }} 
          />
        </div>
        
        <h1 style={{ 
          fontSize: '2.2rem', 
          fontWeight: '900', 
          marginBottom: '4px', 
          color: theme === 'light' ? '#1A1A1E' : '#fff',
          letterSpacing: '-0.05em'
        }}>
          ILYNECT
        </h1>
        <div style={{ 
          color: 'var(--apple-blue)', 
          marginBottom: '35px', 
          fontSize: '0.75rem',
          fontWeight: '800',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          {status || 'FAMILY CONNECT'}
        </div>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              fontWeight: '600', 
              color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)', 
              marginBottom: '6px',
              marginLeft: '4px',
              textTransform: 'uppercase'
            }}>{language === 'te' ? 'మీ పేరు' : 'Your Name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                background: theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)',
                border: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: theme === 'light' ? '#000' : '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              fontWeight: '600', 
              color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)', 
              marginBottom: '6px',
              marginLeft: '4px',
              textTransform: 'uppercase'
            }}>{language === 'te' ? 'ఈమెయిల్ అడ్రస్' : 'Email Address'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)',
                border: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: theme === 'light' ? '#000' : '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: loading ? 'rgba(255,255,255,0.1)' : 'var(--apple-blue)',
              color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              marginBottom: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (language === 'te' ? 'ప్రవేశిస్తోంది...' : 'Logging in...') : (language === 'te' ? 'యూజర్ లాగిన్' : 'User Login')}
          </button>

          <button 
            type="button"
            onClick={handleAdminLogin}
            disabled={loading} 
            style={{ 
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid var(--apple-blue)',
              background: 'transparent',
              color: theme === 'light' ? 'var(--apple-blue)' : '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Admin Login'}
          </button>
        </form>
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: '30px', 
        color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', 
        fontSize: '11px',
        fontWeight: '700',
        zIndex: 10,
        textAlign: 'center',
        letterSpacing: '0.5px'
      }}>
        DESIGNED FOR OUR FAMILY<br/>
        <span style={{ color: 'var(--apple-blue)' }}>HAPPY FAMILY KRGN BY NAVY</span>
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .human-float { animation: float 6s ease-in-out infinite; }
        .glass { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  );
}
