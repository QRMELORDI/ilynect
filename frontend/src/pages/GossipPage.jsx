import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideos, recordView, interactVideo, deleteVideo } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function GossipPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentRef] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  const handleDelete = async (id) => {
    if (window.confirm('Delete this reel?')) {
      try {
        await deleteVideo(id);
        setDeleteConfirm(null);
        loadReels();
      } catch {
        alert('Failed to delete');
      }
    }
  };

  const canDelete = (reel) => {
    const isAdmin = user?.role === 'admin' || user?.email === 'aviindo863@gmail.com';
    return isAdmin || reel.uploaded_by === user?.uid;
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
                 <div style={{ position: 'absolute', left: 15, bottom: 80, zIndex: 10, maxWidth: '70%' }}>
                    <div style={{ fontWeight: 900, color: '#fff', fontSize: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>@{reel.userName?.toUpperCase() || 'FAMILY'}</div>
                    <div style={{ color: '#fff', fontSize: '0.85rem', marginTop: 5, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{reel.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', marginTop: 4, fontWeight: 700 }}>📍 {reel.location}</div>
                    {canDelete(reel) && (
                      <button onClick={() => setDeleteConfirm(reel.id)} style={{ background: 'rgba(255,59,48,0.2)', border: '1px solid rgba(255,59,48,0.4)', color: '#FF3B30', padding: '4px 12px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, marginTop: 8, cursor: 'pointer' }}>
                        DELETE
                      </button>
                    )}
                 </div>
              </div>
            ))}
         </div>
       )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: 24, maxWidth: 300, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Delete this reel?</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--primary-pink)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
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
