import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideos, recordVideoDownload, recordView, deleteVideo } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import ContentActionModal from '../components/ContentActionModal';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { key: 'All', label: 'All', color: '#7B2FFF' },
  { key: 'Movies', label: 'Movies', color: '#E53170' },
  { key: 'Series', label: 'Series', color: '#4CC9F0' },
  { key: 'Kids', label: 'Kids', color: '#FFD700' },
  { key: 'New', label: 'New', color: '#06D6A0' },
];

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef();

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sub_type: 'movie' };
      if (category !== 'All') params.category = category;
      if (searchQuery) params.search = searchQuery;
      const data = await getVideos(params);
      setVideos(data || []);
    } catch (err) {
      console.error('Load videos error:', err);
    }
    setLoading(false);
  }, [category, searchQuery]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadVideos();
  };

  const handleWatch = async (item) => {
    try {
      await recordView(item.id, user?.uid, user?.name || user?.displayName);
    } catch {}
    setPlaying(item);
  };

  const handleDownload = async (item) => {
    try {
      await recordVideoDownload(item.id, user?.uid, user?.name || user?.displayName);
    } catch {}
    const url = item.downloadUrl || item.streamUrl;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = item.title || 'video.mp4';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this?')) {
      try {
        await deleteVideo(id);
        loadVideos();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Watch "${item.title}" on ILYNECT Family`,
        url: item.streamUrl,
      });
    } else {
      navigator.clipboard.writeText(item.streamUrl);
      alert('Link copied to clipboard!');
    }
  };

  const filteredVideos = searchQuery 
    ? videos.filter(v => v.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : videos;

  const isAdmin = user?.role === 'admin' || user?.email === 'aviindo863@gmail.com';
  const canDelete = (video) => isAdmin || video.uploaded_by === user?.uid;

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', paddingBottom: 100 }}>
      {playing && (
        <VideoPlayer 
          video={playing} 
          onClose={() => { setPlaying(null); loadVideos(); }} 
        />
      )}
      
      {selectedItem && (
        <ContentActionModal 
          item={selectedItem} 
          onWatch={handleWatch} 
          onDownload={handleDownload}
          onShare={() => handleShare(selectedItem)}
          onDelete={canDelete(selectedItem) ? () => handleDelete(selectedItem.id) : null}
          onClose={() => setSelectedItem(null)} 
        />
      )}

      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          paddingTop: 16
        }}>
          <div>
            <h1 className="royal-purple-wave" style={{ fontSize: '1.8rem', marginBottom: 4 }}>
              FAMILY CINEMA
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>
              {filteredVideos.length} VIDEOS
            </div>
          </div>
          <button 
            className="btn btn-purple"
            style={{ fontSize: '0.8rem', padding: '10px 18px' }}
            onClick={() => navigate('/upload?type=movie')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            ADD
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <div style={{ 
            position: 'relative',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-glass)'
          }}>
            <svg 
              width="20" height="20" viewBox="0 0 24 24" 
              fill="var(--text-muted)"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '14px 14px 14px 46px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); loadVideos(); }}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>
        </form>

        <div className="tabs" style={{ marginBottom: 24, overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`tab ${category === cat.key ? 'active' : ''}`}
              style={category === cat.key ? { background: cat.color } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="glass-elevated" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 28 }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎬</div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10 }}>
              NO MOVIES FOUND
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24, fontWeight: 600 }}>
              {searchQuery ? 'Try a different search' : 'Be the first to share a family movie!'}
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/upload?type=movie')}
            >
              UPLOAD NOW
            </button>
          </div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="video-card animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedItem(video)}
              >
                <div className="video-card-thumb">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} />
                  ) : (
                    <video 
                      src={video.streamUrl} 
                      muted 
                      preload="metadata"
                      poster=""
                    />
                  )}
                  <div className="play-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  {video.duration_sec > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.7)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {Math.floor(video.duration_sec / 60)}:{String(Math.floor(video.duration_sec % 60)).padStart(2, '0')}
                    </div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ 
                    fontWeight: 800, 
                    fontSize: '0.9rem', 
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {video.title}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    color: 'var(--text-muted)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700 
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      {video.uploader_name?.toUpperCase() || 'FAMILY'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      {video.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}