import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideos, recordView, interactVideo } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function GossipPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentRef] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef();

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const data = await getVideos({ sub_type: 'reels' });
      setReels(data || []);
    } catch {}
    setLoading(false);
  };

  const handleInteract = async (id, type) => {
    try {
      const res = await interactVideo(id, user.uid, type);
      if (res) {
        setReels(prev => prev.map(r => r.id === id ? { ...r, likes: res.likes, dislikes: res.dislikes } : r));
      }
    } catch {}
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;

  return (
    <div className="page-wrapper" style={{ padding: 0, background: '#000', overflow: 'hidden' }}>
      
      {reels.length === 0 ? (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff' }}>
           <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎯</div>
           <div style={{ fontWeight: 900 }}>NO REELS FOUND</div>
           <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/upload?type=reels')}>UPLOAD REEL</button>
        </div>
      ) : (
        <div ref={containerRef} style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}>
           {reels.map((reel, index) => (
             <div key={reel.id} style={{ height: '100vh', width: '100%', scrollSnapAlign: 'start', position: 'relative' }}>
                 <video 
                   src={reel.streamUrl} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   loop 
                   playsInline 
                   autoPlay={index === 0}
                   onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
                   onPlay={() => recordView(reel.id)}
                 />
                
                {/* Actions */}
                <div style={{ position: 'absolute', right: 15, bottom: 120, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', zIndex: 10 }}>
                   <div onClick={() => handleInteract(reel.id, 'like')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.89C7.22 8.27 7 8.79 7 9.33v9.33c0 1.1.9 2 2 2h8c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/></svg>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 800, marginTop: 4 }}>{reel.likes || 0}</div>
                   </div>
                   <div onClick={() => handleInteract(reel.id, 'dislike')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" style={{ transform: 'rotate(180deg)' }}><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.89C7.22 8.27 7 8.79 7 9.33v9.33c0 1.1.9 2 2 2h8c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/></svg>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 800, marginTop: 4 }}>{reel.dislikes || 0}</div>
                   </div>
                   <div onClick={() => navigate('/chats')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                      </div>
                   </div>
                </div>

                {/* Info */}
                <div style={{ position: 'absolute', left: 15, bottom: 40, zIndex: 10, maxWidth: '70%' }}>
                   <div style={{ fontWeight: 900, color: '#fff', fontSize: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>@{reel.userName?.toUpperCase() || 'FAMILY'}</div>
                   <div style={{ color: '#fff', fontSize: '0.85rem', marginTop: 5, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{reel.title}</div>
                   <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', marginTop: 4, fontWeight: 700 }}>📍 {reel.location}</div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Upload FAB */}
      {!loading && (
        <button 
          onClick={() => navigate('/upload?type=reels')}
          style={{ position: 'fixed', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.5rem', zIndex: 100 }}
        >
          +
        </button>
      )}
    </div>
  );
}
