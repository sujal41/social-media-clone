const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const path = require('path');
const mongoose = require('mongoose');//we will use this for convering string id to object id
const { ObjectId } = require('mongoose').Types;



/**
 * Finds a user by userId and updates the email
 * 
 * @param {string} userId - The userId to find
 * @param {string} newEmail - The new email to set
 * @returns {Promise<Object>} - Status code and message
 */
async function updateEmail( userId , newEmail ) {
    try {
        
        // check if user with username exists
        const user = await User.findOne( { _id: userId } );
        if( !user ){
            return {
                statusCode: 404,
                message: "user not found"
            }
        }
        
        // don't need to implement this as we are directly extracting user id from token
        // don't let the user change another user's email
        // if( username !== user.username ){
        //     return {
        //         statusCode: 403,
        //         message: "you can't change another user's mail"
        //     }
        // }

        //checking if it is the same email 
        if( user.email === newEmail ){
            return {
                statusCode: 401,
                message: "same old email is given , email not updated"
            }
        }
        console.log( user.email, newEmail);

        //  update the email
        user.email = newEmail;
        await user.save();

        return {
            statusCode: 201,
            message: "Email Updated Successfully",
            data: {
                username: user.username,
                email: user.email
            }
        }

    } catch (error) {
        console.error("user Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal server error during updating email"
        };
    }
}


/**
 * Finds a user by userId and updates the email
 * 
 * @param {string} userId - The userId to find
 * @param {string} newName - The new name to set
 * @returns {Promise<Object>} - Status code and message
 */
async function updateName( userId , newName){
    try {
        // check if user exists
        const user = await User.findOne( { _id: userId } );
        
        if( !user ){
            return {
                statusCode: 404,
                message: "User not found to update name"
            }
        }

        // check if the name is same as the old name
        console.log("this new name:",newName , user.name);
        if( newName === user.name ){
            return {
                statusCode: 400,
                message: "the new name is same as old name , cannot be upadted"
            }
        }
    
        // update the name
        user.name = newName;
        user.save();
        
        return {
            statusCode: 201,
            message: "name updated successfully",
            name: user.name
        }

    } catch (error) {
        console.error("user Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal server error during updating name"
        };        
    }
}


/**
 * Finds a user by userId and updates the username
 * 
 * @param {string} userId - The userId to find
 * @param {string} newUsername - The new username to set
 * @returns {Promise<Object>} - Status code and message
 */
async function updateUsername( userId , newUsername , currentUserId){
    try {
        
        // check if this user exists
        
        const user = await User.findOne( { _id: userId } );
        
        if( !user ){
            return {
                statusCode: 404,
                message: "User not found to update name"
            }
        }

        // check if the username is same as the old username
        console.log("this new name:",newUsername , user.username);
        if( newUsername === user.username ){
            return {
                statusCode: 400,
                message: "the new username is same as old username , cannot be upadted"
            }
        }

        // check if the username is taken by any other user and if it is then deny
        isUsernameExists = await User.findOne({ 
            username: newUsername ,
            _id: { $ne: currentUserId } // exclude current user
        });
        console.log(newUsername , isUsernameExists);
        if( isUsernameExists ){
            return {
                statusCode: 409 ,
                message: "username already taken !"
            }
        }
    
        // update the name
        user.username = newUsername;
        await user.save();
        
        return {
            statusCode: 201,
            message: "name updated successfully",
            username: user.username
        }

    } catch (error) {
        console.error("user Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal server error during updating username"
        };        
    }
}



/**
 * Update the profile picture of the user , multer module saves the uploaded
 * picture in diskStorage i.e, public/uploads/user-profile-picture
 * and file path from request is passed to functino as parameter
 * 
 * @param {String} userId - userId to find and update the profile picture
 * @param {String} filePath - the of the file on diskStorage to save in database
 * @returns {Promise<Object>} - statuseCode and message
 */
