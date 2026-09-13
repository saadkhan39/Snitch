import express from "express";
import { addToCart ,getCart ,deleteCartItem ,incrementCartItemQuantity ,decrementCartItemQuantity } from "../controllers/cart.controller.js";
import { addToCartValidator, validateIncrementCartItemQuantity ,validateDecrementCartItemQuantity} from "../validator/cart.validator.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add a product to the cart
 * @access Private
 * @argument productId - The ID of the product to add to the cart
 * @argument variantId - The ID of the product variant to add to the cart (optional)
 * @argument quantity - The quantity of the product to add to the cart(optional, default is 1)
 */

router.post("/add/:productId/:variantId",authenticateUser, addToCartValidator, addToCart);


/**
 * @route GET /api/cart
 * @desc Get the user's cart
 * @access Private  
 */

router.get("/", authenticateUser ,getCart)

/**
 * @route DELETE /api/cart
 * @desc delete the user's cart
 * @access Private  
 */
router.delete("/item/:itemId",authenticateUser,deleteCartItem);


/**
 * @route PATCH /api/cart/quantity/increment/:productId/:variantId
 * @desc Increment item quantity in cart by one
 * @access Private
 * @argument productId - ID of the product to update
 * @argument variantId - ID of the variant to update
 */
router.patch("/quantity/increment/:productId/:variantId", authenticateUser, validateIncrementCartItemQuantity, incrementCartItemQuantity)

/**
 * @route PATCH /api/cart/quantity/decrement/:productId/:variantId
 * @desc Decrement item quantity in cart by one
 * @access Private
 * @argument productId - ID of the product to update
 * @argument variantId - ID of the variant to update
 */
router.patch(
  "/quantity/decrement/:productId/:variantId",
  authenticateUser,
  validateDecrementCartItemQuantity,
  decrementCartItemQuantity
);

export default router