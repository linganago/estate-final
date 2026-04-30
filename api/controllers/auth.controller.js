import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: COOKIE_OPTIONS.httpOnly,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite,
};

const normalizeEmail = (email) => email?.trim().toLowerCase();
const normalizeUsername = (username) => username?.trim();

const createAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw errorHandler(500, 'Authentication is not configured on the server');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export const signup = async (req, res, next) => {
  const username = normalizeUsername(req.body.username);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }
  if (password.length < 6) {
    return next(errorHandler(400, 'Password must be at least 6 characters'));
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(
        errorHandler(
          409,
          existingUser.email === email
            ? 'Email already in use'
            : 'Username already taken'
        )
      );
    }

    const hashPassword = bcrypt.hashSync(password, 12);
    const newUser = new User({ username, email, password: hashPassword });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, 'Email and password are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    const token = createAccessToken(validUser._id);

    const { password: _pass, ...rest } = validUser._doc;

    res
      .cookie('access_token', token, COOKIE_OPTIONS)
      .status(200)
      .json({ success: true, message: 'Signed in successfully', ...rest });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const { photo } = req.body;

  if (!name || !email) {
    return next(errorHandler(400, 'Google auth requires name and email'));
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const generatePassword =
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatePassword, 12);
      const baseUsername =
        name.replace(/[^a-z0-9]/gi, '').toLowerCase() ||
        email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() ||
        'user';
      const suffix = Math.random().toString(36).slice(-6);
      user = new User({
        username: baseUsername + suffix,
        email,
        password: hashedPassword,
        avatar: photo || undefined,
      });
      await user.save();
    }

    const token = createAccessToken(user._id);
    const { password: _pass, ...rest } = user._doc;

    res
      .cookie('access_token', token, COOKIE_OPTIONS)
      .status(200)
      .json({ success: true, ...rest });
  } catch (error) {
    next(error);
  }
};

export const signOut = (_req, res) => {
  res.clearCookie('access_token', CLEAR_COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: 'Signed out successfully' });
};
