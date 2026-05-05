import React, { useState, useEffect, useRef } from 'react';
import { getDailyContent } from '../services/api';
import { askAI } from '../services/aiService';
import { useSettings } from '../contexts/SettingsContext';

const HEALTH_ICONS = ['💧', '🏃', '🍎', '😴', '🧘', '🥗', '☀️', '🫁', '🦷', '💪'];

export default function HealthPage() {
  const { t } = useSettings();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getDailyContent('health')
      .then(data => {
        // Handle both single fact or array of tips
        let processedTips = [];
        if (Array.isArray(data)) {
          processedTips = data;
        } else if (typeof data === 'string') {
          processedTips = [data];
        } else if (data && data.fact) {
          processedTips = [data.fact];
        }
        
        setTips(processedTips);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Health tips error:", err);
        setTips([]);
        setLoading(false);
      });
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsAsking(true);
    setAiResponse(null);
    try {
      const result = await askAI(question, 'health');
      setAiResponse(result);
      setQuestion('');
    } catch (err) {
      console.error(err);
      setAiResponse({ text: "Sorry, I'm having trouble connecting to the AI right now." });
    }
    setIsAsking(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-wrapper" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, #0d1a15 100%)', paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="page-title">💚 {t.health}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
            తెలుగులో ఆరోగ్య చిట్కాలు • ప్రతిరోజూ రిఫ్రెష్ అవుతుంది
          </p>
        </div>

        {/* AI Assistant Section */}
        <div className="glass" style={{ borderRadius: '24px', padding: 24, marginBottom: 32, border: '1px solid var(--mint)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: '1.5rem' }}>🤖</div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--mint)' }}>{t.ask_health_ai.toUpperCase()}</div>
          </div>
          
          <form onSubmit={handleAskAI} style={{ display: 'flex', gap: 10 }}>
            <input 
              className="input" 
              placeholder={t.ask_placeholder} 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={{ borderRadius: '14px', background: 'rgba(0,0,0,0.2)' }}
            />
            <button className="btn btn-primary" style={{ padding: '0 20px', borderRadius: '14px', background: 'var(--mint)', color: '#000' }} disabled={isAsking}>
              {isAsking ? '...' : 'ASK'}
            </button>
          </form>

          {aiResponse && (
            <div style={{ marginTop: 20, padding: 18, background: 'rgba(0,255,180,0.05)', borderRadius: '16px', border: '1px solid rgba(0,255,180,0.1)' }}>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{aiResponse.text}</div>
              {aiResponse.disclaimer && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>
                  {aiResponse.disclaimer}
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {tips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💚</div>
            <div className="empty-state-title">హెల్త్ టిప్స్ లోడ్ కాలేదు</div>
            <div className="empty-state-desc">దయచేసి తర్వాత ప్రయత్నించండి.</div>
          </div>
        ) : (
          tips.map((tip, index) => (
            <div
              key={index}
              className="health-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>
                {HEALTH_ICONS[index % HEALTH_ICONS.length]}
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--mint)', fontWeight: 700, marginBottom: 4 }}>
                  టిప్ #{index + 1}
                </div>
                <div className="health-card-text">
                  {typeof tip === 'string' ? tip.replace(/^[\d💧🏃🍎😴🧘🥗☀️\s.]+/, '') : tip}
                </div>
              </div>
            </div>
          ))
        )}

        <div className="card" style={{ marginTop: 28, padding: 20, borderLeft: '3px solid var(--mint)' }}>
          <div style={{ color: 'var(--mint)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>💡 ప్రో టిప్</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            మంచి ఆరోగ్యం కోసం ప్రతిరోజూ వ్యాయామం చేయండి, సరిపడా నీళ్ళు తాగండి, మరియు 7-8 గంటలు నిద్రపోండి.
          </div>
        </div>
      </div>
    </div>
  );
}