async function updateProfilePicture( userId , filePath ) {
    try {
        const relativePath = path.relative( path.join( __dirname , '..' , 'public') , filePath);

        const updatedUser = await User.findByIdAndUpdate( userId , {
            profilePicture: relativePath,
        } )

        if( !updatedUser ){
            return {
                statusCode: 404,
                message: "user not found"
            };
        }

        return {
            statusCode: 200,
            message: 'Profile Picture Updated Successfully'
        }
    } catch (error) {
        console.error('User Profile Picture Service Error : ' , error);

        return {
            statusCode: 500,
            message: 'Internal error while updating profile picture'
        };
    }

}



/**
 * Changes account type ( public -> private , private -> public )
 * 
 * @param {String} type - type of account to change ( private / public)
 * @param {String} userId - to find user and change account type
 * @returns {Promise<Object>} - statusCode and message
 */
async function changeAccountType( type , userId ) {
    try {
        // check if it is the same account type which already is
        console.log("id: " , userId);
        const  user = await User.findOne( { _id: userId });
        // console.log("this: ",user);

        const accountType = (type === "public") ? false : true;  // if type public then make false , such that isPrivate=false

        if( !user ){
            return {
                statusCode: 404,
                message: "we are having problem to find your account..."
            }
        }
        // if the account is already the same type , means no changes
        if( accountType === user.isPrivate ){
            return {
                statusCode: 400 , 
                message: `you account is already a ${type} account`
            }
        }

        // if not same , update account type
        user.isPrivate = accountType;  // which is converted as type=public: false  , type=private: true
        await user.save();

        // as user is changeing his account type from public -> private OR private -> public
        // we shold make the posts private/publc also

        // converting userid to object id as author is saved as object in Post model
        const objectUserId = new mongoose.Types.ObjectId(userId); // Convert string to ObjectId

        await Post.updateMany(
            { author: objectUserId},
            { $set: { isPrivate: accountType } } // setting privacyy as same as account type
        )
        
        // returning the responsee
        return {
            statusCode: 201,
            message: `account type updated successfully (changed to ${type}) `
        }

    } catch (error) {
        console.error('change account type Service Error : ' , error);

        return {
            statusCode: 500,
            message: 'Internal error while updating account type'
        };
    }
}



/**
 * 
 * @param {String} userId  - to find user by id
 * @param {String} caption - to attach and save it with post
 * @param {Array} media - Array containing multiple media files path with this format : e.g., uploads/user/abc.jpg.
 * @param {Array} hashtags - Array of Hashtags with this format eg., #goku #coding
 * @returns {Promise<Object>} - statuseCode and message
 */
async function uploadPost( userId , caption , media , hashtags ){
    try {
        // userId = JSON.parse(userId);  // as we are extracting it from token so it can be in form of object and object is 
        // getting official username to attach with post as author of the post
        console.log(userId);
        const user = await User.findOne( { _id: userId } );
        console.log("post author would be :" , user.username);

        // we are not assigning username as author because the user can change his
        // username whenever he wants , and we want a static value for author
        // hence we are choosing user id
        console.log("media before saving : ",media);
        const post = new Post({
            author: user._id,
            caption: caption,
            media: media,
            hashtags: hashtags
        });

        // // await post.save();  // save is not working giving BSONerror
        // // we have to create it directly when using object like new Post()

        // check if the user account is private
        // if private then make post private also
        if( user.isPrivate ){  // true or false
            post.isPrivate = true;
        }
        await Post.create( post );

        return {
            statusCode: 201,
            message: 'Post created successfully'
        };
  } catch (error) {
        console.error('Post Service Error:', error);
        return {
            statusCode: 500,
            message: 'Error while creating post'
        };
  }
}



/**
 * Filters items that match the given case-insensitive regex.
 * @param {import('express').Request} req - Express request object.
 * @param {RegExp} regexQuery - Case-insensitive regular expression to match items.
 * @param {String} currentUserId - the user requesting the search
 * @returns {Promise<Object>} - statusCode , message and array of users , each includes username,name,bio,profilePicture
 */
