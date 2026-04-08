import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};