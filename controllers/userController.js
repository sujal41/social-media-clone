const userService = require("../service/userService")
const path = require('path');

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

        const response = await userService.updateUsername( userId , newUsername );
        
        return res.status( response.statusCode ).json( response );

    } catch (error) {
        console.error("error: " , error)
        return res.status(500).json({ message: "Internal server error during updating newUsername" });        
    }
}


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
        return res.status(500).json({ message: "Internal server error during updating newUsername" });        
    }
}

async function uploadPost( req , res ) {
    try {
        let { caption } = req.body || "" ;
        const files = req.files;
        console.log("files: ",files);
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

        const result = await userService.uploadPost(
            userId,
            caption,
            media  // because upload function has media as a parameter , hence to prevent reference error
        );

        return res.status(result.statusCode).json({ message: result.message });
    } catch (error) {
        console.error('Create Post Error:', error);
        return res.status(500).json({ message: 'Failed to create post' });
    }
}

module.exports = { 
    updateEmail , updateName , 
    updateUsername , updateProfilePicture ,
    uploadPost
};