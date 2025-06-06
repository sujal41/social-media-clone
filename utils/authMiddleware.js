const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized: invalid token format" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        console.error('Error during token verification:', err);
        return res.status(401).json({ message: "Forbidden: Invalid Token" });
      }

      req.user = user;
      next();
    });

  } catch (error) {
    console.error("Error while authenticating token:", error);
    return res.status(500).json({ message: "Internal server error during token authentication" });
  }
};

module.exports = { authenticateToken };
