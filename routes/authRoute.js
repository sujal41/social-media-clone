const express = require('express');
const cors = require('cors');
const { signup, login } = require('../controllers/authController');

const router = express.Router();
router.use(cors());

// for registering the user
router.post('/signup' , signup);

// for login
router.post("/login" , login);


module.exports = router;
