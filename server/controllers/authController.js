import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============================================================
// Generate JWT Token
// ============================================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================================
// Helper: Generate token, set HttpOnly cookie, send response
// ============================================================
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      district: user.district,
      role: user.role,
    });
};

// ============================================================
// @desc    Register a new user
// @route   POST /api/auth/register
// ============================================================
export const register = async (req, res) => {
  try {
    const { name, email, phone, district, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // SECURITY: Always force role to 'farmer' on self-registration.
    // Admins must be created via a seeder script or a separate protected route.
    const user = await User.create({
      name,
      email,
      phone,
      district,
      password,
      role: 'farmer',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// ============================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      sendTokenResponse(user, 200, res);
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// ============================================================
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'User logged out' });
};

// ============================================================
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// ============================================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Update user profile (name, phone, district)
// @route   PUT /api/auth/profile
// FIX: Explicitly allowlist updatable fields. This prevents a
// user from escalating their role or changing their email by
// injecting extra fields in the request body.
// ============================================================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only these three fields are allowed to change via this route.
    // email and role are intentionally excluded.
    const { name, phone, district } = req.body;

    if (name)     user.name     = name;
    if (phone)    user.phone    = phone;
    if (district) user.district = district;

    const updatedUser = await user.save();

    res.json({
      _id:      updatedUser._id,
      name:     updatedUser.name,
      email:    updatedUser.email,
      phone:    updatedUser.phone,
      district: updatedUser.district,
      role:     updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Change password
// @route   PUT /api/auth/change-password
// FIX: Added minimum password length validation.
// ============================================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    // FIX: Enforce a minimum password length before hashing
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword; // Model pre-save hook will hash it
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};