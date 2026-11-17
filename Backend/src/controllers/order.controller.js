import mongoose from "mongoose";
import orderModel from "../models/order.model.js";

const isValidOrderId = (id) => mongoose.isValidObjectId(id);

const sellerItemsOnly = (order, sellerId) => {
    const result = order.toObject();
    result.items = result.items.filter(
        (item) => String(item.seller) === String(sellerId)
    );
    return result;
};

export const getCustomerOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ user: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("GET CUSTOMER ORDERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};

export const getCustomerOrder = async (req, res) => {
    if (!isValidOrderId(req.params.orderId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }

    try {
        const order = await orderModel.findOne({
            _id: req.params.orderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("GET CUSTOMER ORDER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order"
        });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ "items.seller": req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders: orders.map((order) => sellerItemsOnly(order, req.user._id))
        });
    } catch (error) {
        console.error("GET SELLER ORDERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch seller orders"
        });
    }
};

const canTransition = (item, status) => {
    if (status === "processing") {
        return item.processingStatus === "pending" ||
            item.processingStatus === "processing";
    }
    if (status === "dispatched") {
        return item.dispatchStatus === "dispatched" ||
            item.processingStatus === "processing";
    }
    return item.deliveryStatus === "delivered" ||
        item.dispatchStatus === "dispatched";
};

const applyStatus = (item, status, changedAt) => {
    if (status === "processing" && item.processingStatus === "pending") {
        item.processingStatus = "processing";
        item.processedAt = changedAt;
    } else if (status === "dispatched" && item.dispatchStatus !== "dispatched") {
        item.processingStatus = "completed";
        item.dispatchStatus = "dispatched";
        item.deliveryStatus = "in_transit";
        item.status = "dispatched";
        item.dispatchedAt = changedAt;
    } else if (status === "delivered" && item.deliveryStatus !== "delivered") {
        item.deliveryStatus = "delivered";
        item.status = "delivered";
        item.deliveredAt = changedAt;
    }
};

const updateAggregateStatuses = (order) => {
    const items = order.items;
    order.processingStatus = items.every(
        (item) => item.processingStatus === "completed"
    )
        ? "completed"
        : items.some((item) => item.processingStatus === "processing")
            ? "processing"
            : "pending";
    order.dispatchStatus = items.every(
        (item) => item.dispatchStatus === "dispatched"
    )
        ? "dispatched"
        : "pending";
    order.deliveryStatus = items.every(
        (item) => item.deliveryStatus === "delivered"
    )
        ? "delivered"
        : items.some((item) => item.deliveryStatus !== "pending")
            ? "in_transit"
            : "pending";
    order.status = items.every((item) => item.status === "delivered")
        ? "delivered"
        : items.every((item) => item.status === "dispatched" || item.status === "delivered")
            ? "dispatched"
            : "processing";
};

export const updateSellerOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["processing", "dispatched", "delivered"];

    if (!isValidOrderId(orderId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status must be processing, dispatched, or delivered"
        });
    }

    try {
        const order = await orderModel.findOne({
            _id: orderId,
            "items.seller": req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const sellerItems = order.items.filter(
            (item) => String(item.seller) === String(req.user._id)
        );
        if (!sellerItems.every((item) => canTransition(item, status))) {
            return res.status(409).json({
                success: false,
                message: "Order status cannot move backwards or skip a fulfillment step"
            });
        }

        const changedAt = new Date();
        sellerItems.forEach((item) => applyStatus(item, status, changedAt));
        updateAggregateStatuses(order);
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: sellerItemsOnly(order, req.user._id)
        });
    } catch (error) {
        console.error("UPDATE SELLER ORDER STATUS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order status"
        });
    }
};
