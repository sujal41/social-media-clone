const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  name: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  profilePicture: { type: String }, // URL or file path
  bio: { type: String },
  isPrivate: { type: Boolean, default: false },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
