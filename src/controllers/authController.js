const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const JWT_ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWT_EMAIL_SECRET = process.env.EMAIL_TOKEN_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

const generateAccessToken = (userID) =>
  jwt.sign({ userID }, JWT_ACCESS_SECRET, { expiresIn: '30m' });
const generateRefreshToken = (userID) =>
  jwt.sign({ userID }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
const generateEmailToken = (userID) =>
  jwt.sign({ userID }, JWT_EMAIL_SECRET, { expiresIn: '10m' });

const isValidPassword = (password) => {
  if (password.length < 10) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: 'Please provide email and password' });

    if (!isValidEmail(email))
      return res
        .status(400)
        .json({ error: 'Please provide a valid email address' });

    if (!isValidPassword(password))
      return res.status(400).json({
        error:
          'Password must be at least 10 characters, contain one uppercase letter, one lowercase letter, one number, and one special character',
      });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 11);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const emailToken = generateEmailToken(newUser._id);
    const verificationURL = `${CLIENT_URL}/verify-email?token=${emailToken}`;
    await sendEmail({
      to: newUser.email,
      subject: 'Verify your JobBoard account',
      html: `<p>Please click the link below to verify your email:</p><a href="${verificationURL}">${verificationURL}</a>`,
    });

    res.status(201).json({
      message:
        'Signup successful. Please check your email to verify your account before logging in',
      email: newUser.email,
      needsVerification: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.verified)
      return res.status(403).json({
        error: 'Please verify your email before logging in',
        needsVerification: true,
      });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.status(200).json({
      message: 'Successfully logged in',
      user: userResponse,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(204).end();

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userID);
    if (!user) return res.status(401).json({ error: 'User no longer exist' });
    if (!user.verified) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return res.status(403).json({
        error: 'Email verification required',
        needsVerification: true,
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.status(200).json({ accessToken: newAccessToken, user });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.status(200).json({ message: 'Successfully logged out' });
};

exports.verifyEmail = async (req, res) => {
  try {
    const emailToken = req.query.token;
    if (!emailToken) return res.status(401).json({ error: 'Token is missing' });

    const decoded = jwt.verify(emailToken, JWT_EMAIL_SECRET);
    const user = await User.findByIdAndUpdate(
      decoded.userID,
      { verified: true },
      { new: true }
    );
    if (!user) return res.status(401).json({ error: "User doesn't exist" });

    res.status(200).json({ message: 'Email is verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
