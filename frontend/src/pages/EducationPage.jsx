import React, { useState, useEffect, useRef } from 'react';
import { getDailyContent } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { askAI } from '../services/aiService';

export default function EducationPage() {
  const { t } = useSettings();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDailyContent();
        const fallback = {
          date: new Date().toISOString().split('T')[0],
          education: { fact: data?.fact || 'Science: Honey never spoils. 3000-year-old honey found in Egyptian tombs was still edible.' },
          brain_twister: data?.brain_puzzle || data?.quiz || 'What has keys but cant open locks? (Answer: A piano)',
          gk: data?.gk || 'Who wrote the Indian National Anthem? Rabindranath Tagore.',
          neethivaakyam: data?.manchi_maata || '\u0c15\u0c37\u0c4d\u0c1f\u0c2a\u0c21\u0c3f\u0c24\u0c47 \u0c2b\u0c32\u0c3f\u0c24\u0c02 \u0c24\u0c2a\u0c4d\u0c2a\u0c15 \u0c35\u0c38\u0c4d\u0c24\u0c41\u0c02\u0c26\u0c3f.',
          speciality: data?.speciality || 'Today is a new opportunity to learn and grow!',
          maths_puzzle: data?.math_puzzle || 'I am an odd number. Take away one letter and I become even. (Answer: Seven)',
          thought: data?.thought || 'Success is not final, failure is not fatal: it is the courage to continue.',
          joke: data?.joke || '\u0c1f\u0c40\u0c1a\u0c30\u0c4d: \u0c28\u0c40\u0c15\u0c41 \u0c0f\u0c02 \u0c15\u0c3e\u0c35\u0c3e\u0c32\u0c3f? \u0c38\u0c4d\u0c1f\u0c42\u0c21\u0c46\u0c02\u0c1f\u0c4d: \u0c38\u0c46\u0c32\u0c35\u0c41\u0c32\u0c41 \u0c2e\u0c3e\u0c24\u0c4d\u0c30\u0c2e\u0c47 \u0c38\u0c3e\u0c30\u0c4d!',
          science: data?.fact || 'A day on Venus is longer than a year on Venus.'
        };
        setContent(fallback);
      } catch (err) {
        console.error('Education load error:', err);
        setContent({
          date: new Date().toISOString().split('T')[0],
          education: { fact: 'Science: Honey never spoils.' },
          brain_twister: 'What has keys but cant open locks? (Piano)',
          gk: 'Who wrote Indian National Anthem? Rabindranath Tagore.',
          neethivaakyam: '\u0c15\u0c37\u0c4d\u0c1f\u0c2a\u0c21\u0c3f\u0c24\u0c47 \u0c2b\u0c32\u0c3f\u0c24\u0c02 \u0c24\u0c2a\u0c4d\u0c2a\u0c15 \u0c35\u0c38\u0c4d\u0c24\u0c41\u0c02\u0c26\u0c3f.',
          speciality: 'Today is a new opportunity!',
          maths_puzzle: 'Odd number, remove one letter = even. (Seven)',
          thought: 'Courage to continue is success.',
          joke: '\u0c1f\u0c40\u0c1a\u0c30\u0c4d: \u0c28\u0c40\u0c15\u0c41 \u0c0f\u0c02 \u0c15\u0c3e\u0c35\u0c3e\u0c32\u0c3f?',
          science: 'A day on Venus is longer than its year.'
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsAsking(true);
    setAiResponse(null);
    try {
      const result = await askAI(question, 'education');
      setAiResponse(result);
      setQuestion('');
    } catch (err) {
      console.error(err);
      setAiResponse({ text: "I'm sorry, I couldn't get an answer for you. Please try again later." });
    }
    setIsAsking(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner" /></div>;

  const sections = [
    { title: '💡 Amazing Fact', body: content.education?.fact, color: '#FFD700' },
    { title: '🧠 Brain Twister', body: content.brain_twister, color: '#AF52DE' },
    { title: '❓ GK Question', body: content.gk, color: '#4CC9F0' },
    { title: '📜 నీతివాక్యం', body: content.neethivaakyam, color: '#06D6A0' },
    { title: '✨ Speciality', body: content.speciality, color: '#FF7A00' },
    { title: '🧩 Maths Puzzle', body: content.maths_puzzle, color: '#E53170' },
    { title: '💭 Thought', body: content.thought, color: '#0071E3' },
    { title: '😂 Telugu Joke', body: content.joke, color: '#FF3B30' },
    { title: '🧪 Science', body: content.science, color: '#7B2FFF' },
  ];

  return (
    <div className="page-wrapper" style={{ paddingBottom: 100 }}>
      <div className="container">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
           <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>DAILY KNOWLEDGE</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>{content.date}</p>
        </div>

        {/* AI Tutor Section */}
        <div className="glass" style={{ borderRadius: '24px', padding: 24, marginBottom: 24, border: '1px solid var(--royal-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: '1.5rem' }}>🎓</div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--royal-purple)' }}>{t.ask_edu_ai.toUpperCase()}</div>
          </div>
          
          <form onSubmit={handleAskAI} style={{ display: 'flex', gap: 10 }}>
            <input 
              className="input" 
              placeholder={t.ask_placeholder} 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.03)' }}
            />
            <button className="btn btn-primary" style={{ padding: '0 20px', borderRadius: '14px', background: 'var(--royal-purple)', color: '#fff' }} disabled={isAsking}>
              {isAsking ? '...' : 'ASK'}
            </button>
          </form>

          {aiResponse && (
            <div style={{ marginTop: 20, padding: 18, background: 'rgba(123, 47, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(123, 47, 255, 0.1)' }}>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{aiResponse.text}</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           {sections.map((sec, i) => (
             <div key={i} className="glass" style={{ borderRadius: '24px', padding: 24 }}>
                <div style={{ 
                  fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', 
                  color: sec.color, letterSpacing: 1.5, marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                   <span style={{ width: 6, height: 6, borderRadius: '50%', background: sec.color }} />
                   {sec.title}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                   {sec.body}
                </div>
             </div>
           ))}
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '20px 0', marginTop: 30 }}>
           DESIGNED FOR OUR FAMILY , HAPPY FAMILY KRGN BY NAVY
        </div>
      </div>
    </div>
  );
}
