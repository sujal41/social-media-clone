const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbConfig');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoute = require('./routes/authRoute');
const userRoute = require("./routes/userRoute");

const app = express();

// use this command to install all packages required to run the app
// npm i express dotenv mongoose path bcrypt jsonwebtoken multer uuid fs cors

app.use(bodyParser.json());
app.use(cors());


const PORT = process.env.PORT;

// serving profile pictures to front-end , the front-end will use
// the "localhost:3001/profile-picture/<imgname with extension>" which will 
// serv the file stored at 'public/uploads/user-profile-picture/' 
app.use(  "/profile-picture" , express.static(path.join(path.resolve() , 'public/uploads/user-profile-picture/')) )
// for posts
app.use(  "/posts" , express.static(path.join(path.resolve() , 'public/uploads/posts/')) );

app.use("/api/auth", authRoute);
app.use("/api/user" , userRoute);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  })
