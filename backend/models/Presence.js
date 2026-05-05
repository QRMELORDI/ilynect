const mongoose = require('mongoose');

const PresenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  userName: { type: String },
  status: { type: String, default: 'online' },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Presence', PresenceSchema);
