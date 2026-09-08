import express from "express";
import { addToCart ,getCart } from "../controllers/cart.controller.js";
import { addToCartValidator } from "../validator/cart.validator.js";
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

export default router