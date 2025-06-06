const authService = require('../service/authService');


async function signup( req , res) {
    try {
        const { username , name , email , password  } = req.body;

        console.log( email , password);
        if( !username ) {
            return res.status(400).json({ message: "username is required"});
        }

        if( !email || !password ) {
            return res.status(400).json({ message: "Email and passwords required"});
        }

        // Basic validation
        if (!username || !name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        // checking for valis password

        if( !password ){
            return res.status(400).json({ message: "Invalid: password is required"});
        }

        // checking for valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(email);
        if( !isValidEmail ){
            return res.status(400).json({
                value: false ,
                message: "Invalid Email"
            });
        }

        

        // testing difficult of pasword
        // At least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special char
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; 
        const isStrongPassword = strongRegex.test(password);  // return true if password is strong

        if( !isStrongPassword ){
            res.status(400).json({ 
                valid: false,
                message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." })
        }

        // till here we can assum that password is valid

        // encrypt the password and email in database
        // .....................

        // create user record in database
        const response = await authService.signup( {username , name , email , password});
        return res.status( response.statusCode ).json(response);
        
        // otp generate option in future
        // .......................


    } catch (error) {
        console.log("error : " , error);
        return res.status(500).json({ message: "Internal server error during signup" });
    }
}

async function login( req , res ) {
    try {
        const { username , password } = req.body;

        if( !username || !password){
            return res.status(400).json({ message: "username and password are required" });
        }

        const response = await authService.login( { username , password } );
        return res.status(response.statusCode).json( response ); 

    } catch (error) {
        console.error("error: " , error)
        return res.status(500).json({ message: "Internal server error during signup" });        
    }
}


module.exports = { signup , login };