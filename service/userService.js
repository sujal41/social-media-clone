const User = require("../models/User");
const Post = require("../models/Post");
const path = require('path');

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
async function updateUsername( userId , newUsername){
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
        // user.username = newUsername;
        // await user.save();
        
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


async function uploadPost( userId , caption , media ){
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
            media: media
        });

        // // await post.save();  // save is not working giving BSONerror
        // // we have to create it directly when using object like new Post()
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

module.exports = { 
    updateEmail , updateName , 
    updateUsername , updateProfilePicture , 
    uploadPost
};