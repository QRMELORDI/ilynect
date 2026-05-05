import React, { useState } from 'react';
import { updateVideo } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['General','Movies','Series','Documentaries','Education','Music','Gaming','Animation','Sci-Fi'];

export default function EditModal({ video, onClose, onUpdated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [category, setCategory] = useState(video.category || 'General');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateVideo(video.id, { title, description, category, userId: user?.id, userName: user?.name });
    if (result.video) onUpdated?.(result.video);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="modal-title" style={{ margin: 0 }}>వీడియోను సవరించండి</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>శీర్షిక</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>వివరణ</label>
            <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="form-group">
            <label>వర్గం</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c === 'Movies' ? 'సినిమాలు' : c === 'Series' ? 'సిరీస్' : c === 'Education' ? 'విద్య' : c === 'Health' ? 'ఆరోగ్యం' : c}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>రద్దు</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'మార్పులను సేవ్ చేయండి'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
