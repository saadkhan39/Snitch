import express from "express"
import multer  from 'multer'
import { authenticateSeller } from "../middleware/auth.middleware.js"
import { createProductValidator } from "../validator/product.validator.js"
import { createProduct, getAllProduct, getSellerProducts } from "../controllers/product.controller.js"


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

export default router