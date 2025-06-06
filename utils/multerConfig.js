const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: ( req , file , cb) =>{
        const userId = req.user._id;
        const uploadPath = path.join( __dirname , '../' , 'public' , 'uploads' , 'user' , userId.toString());

        // creating folder for user sapearately , if it is the first time he is uploading some media files
        fs.mkdirSync( uploadPath , { recursive: true});

        cb( null, uploadPath);
    },

    filename: ( req , file , cb ) => {
        const userId = req.user._id;
        // getting extension name from original uploaded file
        const ext = path.extname(file.originalname);
        // giving a unique name to file followed by its original extension name
        const uniqueName = `profile_${userId}_${Date.now()}.${ext}`; 

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