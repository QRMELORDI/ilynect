import React, { useState, useEffect } from 'react';
import { getMovieRulzMovies, getMovieRulzDetails, recordDownload, recordView } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Browser } from '@capacitor/browser';

export default function MovierulzPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadMovies();
  }, [page]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovieRulzMovies(page, search);
      if (data.success) {
        setMovies(data.movies);
      }
    } catch (err) {
      console.error('Load movies error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadMovies();
  };

  const handleMovieClick = async (movie) => {
    setDownloadingId(movie.id);
    try {
      const data = await getMovieRulzDetails(movie.link);
      if (data.success && data.downloadLink) {
        // Record as view/download in our system
        await recordView(movie.id, user.id, user.name || user.displayName);
        await recordDownload(movie.id, user.id, user.name || user.displayName, 'movie');
        
        // Open the download link in the browser
        await Browser.open({ url: data.downloadLink });
      } else {
        alert('Download link not found on MovieRulz for this movie.');
      }
    } catch (err) {
      console.error('Get details error:', err);
      alert('Failed to fetch download link.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 20 }}>Browse MovieRulz</h1>

        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Search for movies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="quick-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {movies.map(movie => (
              <div 
                key={movie.id} 
                className="glass-elevated" 
                style={{ 
                  borderRadius: 16, 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => handleMovieClick(movie)}
              >
                <img 
                  src={movie.image} 
                  alt={movie.title} 
                  style={{ width: '100%', height: 200, objectFit: 'cover' }} 
                />
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>
                    {movie.title}
                  </div>
                </div>
                {downloadingId === movie.id && (
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.6)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <div className="spinner" style={{ width: 24, height: 24 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {movies.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <div className="empty-state-title">No movies found</div>
            <div className="empty-state-desc">Try searching for something else</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 30 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
