import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 8h3v8z' },
  { path: '/movierulz', label: 'Browse', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { path: '/photos', label: 'Photos', icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 4.5H5l3.5-3z' },
  { path: '/reels', label: 'Reels', icon: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z' },
  { path: '/upload', label: 'Upload', icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
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
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <div
            key={item.path}
            className="bottom-nav-item"
            onClick={() => navigate(item.path)}
            style={{
              background: active ? 'rgba(10, 132, 255, 0.15)' : 'transparent',
              borderRadius: 14,
            }}
          >
            <svg 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill={active ? 'var(--apple-blue)' : 'var(--text-muted)'}
              style={{
                transition: 'transform 0.2s',
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <path d={item.icon}/>
            </svg>
            <span 
              className="nav-label"
              style={{
                color: active ? 'var(--apple-blue)' : 'var(--text-muted)',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
