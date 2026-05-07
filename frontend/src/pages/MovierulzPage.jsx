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
  const [category, setCategory] = useState('telugu-featured');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    loadMovies();
  }, [page, category]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      // Reinforce Telugu filter in search if not already present
      let query = search;
      if (query && !query.toLowerCase().includes('telugu')) {
        query += ' telugu';
      }
      const data = await getMovieRulzMovies(page, query, category);
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
    setFetchingDetails(true);
    try {
      const data = await getMovieRulzDetails(movie.link);
      if (data.success) {
        setSelectedMovie({
          ...movie,
          ...data.details
        });
      }
    } catch (err) {
      console.error('Get details error:', err);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDownload = async (link) => {
    if (!link) return;
    try {
      await recordView(selectedMovie.id, user.id, user.name);
      await recordDownload(selectedMovie.id, user.id, user.name, 'movie');
      await Browser.open({ url: link });
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleWatchTrailer = async (movie) => {
    if (!movie.trailerLink) return;
    try {
      await Browser.open({ url: movie.trailerLink });
    } catch (err) {
      console.error('Trailer error:', err);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 20 }}>MovieRulz</h1>

        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Search Telugu movies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button 
            className={`btn ${category === 'telugu-featured' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory('telugu-featured'); setPage(1); }}
            style={{ flex: 1, fontSize: '0.75rem', padding: '12px 8px' }}
          >
            TELUGU ORIGINAL
          </button>
          <button 
            className={`btn ${category === 'telugu-dubbed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory('telugu-dubbed'); setPage(1); }}
            style={{ flex: 1, fontSize: '0.75rem', padding: '12px 8px' }}
          >
            TELUGU DUBBED
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <div className="empty-state-title">NO MOVIES FOUND</div>
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map(movie => (
              <div key={movie.id} className="movie-card fade-up" onClick={() => handleMovieClick(movie)}>
                <div className="movie-poster-container">
                  <img src={movie.image} alt={movie.title} className="movie-poster" loading="lazy" />
                </div>
                <div className="movie-info">
                  <div className="movie-title">{movie.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 40, paddingBottom: 40 }}>
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>PREV</button>
          <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)}>NEXT</button>
        </div>
      </div>

      {selectedMovie && (
        <div className="lightbox" onClick={() => setSelectedMovie(null)}>
          <button className="lightbox-close" onClick={() => setSelectedMovie(null)}>✕</button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', padding: '100px 20px 40px' }}>
            <div className="container" style={{ maxWidth: 450 }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', marginBottom: 25 }}>
                <img src={selectedMovie.poster || selectedMovie.image} alt={selectedMovie.title} style={{ width: '100%', display: 'block' }} />
              </div>
              
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 10 }}>{selectedMovie.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 30 }}>
                {selectedMovie.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedMovie.trailerLink && (
                  <button 
                    className="upload-btn-3d" 
                    onClick={() => handleWatchTrailer(selectedMovie)}
                    style={{ background: 'linear-gradient(145deg, #FF3B30, #D12C26)', boxShadow: '0 6px 0 #8E1B17' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                    WATCH TRAILER
                  </button>
                )}

                {selectedMovie.easysyncrLink && (
                  <button 
                    className="upload-btn-3d" 
                    onClick={() => handleDownload(selectedMovie.easysyncrLink)}
                    style={{ background: 'linear-gradient(145deg, #0A84FF, #0071E3)', boxShadow: '0 6px 0 #0056CC' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    DIRECT DOWNLOAD
                  </button>
                )}

                {selectedMovie.magnetLinks && selectedMovie.magnetLinks.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>TORRENT LINKS</div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {selectedMovie.magnetLinks.map((m, idx) => (
                        <button 
                          key={idx}
                          className="btn btn-secondary" 
                          onClick={() => handleDownload(m.url)}
                          style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '12px 15px', borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}
                        >
                          🧲 {m.title.replace('Download ', '').substring(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedMovie.easysyncrLink && (!selectedMovie.magnetLinks || selectedMovie.magnetLinks.length === 0) && (
                  <div className="glass" style={{ padding: 20, textAlign: 'center', color: 'var(--apple-pink)', fontWeight: 800 }}>
                    NO DOWNLOAD LINKS FOUND
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {fetchingDetails && (
        <div className="lightbox" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="spinner" />
          <div style={{ marginTop: 15, fontWeight: 800, fontSize: '0.8rem', letterSpacing: 1 }}>FETCHING LINKS...</div>
        </div>
      )}
    </div>
  );
}
