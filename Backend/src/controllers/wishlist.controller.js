import wishlistModel from "../models/wishlist.model.js";
import productModel from "../models/product.model.js";


export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check whether product exists
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find user's wishlist
    let wishlist = await wishlistModel.findOne({
      user: req.user._id,
    });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await wishlistModel.create({
        user: req.user._id,
        products: [productId],
      });

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        wishlist,
      });
    }

    // Check if product is already present
    const alreadyExists = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    // Add product
    wishlist.products.push(productId);

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await wishlistModel.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const productExists = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product is not in wishlist",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(
      "REMOVE FROM WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistModel
      .findOne({
        user: req.user._id,
      })
      .populate("products");

    // If wishlist doesn't exist
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        wishlist: {
          products: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await wishlistModel.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        isWishlisted: false,
      });
    }

    const isWishlisted = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    return res.status(200).json({
      success: true,
      isWishlisted,
    });
  } catch (error) {
    console.error("CHECK WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};

