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

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
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
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, 'Email and password are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

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
  const { name, email, photo } = req.body;

  if (!name || !email) {
    return next(errorHandler(400, 'Google auth requires name and email'));
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const generatePassword =
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatePassword, 12);
      const baseUsername = name.split(' ').join('').toLowerCase();
      const suffix = Math.random().toString(36).slice(-4);
      user = new User({
        username: baseUsername + suffix,
        email,
        password: hashedPassword,
        avatar: photo || undefined,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
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
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: 'Signed out successfully' });
};
