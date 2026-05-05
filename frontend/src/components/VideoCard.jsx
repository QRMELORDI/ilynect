import React from 'react';
import { getVideoUrl } from '../services/api';

export default function VideoCard({ video, onClick }) {
  return (
    <div className="video-card" onClick={onClick}>
      <img 
        src={getVideoUrl(video.filename)} 
        alt={video.title} 
        className="card-img"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format';
        }}
      />
      <div className="card-info">
        <h3 className="card-title">{video.title}</h3>
        <div className="card-meta">
          <span>{video.duration || '2గం 15ని'}</span>
          <span>{video.views} వీక్షణలు</span>
          <span className="match">98% మ్యాచ్</span>
        </div>
      </div>
    </div>
  );
}