async function searchUsers( req , regexQuery , currentUserId ) {
    try {
        // get only 15 users with match from database with name , username , bio , profilePicture
        // relate user search with finding related keywords in name , username , email
        // we are excluding the current user using his id from saearh
        const users = await User.find({
        $or: [
            { name: regexQuery },
            { username: regexQuery },
            { email: regexQuery }
        ],
        _id: { $ne: currentUserId }
        })
        .limit(15)
        .select("username name bio profilePicture"); // only these fields

        // replacing the profilePicture (saved as path )
        // to serve the actual serverUrl , so front-end can download the profilie picture

        // profilePicture is stored as: uploads\\user-profile-picture\\<imgename>.<extension>
        // and we will serve it as localhost:3001/profile-picture/<imgename>.<extension> , so it can be downloaded at front-end
        const downloadableProfilePicturePath = `${req.protocol}://${req.get('host')}/profile-picture/`;
        const result = users.map( user=> ({
            username: user.username,
            name: user.name,
            bio: user.bio,
            
            profilePicture: user.profilePicture 
                                ?
                                    (user.profilePicture).replace("uploads\\user-profile-picture\\" , downloadableProfilePicturePath)
                                :
                                    downloadableProfilePicturePath + "default-profile-picture.jpg"  // when no profile picture uploaded by user show default

        }))

        return {
            statusCode: 200,
            message:"found users",
            users: result    // array of users with only this fields : username name bio profilePicture
        }

    } catch (error) {
        console.error('Search Service Error:', error);
        return {
            statusCode: 500,
            message: 'Error while searching users'
        };
    }
}


/**
 * get profile details of the specified user
 * 
 * @param {import('express'.Request)} req - Express req object
 * @param {String} username - the id of user to get profile details about
 * @param {String} currentUser - the id of the user requesting the specified profile details
 * 
 * @returns {Promise<Object>} - statuseCode , message and an object containing user data based on type of privacy account
 *                              private (if not followed) : username , name , bio , profilePicture , 
 *                                                          following(count), followers(count) , posts(count)
 * 
 *                              same user , public , and private(if followed) : username , name , bio ,profilePicture , following(count), 
 *                                                                  followers(count) , posts(count), 
 *                                  
 */
