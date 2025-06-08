const userService = require("../service/userService")
const path = require('path');

// update mail of the current user
async function updateEmail( req , res){
    try {
        // extracting user id from token
        // this id will prevent another user changing details of another user
        const userId = req.user._id;
        const { newEmail } = req.body;

        if( !userId ){
            return res.status(400).json({ message: "token is not valis , please logout and login again" });
        }

        if( !newEmail ){
            return res.status(400).json({ message: "newEmail is required" });        
        }

        // checking for valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(newEmail);
        if( !isValidEmail ){
            return res.status(400).json({
                value: false ,
                message: "Invalid Email"
            });
        }

        const response = await userService.updateEmail( userId , newEmail);
        return res.status(response.statusCode).json(response);

    } catch (error) {
        console.error("error: " , error)
        return res.status(500).json({ message: "Internal server error during updating email" });        
    }   
}

// update name of the current user
async function updateName( req , res){
    try {
        // extracting user id from token
        // this id will prevent another user changing details of another user
        const userId = req.user._id;
        const { newName } = req.body;
        
        
        if( !userId ){
            return res.status(400).json({ message: "token is not valis , please logout and login again" });
        }

        if ( !newName){
            return res.status(401).json( { message: "new newName is required" } );
        }

        const response = await userService.updateName( userId , newName );
        
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.error("error: " , error)
        return res.status(500).json({ message: "Internal server error during updating userName" });        
    }
}


// update username of the current user
async function updateUsername( req , res){
    try {
        // extracting user id from token
        // this id will prevent another user changing details of another user
        const userId = req.user._id;
        const { newUsername } = req.body;
        
        
        if( !userId ){
            return res.status(400).json({ message: "token is not valid , please logout and login again" });
        }

        if ( !newUsername ){
            return res.status(401).json( { message: "new newUsername is required" } );
        }

        const response = await userService.updateUsername( userId , newUsername , userId );
        
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.error("error: " , error)
        return res.status(500).json({ message: "Internal server error during updating newUsername" });        
    }
}

