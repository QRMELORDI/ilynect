import React, { useState, useEffect } from 'react';
import { getVideos, recordDownload } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isNativePlatform } from '../utils/platform';
import VideoPlayer from '../components/VideoPlayer';

export default function DownloadsPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getVideos();
        setAllVideos(data || []);
      } catch (err) {
        console.error('Load error:', err);
      }
      const saved = localStorage.getItem('ilynect_download_queue');
      if (saved) try { setQueue(JSON.parse(saved)); } catch {}
      setLoading(false);
    })();
  }, []);

const handleDownload = async (video) => {
    const entry = { video, progress: 0, status: 'downloading' };
    setQueue(q => {
      const next = [entry, ...q.filter(x => x.video.id !== video.id)];
      localStorage.setItem('onv_download_queue', JSON.stringify(next));
      return next;
    });
    await recordDownload(video.id, user?.id, user?.name);

    // Use Capacitor Filesystem for native platforms (Android)
    if (isNativePlatform()) {
      try {
        // Download file as blob first
        const response = await fetch(video.downloadUrl, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ilynect_token') || ''}` }
        });
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = reader.result.split(',')[1];
          const fileName = video.original_name || video.title || `video_${video.id}`;
          
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Downloads  // Saves to device Downloads folder
            });
            
            setQueue(q => {
              const next = q.map(x => x.video.id === video.id ? { ...x, progress: 100, status: 'done' } : x);
              localStorage.setItem('onv_download_queue', JSON.stringify(next));
              return next;
            });
            alert(`Video saved to Downloads folder: ${fileName}`);
          } catch (e) {
            console.error('Filesystem write error:', e);
            setQueue(q => {
              const next = q.map(x => x.video.id === video.id ? { ...x, status: 'error' } : x);
              localStorage.setItem('onv_download_queue', JSON.stringify(next));
              return next;
            });
          }
        };
      } catch (err) {
        console.error('Download error:', err);
        setQueue(q => {
          const next = q.map(x => x.video.id === video.id ? { ...x, status: 'error' } : x);
          localStorage.setItem('onv_download_queue', JSON.stringify(next));
          return next;
        });
      }
    } else {
      // Web fallback - use blob download
      const xhr = new XMLHttpRequest();
      xhr.open('GET', video.downloadUrl);
      const token = localStorage.getItem('ilynect_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.responseType = 'blob';

      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setQueue(q => {
            const next = q.map(x => x.video.id === video.id ? { ...x, progress } : x);
            localStorage.setItem('onv_download_queue', JSON.stringify(next));
            return next;
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = video.original_name || video.title || 'download';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setQueue(q => {
            const next = q.map(x => x.video.id === video.id ? { ...x, progress: 100, status: 'done' } : x);
            localStorage.setItem('onv_download_queue', JSON.stringify(next));
            return next;
          });
        } else {
          setQueue(q => {
            const next = q.map(x => x.video.id === video.id ? { ...x, status: 'error' } : x);
            localStorage.setItem('onv_download_queue', JSON.stringify(next));
            return next;
          });
        }
      };

      xhr.onerror = () => {
        setQueue(q => {
          const next = q.map(x => x.video.id === video.id ? { ...x, status: 'error' } : x);
          localStorage.setItem('onv_download_queue', JSON.stringify(next));
          return next;
        });
      };

      xhr.send();
    }
  };

  const removeFromQueue = (id) => {
    setQueue(q => { 
      const next = q.filter(x => x.video.id !== id); 
      localStorage.setItem('ilynect_download_queue', JSON.stringify(next)); 
      return next; 
    });
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)' }}>
      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} />}
      <div className="container" style={{ maxWidth: 600, paddingTop: 20 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="royal-purple-wave" style={{ fontSize: '1.6rem', marginBottom: 4 }}>
            DOWNLOADS
          </h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>
            SAVE VIDEOS FOR OFFLINE
          </div>
        </div>

        {queue.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 12, letterSpacing: 1, color: 'var(--text-muted)' }}>
              📥 DOWNLOAD QUEUE
            </h2>
            <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
              {queue.map(({ video, status }, i) => (
                <div 
                  key={video.id} 
                  className="list-item"
                  style={{ borderBottom: i < queue.length - 1 ? '1px solid var(--border-glass)' : 'none' }}
                >
                  <div style={{ 
                    width: 40, height: 40, 
                    background: status === 'done' ? 'linear-gradient(135deg, var(--mint), #22C55E)' : 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))',
                    borderRadius: 10, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {status === 'done' ? '✓' : '⬇'}
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">{video.title}</div>
                    <div className="list-item-sub">
                      {status === 'done' ? 'Saved to device' : 'Downloading...'}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromQueue(video.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 8
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 12, letterSpacing: 1, color: 'var(--text-muted)' }}>
            🎬 AVAILABLE VIDEOS
          </h2>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : allVideos.length === 0 ? (
            <div className="glass-elevated" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>NO VIDEOS YET</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Upload videos to share with family
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allVideos.map(video => (
                <div 
                  key={video.id}
                  className="glass"
                  style={{ 
                    padding: 14, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 14,
                    borderRadius: 16,
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ 
                    width: 60, height: 44, 
                    background: '#000',
                    borderRadius: 8, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '🎬'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: '0.9rem', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      marginBottom: 4
                    }}>
                      {video.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {video.category} • {video.views || 0} views • by {video.uploader_name || 'Family'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '10px 14px', fontSize: '0.75rem' }}
                      onClick={() => setPlaying(video)}
                    >
                      ▶ WATCH
                    </button>
                    <button 
                      className="download-btn"
                      style={{ padding: '10px 14px', fontSize: '0.75rem' }}
                      onClick={() => handleDownload(video)}
                    >
                      ⬇
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}