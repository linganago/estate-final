import express from 'express';
import {
  createListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
} from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { validate } from '../middleware/validate.js';
import {
  createListingSchema,
  updateListingSchema,
} from '../validators/listing.validator.js';

const router = express.Router();

router.post('/create', verifyToken, validate(createListingSchema), createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, validate(updateListingSchema), updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);

export default router;
