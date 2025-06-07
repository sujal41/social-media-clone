const express = require('express');
const cors = require('cors');
const { authenticateToken } = require('../utils/authMiddleware');
const { updateEmail , updateName , updateUsername, 
        updateProfilePicture, uploadPost, changeAccountType, 
        searchUsers , getProfileDetails , bookmarkPost ,
        searchPostsByHashtag , likeOrUnlikePost ,
        addComment , replyToComment , followUnfollowUser ,
        getFollowersAndFollowing
    } = require('../controllers/userController');
const uploadProfilePictureMulter = require('../utils/multerConfig');

const uploadPostMulter = require('../utils/postsMulterConfig');

const router = express.Router();
router.use(cors());

//=============routes for making changes in user's own profile==========
// for updating user profile
router.patch('/email' , authenticateToken , updateEmail);

// update name
router.patch('/name' , authenticateToken , updateName);

// update the main username
router.patch( '/username' ,authenticateToken , updateUsername );

// updating the profile picture
router.patch( '/profile-picture' , authenticateToken , uploadProfilePictureMulter.single('profile-picture') , updateProfilePicture);

// make account private
router.patch( '/account-type/:type' , authenticateToken ,  changeAccountType);
//=====================================================

// for user for posting a post
router.post( '/post' , authenticateToken ,  uploadPostMulter.array('post-media', 5) , uploadPost);

// view profile
router.get( '/view-profile/:username' , authenticateToken , getProfileDetails);

// search a user
router.get( '/search/:query' , authenticateToken , searchUsers );

// search using hashtag
// please remove # from the tag before making any request example 
// http://localhost:3001/search-hashtag/goku, this will search for #goku
router.get( '/search-hashtag/:hashtag' , authenticateToken , searchPostsByHashtag );



// ==================user interation with posts ==================================

// boook marking a post
router.patch( '/bookmark' , authenticateToken , bookmarkPost);

// like or unlike post
router.patch( '/like/:postId' , authenticateToken , likeOrUnlikePost );

// adding a comment by user
router.post('/comment/:postId', authenticateToken , addComment);

// replying on a comment 
router.post('/comment/reply/:commentId', authenticateToken, replyToComment);

// ==============================================================

//==================== user interation with profile ========================
// for follow or unfollow
router.patch('/follow/:userId', authenticateToken, followUnfollowUser);

// for to get  folloing and followers list
router.post('/followers-following/', authenticateToken, getFollowersAndFollowing);


//=================================================================



module.exports = router;