async function getProfileDetails( req , username , currentUser ) {
    try {
        console.log("got this : ", username);
        const user = await User.findOne({ username });

        if (!user) {
            return {
                statusCode: 404,
                message:  'User not found' 
            };
        }


        console.log("private acc or not" , user);
        // converting currentUser id to object id to check if it is present or not in 
        // target user's followers .  ex. 874c3f2c25gf2c -> { $oid: "874c3f2c25gf2c" } 
        const currentUserObjectId = new mongoose.Types.ObjectId(currentUser); // Convert string to ObjectId

        // check if this is a private acount , if it is
        // then check if the current user is his follower or not
        // if not then only give username , name , bio , followers-following don't give posts
        if( user.isPrivate ) {  // true/false
            

            // is same private user is requesting
            
            const isSamePrivateUser = currentUser === test[0].$oid.toString();
            console.log("is same private user requesting details: ",isSamePrivateUser);

            // means this is a private account,
            // and if the current user is not the follower of this account then
            //  return only username, name , bio , followers-following (only numbers)
            
            // check if any follower { $oid: "874c3f2c25gf2c" }  === current user 874c3f2c25gf2c => true /false
            // if this private user has no followers means the current user is also not a follower 
            // this should not be the same user who's private account this is , because he should have posts details also
            console.log(user.followers , currentUserObjectId)
            if ( !isSamePrivateUser || user.followers.length == 0 || user.followers.some(follower => follower["$oid"] === currentUserObjectId)){
                
                // replacing the profilePicture (saved as path )
                // to serve the actual serverUrl , so front-end can download the profilie picture

                // profilePicture is stored as: uploads\\user-profile-picture\\<imgename>.<extension>
                // and we will serve it as localhost:3001/profile-picture/<imgename>.<extension> , so it can be downloaded at front-end
                const downloadableProfilePicturePath = `${req.protocol}://${req.get('host')}/profile-picture/`;
                user.profilePicture =  user.profilePicture 
                                        ?
                                            (user.profilePicture).replace("uploads\\user-profile-picture\\" , downloadableProfilePicturePath)
                                        :
                                            downloadableProfilePicturePath + "default-profile-picture.jpg"  // when no profile picture uploaded by user show default

                return {
                    statusCode: 200 , 
                    message: "follow this account to see their posts" ,
                    data: {
                        userName: user.username , 
                        name: user.name || "", 
                        bio: user.bio || "",
                        profilePicture: user.profilePicture,
                        followers: Array.isArray(user.followers) ? user.followers.length : [] ,     // [ ] only total not details and empty if no followers
                        following: Array.isArray(user.following) ? user.following.length  : [],        // [ ] only total not details and empty if no followingss
                    }
                }
            }
            
        }

        // const id = await Post.find();
        // console.log(id[1]._id);
        // console.log(user._id);
        // Finfinsing posts authored by this user
        const posts = await Post.find({ author: user._id });



        // we are here combining posts with user object
        let completeUserProfile = {
            username: user.username,
            name: user.name,
            bio: user.bio,
            profilePicture: user.profilePicture,
            followers: Array.isArray(user.followers) ? user.followers.length : [] ,     // [ ] only total not details and empty if no followers
            following: Array.isArray(user.following) ? user.following.length  : [],        // [ ] only total not details and empty if no followingss
            posts: Array.isArray(posts) ? posts : [] // here if not posts return empty []
        };

        // replacing the post file (saved as path )
        // to serve the actual serverUrl , so front-end can download the post file

        // post file is stored as: uploads\\posts\\<imgename>.<extension>
        // and we will serve it as localhost:3001/posts/<imgename>.<extension> , so it can be downloaded at front-end
        const downloadablePostMediaPath = `${req.protocol}://${req.get('host')}/posts/`;

        if (posts.length !== 0){

            completeUserProfile.posts = await Promise.all(
                completeUserProfile.posts.map(async post => {
                    let updatedMedia = [];
                    // transforming only if the media exists
                    if (Array.isArray(post.media) && post.media.length > 0) {
                        updatedMedia = post.media.map(mediaPath => 
                            `${downloadablePostMediaPath}${path.basename(mediaPath)}`
                        );
                    }

                    // Get comments for this post
                    const comments = await Comment.find({ post: post._id })
                                                .populate({
                                                    path: 'replies.user', 
                                                    select: 'username'
                                                })  // optional
                                                .sort({ createdAt: -1 })
                                                .limit(7);  // 7 comments per posts

                    return {
                        ...post._doc,   // keep other fields
                        media: updatedMedia,
                        comments, // attach comments to post
                    };
                })
            );
        }
       
        

        
        // replacing the profilePicture (saved as path )
        // to serve the actual serverUrl , so front-end can download the profilie picture

        // profilePicture is stored as: uploads\\user-profile-picture\\<imgename>.<extension>
        // and we will serve it as localhost:3001/profile-picture/<imgename>.<extension> , so it can be downloaded at front-end
        const downloadableProfilePicturePath = `${req.protocol}://${req.get('host')}/profile-picture/`;
        completeUserProfile.profilePicture =  completeUserProfile.profilePicture 
                                ?
                                    (completeUserProfile.profilePicture).replace("uploads\\user-profile-picture\\" , downloadableProfilePicturePath)
                                :
                                    downloadableProfilePicturePath + "default-profile-picture.jpg"  // when no profile picture uploaded by user show default

        
        return {
            statusCode: 200 ,
            message: "successfully fetched user profile",
            data: completeUserProfile
        };


    } catch (error) {
        console.error('get profile detilas Service Error:', error);
        return {
            statusCode: 500,
            message: 'Error while getting user profile detilas'
        };
    }
}


/**
 * save a post for the current user to view later
 * 
 * @param {String} userId - current user id extracted from token
 * @param {String} _id - _id of post to save
 * @returns {Promise<Object>} - object with statusCode and message
 */
