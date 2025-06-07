const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4} =  require('uuid'); // for setting random userProfilePictureName

/**
 * 
 * this multer file is created and designed for saving profile 
 * pictures of users in the server's disk storage
 * 
 * 
 * 
 * 
 * 
 */

const storage = multer.diskStorage({
    destination: ( req , file , cb) =>{
        const userId = req.user._id;
        const uploadPath = path.join( __dirname , '../' , 'public' , 'uploads' , 'user-profile-picture' );

        // creating folder for user sapearately , if it is the first time he is uploading some media files
        fs.mkdirSync( uploadPath , { recursive: true});

        cb( null, uploadPath);
    },

    filename: ( req , file , cb ) => {
        const userId = req.user._id;
        // getting extension name from original uploaded file
        const ext = path.extname(file.originalname);
        // giving a unique name to file followed by its original extension name
        // we will store this url using service in database with user's record
        // so even if the profilepicture name is random we can still get it using userId
        
        const uniqueName = `profile_${uuidv4()}_${Date.now()}${ext}`;  // the ext will include the . for the extension ex.  .jpg 


        cb( null , uniqueName);
    }
})

const fileFilter = ( req , file , cb) => {
    const allowedTypes = ['image/jpeg' , 'image/jpg' , 'image/png'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null , true);
    }
    else{
        cb(new Error('Only JPEG , JPG , PNG types of images are allowed') , false);
    }
}

const upload = multer({ storage , fileFilter });

module.exports = upload;