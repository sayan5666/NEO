const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

const generateAccessToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_dev_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign({ userId }, secret, { expiresIn });
};

const generateRefreshToken = (userId) => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret_dev_key';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, secret, { expiresIn });
};

// POST /signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, resumeUrl } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      resumeUrl: resumeUrl || null,
    });

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(),
        token: accessToken,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token: accessToken,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret_dev_key';

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, refreshSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== incomingToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is unrecognized or revoked',
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /google
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential ID token is required',
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('[Google Auth] Token verification failed:', verifyErr.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google authentication token: ' + verifyErr.message,
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to extract email from Google token payload',
      });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const googleId = payload.sub;
    const avatarUrl = payload.picture || null;

    // Look up user by googleId OR email
    let user = await User.findOne({
      $or: [{ googleId: googleId }, { email: email }],
    });

    if (user) {
      // User exists - link Google credentials if not already linked
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create new user for Google Sign-In
      user = new User({
        name,
        email,
        googleId,
        avatarUrl,
        authProvider: 'google',
        passwordHash: null,
        tokenBalance: 3,
      });
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: user.toJSON(),
        token: accessToken,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  googleAuth,
  refreshToken,
  getMe,
};
