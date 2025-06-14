const User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const { updateUser } = require('../controllers/authcontroller');
const crypto = require('crypto');
const sendEmail = require('../utilities/sendEmail');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password || !location || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ firstName, lastName, email, password, location, phoneNumber });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send token via email
    const resetUrl = `https://adaquila.com/reset-password/?token=${resetToken}`;
    const emailMessage = `Hello ${user.firstName},\n\nWe received a request to reset your password for your Adaquila account.\n\nTo reset your password, please click the link below or copy and paste it into your browser:\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email.\n\nThank you,\nThe Adaquila Team`;
    await sendEmail(user.email, 'Password Reset Request', emailMessage);

    res.json({ message: 'Reset token sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending reset token', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Get token from query string, newPassword from body
    const { newPassword } = req.body;
    const token = req.query.token;
    console.log('DEBUG resetPassword: token from query:', token);
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    console.log('DEBUG resetPassword: user found:', user);
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting account', error: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user details', error: err.message });
  }
};