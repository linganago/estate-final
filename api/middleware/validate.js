/**
 * Zod validation middleware factory.
 * Usage: router.post('/route', validate(mySchema), controller)
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data; // replace with sanitized/coerced data
  next();
};
