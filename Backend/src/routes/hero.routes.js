import express from "express";
import multer from "multer";
import { authenticateSeller } from "../middleware/auth.middleware.js";
import {createHero,getActiveHero,} from "../controllers/hero.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

const router = express.Router();

/**
 * @route POST /api/hero
 * @desc Upload hero images
 * @access Private (Seller only)
 */
router.post("/",authenticateSeller,upload.array("images", 5),createHero);

/**
 * @route GET /api/hero
 * @desc Get active hero images
 * @access Public
 */
router.get("/", getActiveHero);

export default router;