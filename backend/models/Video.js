const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Movies' },
  sub_type: { type: String, default: 'movie' }, // movie, photo, reels
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  filename: { type: String },
  fileId: { type: String }, // Drive ID or GridFS ID
  previewUrl: { type: String },
  downloadUrl: { type: String },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  location: { type: String, default: 'Unknown' },
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);