// update profile picture of the current user
async function updateProfilePicture( req , res) {
    try {
        if( !req.file ){
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const response = await userService.updateProfilePicture( req.user._id , req.file.path );
        console.log("this reponse" , response);
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.log("Error while updating profile picture: ", error);
        return res.status(500).json({ message: "Internal server error during updating profile picture" });        
    }
}

// change account type of the current user
async function changeAccountType( req , res ) {
    try {
        const userId = req.user._id;
        const type = req.params.type;

        if( !userId ){
            return res.status(403).json(  { message: "token is invalid"} );
        }

        const validAccountTypes = [ "private" , "public" ];
        if( !validAccountTypes.includes(type) ){
            return res.status(400).json(  { message: "type of account to change is required in url ( private / public ) !"} );
        }

        // valid type options are public/private
        if( type !== "public" && type !== "private"){
            console.log("given account type:" , type);
            return res.status(400).json(  { message: " requested change of account type should be private / public only !"} );
        }

        console.log("before passing : ", userId);
        const response = await userService.changeAccountType( type , userId );
        console.log("this reponse" , response);
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.log("Error while updating account type: ", error);
        return res.status(500).json({ message: "Internal server error during updating  account type" });        
    }
}

// upload a post by the current user to his profile
async function uploadPost( req , res ) {
    try {
        let { caption } = req.body || "" ;
        const files = req.files;
        console.log("total files got to upload with post : ",files.length);
        const userId = req.user._id;  // extracting id from token to effienctly save posts

        if( !caption ){
            caption = "";  // because caption can be empty
        }

        if( !files || files.length === 0){
            return res.status(400).json({ message: "No post-media files uploaded" });
        }
        
        if( files.length > 5){
            return res.status(400).json({ message: "upto 5 post-media allowed ! , post not uploaded" });
        }


        // On Windows, file paths often contain backslashes (\) — e.g., C:\Users\sujal\...\\social-media-clone\\public\\uploads\\posts\\userid\\image.jpg
        // In URLs and most JS environments, forward slashes (/) are expected — e.g., uploads/user/abc.jpg.
        const media = await files.map(file => file.path.replace(/\\/g, '/'));

        // extract hashtags from caption
        const hashtags = caption.match(/#\w+/g) || [];


        const result = await userService.uploadPost(
            userId,
            caption,
            media,  // because upload function has media as a parameter , hence to prevent reference error 
            hashtags
        );

        return res.status(result.statusCode).json({ message: result.message });
    } catch (error) {
        console.error('Create Post Error:', error);
        return res.status(500).json({ message: 'Failed to create post' });
    }
}


// search users
async function searchUsers( req , res ) {
    try {
        const currentUserId = req.user._id;  // get id from token
        const query = req.params.query;

        if( !currentUserId ){
            return res.status(403).json(  { message: "your token is invalid"} );
        }

        if( !query ){
            return res.status(400).json({ message: 'No search query given ! (give query)' });
        }        

        // handle case-senstive query
        const regexQuery = new RegExp(query, "i");

        const response = await userService.searchUsers( req , regexQuery ,currentUserId );
        return res.status( response.statusCode ).json( response );
        

    } catch (error) {
        console.log("Error while searching users: ", error);
        return res.status(500).json({ message: "Internal server error during searching users" });        
    }
}

// get profile details of a specific user
async function getProfileDetails( req , res) {
    try {
        const currentUser = req.user._id;
        let username = req.params.username;
        console.log("username in ",username);

        if(!username){
            return res.status(400).json({ message: 'No username given ! (give username in url)' });
        }

        // handle case-senstive username
        username = new RegExp( username, "i");

        const response = await userService.getProfileDetails( req , username , currentUser );
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.log("Error while retriving user profile ", error);
        return res.status(500).json({ message: "Internal server error during retriving user profile" });        
    }
}

// bookmark / save a post to user profile
async function bookmarkPost( req , res ) {
    try {
        const userId = req.user._id; // save user id from token
        const { _id } = req.body; // from body

        
        if( !userId ){
            return res.status(403).json(  { message: "your token is invalid"} );
        }

        if(!_id){
            return res.status(400).json({ message: 'No Post requested to save ! (give _id of post in body)' });
        }

        const response = await userService.bookmarkPost( userId , _id );
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.log("Error while saving post ", error);
        return res.status(500).json({ message: "Internal server error during saving post" });        
    }
}


// search posts by using a hashtag
async function searchPostsByHashtag( req , res ) {
    try {
        // const { userId } = req.user._id;
        const hashtag = req.params.hashtag;

        // console.log("userid : " , userId);
        // if( !userId ){
        //     return res.status(403).json(  { message: "your token is invalid"} );
        // }

        if( !hashtag ){
            return res.status(403).json(  { message: "please give one /hashtag name in url"} );
        }

        const response = await userService.searchPostsByHashtag( hashtag );
        return res.status( response.statusCode ).json( response );        


    } catch (error) {
        console.log("Error while saving post ", error);
        return res.status(500).json({ message: "Internal server error during saving post" });        
    }
}

// like or unlike a post
async function likeOrUnlikePost( req , res) {
    try {
        const { postId } = req.params;
        const userId = req.user.id;  

        if( !postId ){
            return res.status(403).json(  { message: "please give postId in url"} );
        }

        const response = await userService.likeOrUnlikePost( userId , postId );
        return res.status( response.statusCode ).json( response );        

    } catch (error) {
        console.log("Error while liking/unliking post ", error);
        return res.status(500).json({ message: "Internal server error during liking/unliking post" });        
    }
}


// comment on a post
async function addComment( req , res ) {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id;

        if( !postId ){
            return res.status(403).json(  { message: "please give postId in url"} );
        }

        if( !comment ){
            return res.status(403).json(  { message: "comment can't be empty"} );
        }

        const response = await userService.addComment( userId , postId , comment );
        return res.status( response.statusCode ).json( response );        

    } catch (error) {
        console.log("Error while commengitn on post ", error);
        return res.status(500).json({ message: "Internal server error during comming on post" });        
    }
}

// reply to a comment on a post
async function replyToComment( req , res ) {
    try {
        const { commentId } = req.params;
        const { reply } = req.body;
        const userId = req.user._id;

        if( !commentId ){
            return res.status(403).json(  { message: "please give commentId in url !"} );
        }

        if( !reply ){
            return res.status(403).json(  { message: "reply on comment can't be empty !"} );
        }

        const response = await userService.replyToComment( userId , commentId, reply );
        return res.status( response.statusCode ).json( response );        

    } catch (error) {
        console.log("Error while replying on comment ", error);
        return res.status(500).json({ message: "Internal server error during replying on comment" });        
    }
}



// follow or unfollow a user
async function followUnfollowUser( req , res ) {
    try {
        const currentUserId = req.user._id; // from token
        const targetUserId = req.params.userId;  // from url we get this

        if( !targetUserId ){
            return res.status(403).json(  { message: "please give target user id in url !"} );
        }

        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }


        const response = await userService.followUnfollowUser( currentUserId ,  targetUserId );
        return res.status( response.statusCode ).json( response );        

        
        
    } catch (error) {
        console.log("Error while following/unfollowing user ", error);
        return res.status(500).json({ message: "Internal server error during following/unfollowing user" });        
    }
}



// get following and followers lists of a user
async function getFollowersAndFollowing( req , res ) {
    try {

        const { targetUserId } = req.body;
        const userId = req.user._id; // the user who is making this request

        console.log("this",targetUserId);

        if( !targetUserId ){
            return res.status(403).json(  { message: "please provide targetUserId in body to get its follower/following list"} );
            // return res.status(403).json(  { message: "please provide user id in url to get its follower/following list"} );
        }
        
        const response = await userService.getFollowersAndFollowing( req , userId , targetUserId );
        return res.status( response.statusCode ).json( response );        


    } catch (error) {
        console.log("Error while getting following / followers list ", error);
        return res.status(500).json({ message: "Internal server error while getting following / followers list" });        
    }
}

module.exports = { 
    updateEmail , updateName , 
    updateUsername , updateProfilePicture ,
    changeAccountType , uploadPost ,
    searchUsers , searchPostsByHashtag ,
    getProfileDetails , bookmarkPost ,
    likeOrUnlikePost , addComment ,
    replyToComment , followUnfollowUser ,
    getFollowersAndFollowing
};