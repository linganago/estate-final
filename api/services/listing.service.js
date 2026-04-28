import { Listing } from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListingService = async (data) => {
  return await Listing.create(data);
};

export const deleteListingService = async (listingId, userId) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw errorHandler(404, 'Listing not found!');
  if (listing.userRef.toString() !== userId.toString())
    throw errorHandler(403, 'You can only delete your own listings!');
  await Listing.findByIdAndDelete(listingId);
  return true;
};

export const updateListingService = async (listingId, userId, updateData) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw errorHandler(404, 'Listing not found!');
  if (listing.userRef.toString() !== userId.toString())
    throw errorHandler(403, 'You can only update your own listings!');
  return await Listing.findByIdAndUpdate(listingId, updateData, { new: true });
};

export const getListingByIdService = async (listingId) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw errorHandler(404, 'Listing not found!');
  return listing;
};

export const searchListingsService = async (query) => {
  const {
    offer,
    furnished,
    parking,
    type,
    searchTerm,
    sort = 'createdAt',
    order = 'desc',
    limit = 9,
    startIndex = 0,
  } = query;

  // Build filter object
  const filter = {};

  if (offer === 'true') filter.offer = true;
  else if (offer !== undefined) filter.offer = { $in: [false, true] };

  if (furnished === 'true') filter.furnished = true;
  else if (furnished !== undefined) filter.furnished = { $in: [false, true] };

  if (parking === 'true') filter.parking = true;
  else if (parking !== undefined) filter.parking = { $in: [false, true] };

  if (type === 'sale' || type === 'rent') filter.type = type;
  else filter.type = { $in: ['sale', 'rent'] };

  if (searchTerm && searchTerm.trim()) {
    filter.$or = [
      { name: { $regex: searchTerm.trim(), $options: 'i' } },
      { description: { $regex: searchTerm.trim(), $options: 'i' } },
      { address: { $regex: searchTerm.trim(), $options: 'i' } },
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;

  return await Listing.find(filter)
    .sort({ [sort]: sortOrder })
    .skip(Number(startIndex))
    .limit(Number(limit));
};
