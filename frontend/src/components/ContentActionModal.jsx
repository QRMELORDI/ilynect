import React from 'react';

export default function ContentActionModal({ item, onWatch, onDownload, onShare, onDelete, onClose }) {
  if (!item) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
      animation: 'fade-in 0.2s ease-out'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--bg-secondary)',
          width: '92%',
          maxWidth: 420,
          borderRadius: 28,
          padding: 28,
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          border: '1px solid var(--border-glass)',
          animation: 'slide-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 24, 
          background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 20px',
          boxShadow: '0 15px 40px rgba(123, 47, 255, 0.3)'
        }}>
          🎬
        </div>
        
        <h3 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 900, 
          marginBottom: 8, 
          color: 'var(--text-primary)',
          lineHeight: 1.3
        }}>
          {item.title}
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          justifyContent: 'center',
          marginBottom: 24,
          fontSize: '0.75rem', 
          color: 'var(--text-muted)',
          fontWeight: 600
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            {item.uploader_name || 'FAMILY'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/>
            </svg>
            {item.views || 0} views
          </span>
        </div>

        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem', 
          marginBottom: 28, 
          fontWeight: 500 
        }}>
          What would you like to do?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            className="btn btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, var(--apple-blue), #0056CC)',
              color: '#fff', 
              padding: '16px',
              borderRadius: 16,
              fontWeight: 900,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 8px 25px rgba(0, 113, 227, 0.3)'
            }}
            onClick={() => { onWatch?.(item); onClose(); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            WATCH NOW
          </button>

          <button 
            className="download-btn"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
            onClick={() => { onDownload?.(item); onClose(); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v3h14v-3H5z"/>
            </svg>
            DOWNLOAD
          </button>

          {onShare && (
            <button 
              className="btn btn-secondary" 
              style={{ 
                background: 'rgba(48, 209, 88, 0.1)',
                color: 'var(--mint)',
                padding: '16px',
                borderRadius: 16,
                fontWeight: 900,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                border: '1px solid rgba(48, 209, 88, 0.3)'
              }}
              onClick={() => { onShare(item); onClose(); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              SHARE
            </button>
          )}

          {onDelete && (
            <button 
              style={{ 
                background: 'rgba(255, 59, 48, 0.1)',
                color: 'var(--primary-pink)',
                padding: '14px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: '1px solid rgba(255, 59, 48, 0.3)',
                cursor: 'pointer'
              }}
              onClick={() => { onDelete(item.id); onClose(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              DELETE
            </button>
          )}

          <button 
            style={{ 
              background: 'transparent', 
              color: 'var(--text-muted)', 
              border: 'none', 
              marginTop: 8, 
              fontWeight: 700, 
              cursor: 'pointer', 
              fontSize: '0.85rem' 
            }}
            onClick={onClose}
          >
            NOT NOW
          </button>
        </div>
      </div>
    </div>
  );
}