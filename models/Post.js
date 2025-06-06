const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String },
  media: [{ type: String }], // URLs or file paths for images/videos
  hashtags: [{ type: String }],
  
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
