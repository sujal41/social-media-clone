const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbConfig');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoute = require('./routes/authRoute');
const userRoute = require("./routes/userRoute");

const app = express();

app.use(bodyParser.json());
app.use(cors());


const PORT = process.env.PORT;

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
