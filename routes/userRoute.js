const express = require('express');
const cors = require('cors');
const { authenticateToken } = require('../utils/authMiddleware');
const { updateEmail , updateName , updateUsername, updateProfilePicture } = require('../controllers/userController');
const upload = require('../utils/multerConfig');

const router = express.Router();
router.use(cors());

// for updating user profile
router.patch('/email' , authenticateToken , updateEmail);

// update name
router.patch('/name' , authenticateToken , updateName);

// update the main username
router.patch( '/username' ,authenticateToken , updateUsername );

// updating the profile picture
router.patch( '/profile-picture' , authenticateToken , upload.single('profile-picture') , updateProfilePicture)

module.exports = router;