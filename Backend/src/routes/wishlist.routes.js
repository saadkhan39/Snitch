import express from "express";
import {addToWishlist,removeFromWishlist,getWishlist,checkWishlist,} from "../controllers/wishlist.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {validateWishlistProductId} from "../validator/wishlist.validator.js";

const router = express.Router();

/**
 * @route   POST /api/wishlists/add/:productId
 * @desc    Add item to Wishlist
 * @access  Private (User)
 */
router.post("/add/:productId", authenticateUser, validateWishlistProductId, addToWishlist);

/**
 * @route   DELETE /api/wishlists/remove/:productId
 * @desc    Remove item from Wishlist
 * @access  Private (User)
 */
router.delete("/remove/:productId",authenticateUser,validateWishlistProductId,removeFromWishlist);

/**
 * @route   GET /api/wishlists
 * @desc    Get user's Wishlist
 * @access  Private (User)
 */
router.get( "/",authenticateUser, getWishlist);

/**
 * @route   GET /api/wishlists/check/:productId
 * @desc    Check if product exists in Wishlist
 * @access  Private (User)
 */
router.get("/check/:productId",authenticateUser,validateWishlistProductId,checkWishlist);

export default router;
