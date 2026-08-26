import express from "express"
import multer  from 'multer'
import { authenticateSeller } from "../middleware/auth.middleware.js"
import { createProductValidator } from "../validator/product.validator.js"
import { createProduct } from "../controllers/product.controller.js"


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

const router = express.Router()

router.post("/",authenticateSeller,upload.array("images",7),createProductValidator,createProduct)


export default router