async function bookmarkPost( userId , _id ) {
    try {
        // check if the post exists
        const post = await Post.findOne({ _id });
        
        // ifthat not exists
        if( !post ){
            return {
                statusCode: 404,
                message:  'Post not found to save' 
            };
        }

        // check if user exists
        console.log("user",userId);
        // converting userid to object id 
        const objectUserId = new mongoose.Types.ObjectId(userId); // Convert string to ObjectId
        const user = await User.findOne( { _id: objectUserId });
        if( !user ){
            return{
                statusCode: 404,
                message: "User requesting bookmarking this post is not found"
            }
        }

        // check if the post is already saved in user's saved posts
        if( (user.bookmarks).includes(_id) ){
            return {
                statusCode: 401,
                message: "post saved already !"
            }
        }

        (user.bookmarks).push(_id);
        await user.save();

        return {
            statusCode: 201,
            message: "post saved successfully !"
        }

    } catch (error) {
        console.error('book mark post Service Error:', error);
        return {
            statusCode: 500,
            message: 'Error while saving post'
        };
    }
}



/**
 * searches posts by using the given hashtag name
 * 
 * @param {String} hashtag  - "goku" or "#goku"
 * @returns {Promise<Object>} - statusCode , message , data which includes posts data
 */
async function searchPostsByHashtag( hashtag ) {
    try {
        // if hashtag = "goku" or "#goku"
        let tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

        const posts = await Post.find( {
            hashtags: { $elemMatch: { $regex: `^${tag}$`, $options: 'i' } }   // as hashtags are case sensitive
        } );

        if( !posts ){
            return {
                statusCode: 404,
                message: `no posts found with this given hashtag : ${hashtag}`
            }
        }

        return {
            statusCode: 200,
            message: `relvent posts found with this given hashtag: ${hashtag}`,
            data: posts
        }

    } catch (error) {
        console.error('search post by hashtag Service Error:', error);
        return {
            statusCode: 500,
            message: 'Error while searching post by hashtag'
        };      
    }
}



/**
 * to like or unlike a post
 * 
 * @param {String} userId - the current user's id who want to like / unlike targeted post
 * @param {String} postId - the post id whom the current user want to like/unlike
 * @returns {Promise<Object>} - statuseCode , message , likesCount (updated)
 */
async function likeOrUnlikePost( userId , postId) {
    try {
        // checking if th epost exists
        const post = await Post.findById(postId);
        if (!post){
            return {
                statusCode:404,
                message: 'Post not found'
            }
        } 

        const index = post.likes.indexOf(userId);
        if (index > -1) {
            post.likes.splice(index, 1); // Unlike
        } else {
            post.likes.push(userId); // Like
        }

        await post.save();

        
        return {
            statusCode: 200,
            message: index > -1 ? 'Post unliked' : 'Post liked',
            likesCount: post.likes.length
        }

    } catch (error) {
        console.error('like or unlike post Service Error:', error);
        return {
            statusCode: 500,
            message: 'Error while liking/unliking a post'
        };         
    }
}


/**
 * to add a comment on a post
 * 
 * @param {String} userId - current user id who wants to comment on pots
 * @param {String} postId - the post id on which the current user wants to comment
 * @param {String} comment - comment which the current users want to on the post
 * @returns {Promise<Object>} - statusCode , message , with comment object which includes postId , author(who's comment is) , comment
 */
async function addComment( userId , postId , comment ) {
    
        const newComment = new Comment({
            post: postId,
            author: userId, // the user who is commenting
            comment
        });

        await newComment.save();

        return {
            statusCode: 201,
            message: 'Comment added', 
            comment: newComment
        }
}



/**
 * to reply on a comment
 * 
 * @param {String} userId - current user id who wants to reply on comment
 * @param {String} commentId - comment's id to reply on
 * @param {String} reply - reply user wants to give
 * @returns {Promise<Object>} - statusCode , message and updated reply
 */
async function  replyToComment( userId , commentId, reply ) {

    const commentDoc = await Comment.findById(commentId);
    if (!commentDoc) {
        return { 
            statusCode: 404,  
            message: 'Comment not found' 
        }
    }

    console.log("this user id" , userId);
    commentDoc.replies.push({
        user: userId,  // the userid doing this reply
        reply,
        createdAt: new Date()
    });

    await commentDoc.save();

    return {
        statusCode: 200 ,
        message: 'Reply added', 
        replies: commentDoc.replies
    }

}



