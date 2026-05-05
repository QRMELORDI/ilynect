import React, { useState } from 'react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          {t.type === 'success' && <span>✅</span>}
          {t.type === 'error' && <span>❌</span>}
          {t.type === 'info' && <span>ℹ️</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// Hook
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };
  return { toasts, show };
}
