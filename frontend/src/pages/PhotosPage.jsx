import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotos, getPhotoUrl, recordPhotoDownload, deletePhoto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PhotosPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const navigate = useNavigate();

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
    if (!isAdmin && photo.uploaded_by !== user?.uid) {
      alert('Access Denied: You can only delete your own uploads.');
      return;
    }
    if (window.confirm('Delete this photo?')) {
      try {
        await deletePhoto(photo.id);
        setLightbox(null);
        loadPhotos();
      } catch {}
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--royal-purple)' }}>GALLERY</h1>
          <button 
            className="nav-icon-btn" 
            onClick={() => navigate('/upload?type=photo')}
            style={{ width: 'auto', padding: '0 15px', borderRadius: 12 }}
          >
            ADD
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
        ) : photos.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 24 }}>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-muted)' }}>NO PHOTOS YET</div>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map(photo => (
              <div key={photo.id} className="photo-item" onClick={() => setLightbox(photo)}>
                <img src={photo.photoUrl} alt={photo.title} loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" style={{
           position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 3000,
           display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setLightbox(null)}>
          <button style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: '2rem' }} onClick={() => setLightbox(null)}>✕</button>
          <img
            src={lightbox.photoUrl}
            alt={lightbox.title}
            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          />
          <div style={{ color: '#fff', fontSize: '0.9rem', marginTop: 20, textAlign: 'center', fontWeight: 800 }}>
            {lightbox.title.toUpperCase()}
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 5 }}>BY {lightbox.userName?.toUpperCase()}</div>
          </div>
          
          <div style={{ display: 'flex', gap: 15, marginTop: 25 }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-primary" onClick={() => handleDownload(lightbox)}>
              DOWNLOAD
            </button>
            {(lightbox.uploaded_by === user?.uid || user?.role === 'admin' || user?.email === 'aviindo863@gmail.com') && (
              <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--primary-pink)' }} onClick={() => handleDelete(lightbox)}>
                DELETE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
