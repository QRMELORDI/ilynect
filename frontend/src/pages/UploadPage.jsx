import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { uploadVideo, uploadPhoto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { compressImage } from '../utils/image';

export default function UploadPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initType = searchParams.get('type') || 'reels';

  const [type, setType] = useState(initType);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Movies');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const isAdmin = user?.email === 'aviindo863@gmail.com' || user?.role === 'admin';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setSuccess(false);
    setError('');

    if (type === 'reels') {
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        window.URL.revokeObjectURL(vid.src);
        if (vid.duration > 65) {
          setError('Reels must be under 60 seconds!');
          setFile(null);
        }
      };
      vid.src = URL.createObjectURL(selected);
    }
  };

  const getUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Unknown Location');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`),
        () => resolve('Unknown Location'),
        { timeout: 5000 }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    if (type === 'movie' && !isAdmin) {
      setError('Only Admins can upload Movies.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      let finalFile = file;
      if (type === 'photo') {
        setUploadProgress(5); // Progress for compression
        try {
          finalFile = await compressImage(file, { maxWidth: 1200, quality: 0.7 });
          console.log(`Compressed: ${file.size} -> ${finalFile.size}`);
        } catch (compErr) {
          console.error('Compression failed, using original:', compErr);
        }
      }

      const loc = await getUserLocation();
      const uploadFn = type === 'photo' ? uploadPhoto : uploadVideo;
      const res = await uploadFn({
        file: finalFile,
        title: title || file.name,
        category,
        sub_type: type,
        userId: user.uid,
        userName: user.displayName || user.name,
        location: loc
      }, (p) => setUploadProgress(p));
      
      if (res.error) {
        setError(`Server: ${res.error}`);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Upload Error Details:', err);
      setError(`Upload failed: ${err.message || 'Check connection'}.`);
    }

    setIsUploading(false);
    if (!error) {
      setFile(null);
      setTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const typeOptions = [
    { id: 'movie', label: 'Movie', icon: <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/> },
    { id: 'reels', label: 'Reel', icon: <path d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/> },
    { id: 'photo', label: 'Photo', icon: <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 4.5H5l3.5-3z"/> },
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 500 }}>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, marginTop: 20 }}>
          {typeOptions.map(opt => {
            const isActive = type === opt.id;
            return (
            <button
              key={opt.id}
              onClick={() => { setType(opt.id); setFile(null); setError(''); setSuccess(false); }}
              style={{ 
                flex: 1, padding: '16px 8px', 
                background: isActive ? 'var(--apple-blue)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-primary)',
                border: 'none', borderRadius: '16px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">{opt.icon}</svg>
              <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>{opt.label.toUpperCase()}</div>
            </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="glass" style={{ borderRadius: '24px', padding: 24 }}>
          {type === 'movie' && !isAdmin && (
             <div style={{ color: 'var(--primary-pink)', marginBottom: 14, textAlign: 'center', fontSize: '0.85rem', fontWeight: 900 }}>
               ACCESS RESTRICTED TO ADMIN
             </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
               {type === 'movie' ? 'CHOOSE MOVIE FILE' : 'SELECT FROM GALLERY'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept={type === 'photo' ? 'image/*' : 'video/*'}
                style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', zIndex: 2 }}
              />
              <div style={{ 
                padding: '24px', border: '2px dashed var(--border)', borderRadius: '16px', 
                textAlign: 'center', color: file ? 'var(--apple-blue)' : 'var(--text-muted)',
                fontWeight: 800, background: 'rgba(255,255,255,0.02)', fontSize: '0.85rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: 10, display: 'block', margin: '0 auto 8px' }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                {file ? file.name : "BROWSE MEDIA"}
              </div>
            </div>
          </div>

          {type !== 'movie' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
                 OR CAPTURE LIVE
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: 18, background: 'linear-gradient(135deg, var(--royal-purple), var(--moody-mauve))', color: '#fff', borderRadius: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 20px rgba(123, 47, 255, 0.2)'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                OPEN CAMERA
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={type === 'photo' ? 'image/*' : 'video/*'}
                  capture="environment"
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <input
              className="input"
              placeholder="Give it a title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          
          {type === 'movie' && (
            <div style={{ marginBottom: 24 }}>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Movies">MOVIES</option>
                <option value="Kids">KIDS ZONE</option>
                <option value="New">NEW RELEASES</option>
              </select>
            </div>
          )}

          {isUploading ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
               <div className="progress-ring">
                 <svg width="80" height="80">
                   <circle className="progress-bg" cx="40" cy="40" r="34" />
                   <circle 
                     className="progress-bar" cx="40" cy="40" r="34" 
                     strokeDasharray={213.6} 
                     strokeDashoffset={213.6 - (213.6 * uploadProgress) / 100}
                   />
                 </svg>
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                   {uploadProgress}%
                 </div>
               </div>
               <div style={{ marginTop: 15, fontSize: '0.7rem', fontWeight: 900, color: 'var(--apple-blue)', letterSpacing: 2 }}>UPLOADING TO CLOUD...</div>
            </div>
          ) : (
            <button type="submit" style={{ 
              width: '100%', background: 'var(--apple-blue)', color: '#fff', border: 'none', padding: 18, borderRadius: 16, fontSize: '1rem', fontWeight: 900, cursor: 'pointer', opacity: (!!error || (type === 'movie' && !isAdmin)) ? 0.2 : 1, transition: 'all 0.3s'
            }} disabled={!!error || (type === 'movie' && !isAdmin)}>
              START UPLOAD
            </button>
          )}

          {error && <div style={{ color: 'var(--primary-pink)', marginTop: 20, textAlign: 'center', fontSize: '0.8rem', fontWeight: 900 }}>{error}</div>}
          {success && (
            <div style={{ color: 'var(--mint)', marginTop: 20, textAlign: 'center', fontSize: '0.9rem', fontWeight: 900, letterSpacing: 0.5 }}>
              UPLOAD VERIFIED & SAVED
              <div style={{ marginTop: 15 }}>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 14 }} onClick={() => navigate(type === 'reels' ? '/reels' : type === 'photo' ? '/photos' : '/videos')}>
                   VIEW NOW
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
