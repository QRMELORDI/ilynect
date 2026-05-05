import React, { useState, useEffect } from 'react';
import { getDailyContent } from '../services/api';

export default function DailyPage({ type = 'education' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await getDailyContent();
      // Filter based on page type
      const filtered = type === 'education'
        ? data.filter(i => ['fact', 'quiz', 'gk', 'manchi_maata', 'speciality', 'joke'].includes(i.type))
        : data.filter(i => i.type === 'health_tip');
      setItems(filtered);
    } catch { }
    setLoading(false);
  };

  const typeLabels = {
    fact: 'నిజం (Fact)',
    quiz: 'క్విజ్ (Quiz)',
    gk: 'జనరల్ నాలెడ్జ్ (GK)',
    manchi_maata: 'మంచి మాట',
    speciality: 'ఈ రోజు ప్రత్యేకత',
    joke: 'జోక్',
    health_tip: 'ఆరోగ్య చిట్కాలు (Health Tips)'
  };

  if (loading) return <div className="loading-screen">🌟 లోడ్ అవుతోంది... ({type})</div>;

  return (
    <div className="app-container" style={{ paddingTop: '80px' }}>
      <h1 style={{ padding: '0 4%', marginBottom: '2rem' }}>
        {type === 'education' ? 'తెలివితేటలు (Education)' : 'ఆరోగ్యమే మహాభాగ్యం (Health)'}
      </h1>

      <div className="daily-grid">
        {items.map(item => (
          <div key={item.id} className="daily-card">
            <div className="daily-type">
              {typeLabels[item.type] || item.type}
            </div>
            <div className="daily-content">
              {item.content.split('. ').map((line, idx) => (
                <p key={idx} style={{ marginBottom: '0.5rem' }}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
