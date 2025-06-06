const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Handles user signup by checking for duplicates, hashing password,
 * and saving the user to the database.
 * 
 * @param {Object} param0 - User registration data
 * @param {string} param0.username - Desired username of the user
 * @param {string} param0.name - name of the user
 * @param {string} param0.email - Email address of the user
 * @param {string} param0.password - Plaintext password of the user
 * 
 * @returns {Promise<Object>} Response object containing:
 *  - statusCode: HTTP status code
 *  - message: Description of the result
 *  - data (optional): Newly created user data (excluding password)
 */
async function signup({ username , name , email, password }) {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
        return {
            statusCode: 400,
            message: "Username or email already exists"
        };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        return {
            statusCode: 201,
            message: "User registered successfully",
            data: {
                userId: savedUser._id,
                username: savedUser.username,
                name: savedUser.name,
                email: savedUser.email,
            }
        };

    } catch (error) {
        console.error("Signup Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal server error during signup"
        };
    }
}


/**
 * Authenticates a user and returns a JWT token if successful
 * 
 * @param {Object} param0
 * @param {string} param0.username - Username of the user
 * @param {string} param0.password - Plaintext password to verify
 * @returns {Promise<Object>} Response with statusCode, message, and token if success
 */
async function login({ username , password }) {
    try {
        // checking if user exists
        const user = await User.findOne( { username });
        if( !user ){
            return{
                statusCode: 404,
                message: "User not found"
            }
        }

        if( !user._id ){
            return{
                statusCode: 404,
                message: "User not found"
            }
        }

        // checking password validation
        const isPasswordValid = await bcrypt.compare( password , user.password);
        if( !isPasswordValid ){
            return {
                statusCode: 401,
                message: "Invalid username or password"
            }
        }

        // now we are generating the JWT
        const token = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                role: user.role || "user"
            },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        )

        // returning the response
        return {
            statusCode: 200,
            message: "Login Successfull",
            token,
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }

    } catch (error) {
        console.error("Login Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal server error during Login"
        };
    }
}


module.exports = { signup , login };

