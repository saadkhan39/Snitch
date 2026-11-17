import express from "express";
import {
    getCustomerOrder,
    getCustomerOrders,
    getSellerOrders,
    updateSellerOrderStatus
} from "../controllers/order.controller.js";
import { authenticateSeller, authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, getCustomerOrders);
router.get("/seller", authenticateSeller, getSellerOrders);
router.patch("/:orderId/status", authenticateSeller, updateSellerOrderStatus);
router.get("/:orderId", authenticateUser, getCustomerOrder);

export default router;
