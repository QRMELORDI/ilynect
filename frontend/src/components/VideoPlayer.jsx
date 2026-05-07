import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { getWatchPosition, saveWatchPosition, getComments, addComment, deleteComment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EMOJIS = ['❤️', '🔥', '👏', '😂', '😍', '😮', '😢', '💯', '🙌', '🎉', '🌟', '✨'];

const VideoPlayer = forwardRef(function VideoPlayer({ video, onClose }, ref) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const controlsTimeout = useRef();
  const { user } = useAuth();

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause()
  }));

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    
    const savedPosition = getWatchPosition(video.id, user?.uid);
    savedPosition.then(pos => {
      if (pos > 0 && videoRef.current) {
        videoRef.current.currentTime = pos;
      }
    }).catch(() => {});

    loadComments();

    return () => {
      if (videoRef.current && currentTime > 0) {
        saveWatchPosition(video.id, user?.uid, currentTime).catch(() => {});
      }
    };
  }, [video?.id]);

  const loadComments = async () => {
    try {
      const data = await getComments(video.id);
      setComments(data || []);
    } catch {}
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      const res = await addComment(video.id, user.id, user.name, commentText);
      if (res.success) {
        setComments(prev => [res.comment, ...prev]);
        setCommentText('');
      }
    } catch (err) {
      alert('Failed to post comment');
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await deleteComment(commentId, user.id);
        setComments(prev => prev.filter(c => c.id !== commentId));
      } catch {}
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 6000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s'
      }}>
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        
        <div style={{
          flex: 1,
          textAlign: 'center',
          margin: '0 20px'
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {video?.title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowComments(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14l4-4h14zM18 7v2H6V7h12zm-4 4H6V9h8v2zm2 4H6v-2h10v2z"/>
            </svg>
          </button>

          <button
            onClick={handleFullscreen}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              {fullscreen ? (
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              ) : (
                <path d="M7 14H5v5h5v-2H7v-3zm12-7h-2v5h5V8h-3v-2zM5 10h2v3h3V8H5v2zm0 5h2v2h3v-2H5v2z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div 
        onClick={handlePlayPause}
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {!playing && (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 4 }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
      </div>

      <div 
        style={{
          position: 'absolute',
          bottom: 40,
          left: 16,
          right: 16,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      >
        <div 
          onClick={handleSeek}
          style={{
            height: 5,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 3,
            cursor: 'pointer',
            marginBottom: 16,
            position: 'relative'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${buffered}%`,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 3
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'var(--apple-blue)',
            borderRadius: 3
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handlePlayPause}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, minWidth: 45 }}>
            {formatTime(currentTime)}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: 60,
                accentColor: '#fff'
              }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, minWidth: 45, textAlign: 'right' }}>
            {formatTime(duration)}
          </div>
        </div>
      </div>

      <video
        ref={videoRef}
        src={video?.streamUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          background: '#000'
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        playsInline
      />

      {/* Comments Sidebar/Drawer */}
      {showComments && (
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 100, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            justifyContent: 'flex-end' 
          }} 
          onClick={() => setShowComments(false)}
        >
          <div 
            style={{ 
              width: '100%', 
              maxWidth: 400, 
              background: 'var(--apple-bg-secondary)', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              animation: 'slideInRight 0.3s ease'
            }} 
            onClick={e => e.stopPropagation()}
          >
             <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>COMMENTS</span>
                <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', color: 'var(--apple-blue)', fontWeight: 800 }}>CLOSE</button>
             </div>

             <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, opacity: 0.5, color: '#fff' }}>No comments yet.</div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                       <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--apple-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: '#fff' }}>
                          {c.user_name?.[0]?.toUpperCase()}
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.7, marginBottom: 2, color: '#fff' }}>{c.user_name}</div>
                          <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.4 }}>{c.text}</div>
                       </div>
                       {(c.user_id === user?.id || user?.role === 'admin') && (
                         <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: 'var(--apple-red)', fontSize: '0.7rem', fontWeight: 800 }}>DEL</button>
                       )}
                    </div>
                  ))
                )}
             </div>

             <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 15, overflowX: 'auto', paddingBottom: 5 }}>
                   {EMOJIS.map(e => (
                     <span key={e} onClick={() => setCommentText(prev => prev + e)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>{e}</span>
                   ))}
                </div>
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 10 }}>
                   <input 
                     className="input" 
                     placeholder="Add a comment..." 
                     value={commentText}
                     onChange={e => setCommentText(e.target.value)}
                     style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}
                   />
                   <button className="btn btn-primary" type="submit" disabled={!commentText.trim() || sendingComment}>
                      SEND
                   </button>
                </form>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
});

export default VideoPlayer;