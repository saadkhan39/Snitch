import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import {config} from  "../config/config.js";

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
}); 

export const createOrder = async (amount, currency = "INR") => {
    try {
        const options = {   
            amount: amount * 100, // Amount in paise
            currency
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw error;
    }
};  

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
    if (!/^[a-f\d]{64}$/i.test(signature)) {
        return false;
    }

    const expectedSignature = createHmac(
        "sha256",
        config.RAZORPAY_KEY_SECRET
    )
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    return timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex")
    );
};
