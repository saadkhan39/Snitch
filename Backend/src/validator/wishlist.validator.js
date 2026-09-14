import { param } from "express-validator";

import { validateRequest } from "../middleware/validateRequest.js";

/**
 * Validate product ID
 */
export const validateWishlistProductId = [
  param("productId")
    .isMongoId()
    .withMessage("Invalid product ID"),

  validateRequest,
];

