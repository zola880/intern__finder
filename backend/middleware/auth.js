const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'User associated with this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token. Please log in again.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired. Please refresh or log in again.' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

module.exports = authMiddleware;