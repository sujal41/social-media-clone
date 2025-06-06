const express = require('express');
const cors = require('cors');
const { authenticateToken } = require('../utils/authMiddleware');
const { updateEmail , updateName , updateUsername, updateProfilePicture, uploadPost } = require('../controllers/userController');
const uploadProfilePictureMulter = require('../utils/multerConfig');
const uploadPostMulter = require('../utils/postsMulterConfig');

const router = express.Router();
router.use(cors());

// for updating user profile
router.patch('/email' , authenticateToken , updateEmail);

// update name
router.patch('/name' , authenticateToken , updateName);

// update the main username
router.patch( '/username' ,authenticateToken , updateUsername );

// updating the profile picture
router.patch( '/profile-picture' , authenticateToken , uploadProfilePictureMulter.single('profile-picture') , updateProfilePicture);

// for posting a post
router.post( '/post' , authenticateToken ,  uploadPostMulter.array('post-media', 5) , uploadPost);

module.exports = router;