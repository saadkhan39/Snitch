import mongoose from "mongoose";
import priceSchema from "./priceSchema.js";
import shippingAddressSchema from "./shippingAddress.schema.js";


const paymentSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: [ "pending", "paid", "failed" ],
        default: "pending"
    },
    price: {
        type: priceSchema,
        required: true
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    orderItems: [
        {
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
                required: true
            },
            images: [ { url: String } ],
            description: String,
            selectedAttributes: {
                type: Map,
                of: String,
                default: {}
            },
            price: priceSchema
        }
    ]
})


const paymentModel = mongoose.model("payment", paymentSchema)

export default paymentModel;