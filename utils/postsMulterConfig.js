const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user._id;
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'posts', userId.toString());
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.user._id;
    // getting extension name from original uploaded file
    const ext = path.extname(file.originalname);
    // giving a unique name to file followed by its original extension name
    const uniqueName = `post_${userId}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/jpg',
    'video/mp4', 'video/mpeg', 'video/quicktime'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos (MP4, MPEG, MOV) are allowed'), false);
  }
};

const uploadPostMedia = multer({ storage, fileFilter });

module.exports = uploadPostMedia;
