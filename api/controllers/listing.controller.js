import {
  createListingService,
  deleteListingService,
  updateListingService,
  getListingByIdService,
  searchListingsService,
} from '../services/listing.service.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await createListingService(req.body);
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      _id: listing._id,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    await deleteListingService(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const updated = await updateListingService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, listing: updated, _id: updated._id });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await getListingByIdService(req.params.id);
    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const listings = await searchListingsService(req.query);
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
