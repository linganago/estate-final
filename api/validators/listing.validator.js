import { z } from 'zod';

export const createListingSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters')
    .max(100, 'Name must be under 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be under 2000 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(300, 'Address must be under 300 characters'),
  regularPrice: z.coerce
    .number()
    .min(1, 'Price must be at least 1')
    .max(100000000, 'Price is too high'),
  discountPrice: z.coerce
    .number()
    .min(0, 'Discount price cannot be negative')
    .max(100000000)
    .optional()
    .default(0),
  bathrooms: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 bathroom required')
    .max(20),
  bedrooms: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 bedroom required')
    .max(50),
  furnished: z.coerce.boolean(),
  parking: z.coerce.boolean(),
  type: z.enum(['sale', 'rent'], {
    errorMap: () => ({ message: 'Type must be sale or rent' }),
  }),
  offer: z.coerce.boolean(),
  imageUrls: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(1, 'At least one image is required')
    .max(6, 'Maximum 6 images allowed'),
  userRef: z.string().min(1, 'userRef is required'),
});

export const updateListingSchema = createListingSchema.partial().extend({
  userRef: z.string().min(1, 'userRef is required'),
});