/**
 * to follow / unfollow a user
 * 
 * @param {String} currentUserId - the current user's id who wants to follow/unfollow 
 * @param {String} targetUserId - the target user's id whom the current user wants to follow/unfollow
 * @returns {Promise<Object>} - statusCode , message
 */
async function followUnfollowUser(currentUserId, targetUserId) {
    try {
        console.log(currentUserId, targetUserId);

        // checking ti the ids are valid ids
        if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return {
                statusCode: 400,
                message: "Invalid user ID (current user or target user id is invalid)"
            };
        }

        // concveting the string ids into mongodb object ids
        const newCurrentUserId = new mongoose.Types.ObjectId(currentUserId);
        const newTargetUserId = new mongoose.Types.ObjectId(targetUserId);

        const currentUser = await User.findById(newCurrentUserId);
        const targetUser = await User.findById(newTargetUserId);

        if (!targetUser) {
            return {
                statusCode: 404,
                message: "User not found"
            };
        }


        const isFollowing = currentUser.following.includes(newTargetUserId);

        if (isFollowing) { // if followinng
            currentUser.following.pull(newTargetUserId);  // unfollowug , hence reomving target user form current user's following
            targetUser.followers.pull(newCurrentUserId); // unfollowing , hence removing current user from target user's followers
        } else {
            // if not following
            currentUser.following.push(newTargetUserId); // follow target user
            targetUser.followers.push(newCurrentUserId); // adding current user as follower in target user followers list
        }

        // saving changes in both profiles
        await currentUser.save();  
        await targetUser.save();

        return {
            statusCode: 200,
            message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
        };

    } catch (error) {
        console.log("error while follow/unfollow user service: ", error);
        return {
            statusCode: 500,
            message: "Something went wrong"
        };
    }
}



/**
 * to follow unfollow a user
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {String} userId - current user's id who wants to follow/unfollow
 * @param {String} targetUserId - the user whom the current user wants to follow / unfollow
 * @returns 
 */
async function getFollowersAndFollowing( req , userId , targetUserId ){
    try {
        // check if this target user exists
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
        return {
            statusCode: 404,
            message: "Target user not found"
        };
        }

        // check if the targetg user has private account
        // and if this requesting user is his existing follower or not
        // for prvvate acocunt only existing followers can get list of following/followers
        // userId is the current user making this request
        if (targetUser.isPrivate) {
        const isFollower = targetUser.followers.some(
            (followerId) => followerId.toString() === userId.toString()
        );

        if (!isFollower) {
            return {
            statusCode: 403,
            message: "You are not allowed to view this private user's details"
            };
        }
        }

        const user = await User.findById(targetUserId)
        .populate('followers', 'username name profilePicture') // this will also include _id
        .populate('following', 'username name profilePicture');

        if (!user) {
        return {
            statusCode: 404,
            message: 'User not found'
        };
        }

        // construct downloadable profile picture path
        const downloadableProfilePicturePath = `${req.protocol}://${req.get('host')}/profile-picture/`;

        // format followers
        const formattedFollowers = user.followers.map(follower => ({
            _id: follower._id,
            username: follower.username,
            name: follower.name,
            bio: follower.bio,

            profilePicture: 
                follower.profilePicture
                    ? 
                        follower.profilePicture.replace('uploads\\user-profile-picture\\', downloadableProfilePicturePath)
                    : 
                        ''  //if not then empty
        }));

        // format following
        const formattedFollowing = user.following.map(following => ({
        _id: following._id,
        username: following.username,
        name: following.name,
        bio: following.bio,
        profilePicture: following.profilePicture
            ? following.profilePicture.replace('uploads\\user-profile-picture\\', downloadableProfilePicturePath)
            : ''
        }));

        // final response
        return {
        statusCode: 200,
        message: "Successfully got the followers and following lists",
        followers: formattedFollowers,
        following: formattedFollowing
        };
    } 
    
    catch (error) {
        console.log("error while getting followers and follwoing list from service : " , error);
        return { 
            statusCode: 500 ,
            message: "Failed to fetch list", 
            error: error.message 
        }    
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


