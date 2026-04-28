import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { Listing } from '../models/listing.model.js';

export const test = (_req, res) => {
  res.json({ message: 'API is working!' });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You can only update your own account'));
  }

  try {
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return next(errorHandler(400, 'Password must be at least 6 characters'));
      }
      req.body.password = bcrypt.hashSync(req.body.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return next(errorHandler(404, 'User not found'));

    const { password: _pass, ...rest } = updatedUser._doc;
    res.status(200).json({ success: true, message: 'User updated successfully', ...rest });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You can only delete your own account'));
  }

  try {
    await Listing.deleteMany({ userRef: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getUserListing = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You can only access your own listings'));
  }

  try {
    const listings = await Listing.find({ userRef: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, listings });
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch listings'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(errorHandler(404, 'User not found'));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getPublicContactUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('username email');
    if (!user) return next(errorHandler(404, 'User not found'));

    res.status(200).json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
