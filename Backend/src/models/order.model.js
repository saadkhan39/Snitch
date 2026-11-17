import mongoose from "mongoose";
import priceSchema from "./priceSchema.js";
import shippingAddressSchema from "./shippingAddress.schema.js";

const orderItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    variantId: mongoose.Schema.Types.ObjectId,
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    images: [{ url: String }],
    description: String,
    selectedAttributes: {
        type: Map,
        of: String,
        default: {}
    },
    price: {
        type: priceSchema,
        required: true
    },
    status: {
        type: String,
        enum: ["processing", "dispatched", "delivered"],
        default: "processing"
    },
    processingStatus: {
        type: String,
        enum: ["pending", "processing", "completed"],
        default: "pending"
    },
    dispatchStatus: {
        type: String,
        enum: ["pending", "dispatched"],
        default: "pending"
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "in_transit", "delivered"],
        default: "pending"
    },
    processedAt: Date,
    dispatchedAt: Date,
    deliveredAt: Date
});

const orderSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment",
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    razorpay: {
        orderId: {
            type: String,
            required: true
        },
        paymentId: {
            type: String,
            required: true
        }
    },
    paymentStatus: {
        type: String,
        enum: ["paid"],
        default: "paid"
    },
    price: {
        type: priceSchema,
        required: true
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: "An order must contain at least one item"
        }
    },
    status: {
        type: String,
        enum: ["processing", "dispatched", "delivered"],
        default: "processing"
    },
    processingStatus: {
        type: String,
        enum: ["pending", "processing", "completed"],
        default: "pending"
    },
    dispatchStatus: {
        type: String,
        enum: ["pending", "dispatched"],
        default: "pending"
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "in_transit", "delivered"],
        default: "pending"
    }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, createdAt: -1 });

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
