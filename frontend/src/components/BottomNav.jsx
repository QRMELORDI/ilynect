import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 8h3v8z', activeIcon: 'M10 20v-6h4v6h5v-8h3L12 3 2 8h3v8z' },
  { path: '/videos', label: 'Movies', icon: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4h-2l2 4H9l2-4H7L4 4h14zM4 18v4h16v-4H4z', activeIcon: 'M4 18v4h16v-4H4z' },
  { path: '/photos', label: 'Photos', icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 4.5H5l3.5-3z', activeIcon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 4.5H5l3.5-3z' },
  { path: '/chats', label: 'Chat', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', activeIcon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
  { path: '/upload', label: 'Upload', icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', activeIcon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-widget">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.path}
          className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          style={{
            padding: '8px 12px',
            borderRadius: 16,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            background: isActive(item.path) ? 'rgba(123, 47, 255, 0.15)' : 'transparent'
          }}
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill={isActive(item.path) ? 'var(--royal-purple)' : 'var(--text-muted)'}
            style={{
              transition: 'all 0.3s',
              transform: isActive(item.path) ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <path d={isActive(item.path) ? item.activeIcon : item.icon}/>
          </svg>
          <div 
            className="nav-label"
            style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              color: isActive(item.path) ? 'var(--royal-purple)' : 'var(--text-muted)',
              letterSpacing: 0.5,
              marginTop: 2
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </nav>
  );
}