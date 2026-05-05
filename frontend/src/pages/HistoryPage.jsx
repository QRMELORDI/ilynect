import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory(user.id);
      setHistory(data || []);
    } catch { }
    setLoading(false);
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'upload': return '#E50914';
      case 'view': return '#46d369';
      case 'download': return '#2c87f0';
      default: return '#fff';
    }
  };

  const getActionLabel = (action) => {
    switch(action) {
      case 'upload': return 'అప్‌లోడ్';
      case 'view': return 'వీక్షించారు';
      case 'download': return 'డౌన్‌లోడ్';
      default: return action;
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: '100px' }}>
      <div className="container">
        <h1 className="section-title" style={{ fontSize: '2rem' }}>నా యాక్టివిటీ</h1>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="spinner" />
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>ఇంకా ఎలాంటి యాక్టివిటీ కనుగొనబడలేదు.</div>
        ) : (
          <div className="login-card" style={{ maxWidth: '800px', background: 'var(--bg-card)', margin: '0 auto' }}>
            {history.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ color: getActionColor(item.action), fontWeight: '700', textTransform: 'uppercase', fontSize: '12px', marginRight: '15px' }}>{getActionLabel(item.action)}</span>
                  <span style={{ fontWeight: '600' }}>{item.content_title}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {new Date(item.created_at * 1000).toLocaleString('te-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
