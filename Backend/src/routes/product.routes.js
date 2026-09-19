import express from "express"
import multer  from 'multer'
import { authenticateSeller, authenticateUser } from "../middleware/auth.middleware.js"
import { createProductValidator } from "../validator/product.validator.js"
import { createProduct, getAllProduct, getSellerProducts, getProductDetails,addProductVariant ,updateProductVariant, deleteProductVariant } from '../controllers/product.controller.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

const router = express.Router()


/**
 *  @routes POST /api/products
 *  @desc Create a new product
 *  @access Private (Seller only)
 */
router.post("/",authenticateSeller,upload.array("images",7),createProductValidator,createProduct)

/**
 *  @routes GET /api/products/seller
 *  @desc Get all products for the authenticated seller
 *  @access Private (Seller only)
 */
router.get("/seller",authenticateSeller,getSellerProducts)

/**
 * @routes GET /api/products
 * @desc Get all products (Public)
 * @access Public
 */
router.get("/", getAllProduct)

/**
 * @routes GET /api/products/detail/:id
 * @desc Get a product details by ID (Public)
 * @access Public
 */
router.get("/detail/:id", getProductDetails)



/**
 * @route post /api/products/:productId/variants
 * @description Add a new variant to a product
 * @access Private (Seller only)
 */
router.post("/:productId/variants", authenticateSeller, upload.array('images', 7), addProductVariant)

/**
 * @route PUT /api/products/:productId/variants/:variantId
 * @description Update an existing product variant
 * @access Private (Seller only)
 */
router.put(
  "/:productId/variants/:variantId",
  authenticateSeller,
  updateProductVariant
);

/**
 * @route DELETE /api/products/:productId/variants/:variantId
 * @description Delete an existing product variant
 * @access Private (Seller only)
 */


router.delete(
  "/:productId/variants/:variantId",
  authenticateSeller,
  deleteProductVariant
);
export default router