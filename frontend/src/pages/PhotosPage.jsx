import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotos, recordPhotoDownload, deletePhoto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PhotosPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const navigate = useNavigate();

  // Swipe logic
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    try {
      const data = await getPhotos();
      setPhotos(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (currentIndex < photos.length - 1) {
      setAnimateDirection('right');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnimateDirection('');
      }, 50);
    }
  }, [currentIndex, photos]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      setAnimateDirection('left');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setAnimateDirection('');
      }, 50);
    }
  }, [currentIndex]);

  const [animateDirection, setAnimateDirection] = useState('');

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 70;
    const isRightSwipe = distance < -70;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const handleDownload = (photo) => {
    recordPhotoDownload(photo.id);
    const a = document.createElement('a');
    a.href = photo.downloadUrl || photo.photoUrl;
    a.download = photo.title || 'photo';
    a.target = '_blank';
    a.click();
  };

  const handleDelete = async (photo) => {
    const isAdmin = user?.role === 'admin' || user?.email === 'aviindo863@gmail.com';
    if (!isAdmin && photo.uploaded_by !== user?.id) {
      alert('Access Denied: You can only delete your own uploads.');
      return;
    }
    if (window.confirm('Delete this photo?')) {
      try {
        await deletePhoto(photo.id);
        setCurrentIndex(-1);
        loadPhotos();
      } catch {}
    }
  };

  const currentPhoto = currentIndex >= 0 ? photos[currentIndex] : null;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title">PHOTOS</h1>
          <button 
            className="nav-icon-btn" 
            onClick={() => navigate('/upload?type=photo')}
            style={{ width: 'auto', padding: '0 15px', borderRadius: 12, height: 34 }}
          >
            ADD
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📸</div>
            <div className="empty-state-title">NO PHOTOS YET</div>
          </div>
        ) : (
          <div className="photo-gallery">
            {photos.map((photo, index) => (
              <div key={photo.id} className="gallery-item" onClick={() => setCurrentIndex(index)}>
                <img src={photo.photoUrl} alt={photo.title} loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {currentPhoto && (
        <div 
          className="lightbox" 
          onClick={() => setCurrentIndex(-1)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button className="lightbox-close" onClick={() => setCurrentIndex(-1)}>✕</button>
          
          {currentIndex > 0 && (
            <button className="lightbox-nav lightbox-prev" onClick={handlePrev}>‹</button>
          )}
          {currentIndex < photos.length - 1 && (
            <button className="lightbox-nav lightbox-next" onClick={handleNext}>›</button>
          )}

          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img
              src={currentPhoto.photoUrl}
              alt={currentPhoto.title}
              className={`lightbox-image ${animateDirection ? 'slide-' + animateDirection : ''}`}
              style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
            />
            
            <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 5 }}>{currentPhoto.title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>BY {currentPhoto.userName}</div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => handleDownload(currentPhoto)}>
                  DOWNLOAD
                </button>
                {(currentPhoto.uploaded_by === user?.id || user?.role === 'admin') && (
                  <button className="btn btn-secondary" style={{ color: 'var(--apple-pink)' }} onClick={() => handleDelete(currentPhoto)}>
                    DELETE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
