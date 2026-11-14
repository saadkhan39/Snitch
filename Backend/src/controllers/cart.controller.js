import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { createOrder, verifyPaymentSignature } from "../services/payment.service.js";
import paymentModel from "../models/payment.model.js";
import { config } from "../config/config.js";


async function getCartDetails(userId) {
      let cart = (await cartModel.aggregate([
            {
                $match: {
                    user: userId
                }
            },
            { $unwind: { path: "$items" } },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "items.product"
                }
            },
            { $unwind: { path: "$items.product" } },
            {
                $unwind: {
                    path: "$items.product.variants"
                }
            },
            {
                $match: {
                    $expr: {
                        $eq: [
                            "$items.variant",
                            "$items.product.variants._id"
                        ]
                    }
                }
            },
            {
                $addFields: {
                    itemPrice: {
                        price: {
                            $multiply: [
                                "$items.quantity",
                                {
                                    $ifNull: [
                                        "$items.product.variants.price.amount",
                                        "$items.product.price.amount"
                                    ]
                                }
                            ]
                        },
                        currency: {
                            $ifNull: [
                                "$items.product.variants.price.currency",
                                "$items.product.price.currency"
                            ]
                        }
                    }
                }
            },
            {
                $set: {
                    "items.product.variants": [
                        "$items.product.variants"
                    ]
                }
            },
            {
                $group: {
                    _id: "$_id",
                    totalPrice: { $sum: "$itemPrice.price" },
                    currency: {
                        $first: "$itemPrice.currency"
                    },
                    items: { $push: "$items" }
                }
            }
        ]))[0];

        return cart;
}

export const addToCart = async (req, res) => {
    try {

        const { productId, variantId } = req.params;

        const {
            quantity = 1,
            selectedAttributes = {}
        } = req.body;


        // ==================================================
        // FIND PRODUCT + VARIANT
        // ==================================================

        const product = await productModel.findOne({
            _id: productId,
            "variants._id": variantId
        });


        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found",
                success: false
            });
        }


        // ==================================================
        // FIND SELECTED VARIANT
        // ==================================================

        const selectedVariant =
            product.variants.id(variantId);


        if (!selectedVariant) {
            return res.status(404).json({
                message: "Variant not found",
                success: false
            });
        }


        // ==================================================
        // GET STOCK
        // ==================================================

        const stock = await stockOfVariant(
            productId,
            variantId
        );

        const requestedQuantity = Number(quantity);

        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
                success: false
            });
        }


        // ==================================================
        // GET / CREATE CART
        // ==================================================

        const cart =
            (await cartModel.findOne({
                user: req.user._id
            })) ||
            (await cartModel.create({
                user: req.user._id,
                items: []
            }));

        const quantityInCartForVariant = cart.items.reduce(
            (total, item) => {
                const matchesVariant =
                    String(item.product) === String(productId) &&
                    String(item.variant) === String(variantId);

                return total + (matchesVariant ? Number(item.quantity) || 0 : 0);
            },
            0
        );

        if (quantityInCartForVariant + requestedQuantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock. You already have ${quantityInCartForVariant} in your cart`,
                success: false
            });
        }


        // ==================================================
        // NORMALIZE SELECTED ATTRIBUTES
        // ==================================================

        const normalizedAttributes = {};

        Object.entries(selectedAttributes || {}).forEach(
            ([key, value]) => {
                normalizedAttributes[
                    key.toString().trim()
                ] = value
                    ?.toString()
                    .trim();
            }
        );


        // ==================================================
        // CHECK IF SAME PRODUCT + VARIANT +
        // SAME SELECTED ATTRIBUTES ALREADY EXISTS
        // ==================================================

        const existingItemIndex =
            cart.items.findIndex((item) => {

                if (
                    item.product.toString() !==
                    productId.toString()
                ) {
                    return false;
                }


                if (
                    item.variant?.toString() !==
                    variantId.toString()
                ) {
                    return false;
                }


                const existingAttributes =
                    item.selectedAttributes
                        ? Object.fromEntries(
                            item.selectedAttributes
                        )
                        : {};


                const existingKeys =
                    Object.keys(existingAttributes);


                const newKeys =
                    Object.keys(
                        normalizedAttributes
                    );


                if (
                    existingKeys.length !==
                    newKeys.length
                ) {
                    return false;
                }


                return newKeys.every((key) => {

                    const existingKey =
                        existingKeys.find(
                            (existingKey) =>
                                existingKey
                                    .toLowerCase()
                                    .trim() ===
                                key
                                    .toLowerCase()
                                    .trim()
                        );


                    if (!existingKey) {
                        return false;
                    }


                    return (
                        existingAttributes[
                            existingKey
                        ]?.toString()
                            .trim()
                            .toLowerCase() ===
                        normalizedAttributes[
                            key
                        ]?.toString()
                            .trim()
                            .toLowerCase()
                    );
                });
            });


        // ==================================================
        // EXISTING ITEM
        // ==================================================

        if (existingItemIndex !== -1) {

            const existingItem =
                cart.items[existingItemIndex];


            const quantityInCart =
                Number(existingItem.quantity) || 0;


            // ----------------------------------------------
            // CHECK STOCK
            // ----------------------------------------------

            // ----------------------------------------------
            // UPDATE QUANTITY
            // ----------------------------------------------

            existingItem.quantity =
                quantityInCart +
                requestedQuantity;


            await cart.save();


            return res.status(200).json({
                message: "Cart updated successfully",
                success: true
            });
        }


        // ==================================================
        // NEW ITEM
        // ==================================================

        // ==================================================
        // PUSH NEW ITEM
        // ==================================================

        cart.items.push({

            product: productId,

            variant: variantId,

            selectedAttributes:
                normalizedAttributes,

            quantity: requestedQuantity,

            // IMPORTANT:
            // Use selected variant price
            price:
                selectedVariant.price ||
                product.price
        });


        await cart.save();


        return res.status(200).json({
            message:
                "Product added to cart successfully",
            success: true
        });


    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );


        return res.status(500).json({
            message:
                "Failed to add product to cart",
            success: false,
            error: error.message
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = req.user;
      
      let cart = await getCartDetails(user._id); 

        // An empty cart has no rows after unwinding items.
        if (!cart) {
            let emptyCart = await cartModel.findOne({
                user: user._id
            });

            if (!emptyCart) {
                emptyCart = await cartModel.create({
                    user: user._id,
                    items: []
                });
            }

            cart = emptyCart.toObject();
        }

        // Add current price information to every cart item
        cart.items = cart.items.map((item) => {

            const product = item.product;

            if (!product) {
                return item;
            }

            // -----------------------------------------
            // FIND CURRENT VARIANT
            // -----------------------------------------

            let currentPrice = product.price;

            if (item.variant && product.variants?.length) {

                const currentVariant =
                    product.variants.find(
                        (variant) =>
                            String(variant._id) ===
                            String(item.variant)
                    );

                if (currentVariant?.price) {
                    currentPrice = currentVariant.price;
                }
            }

            // -----------------------------------------
            // PRICE CHANGE
            // -----------------------------------------

            const oldAmount =
                Number(item.price?.amount ?? 0);

            const currentAmount =
                Number(currentPrice?.amount ?? 0);

            let priceChange = null;

            if (currentAmount > oldAmount) {

                priceChange = {
                    type: "increased",
                    amount: currentAmount - oldAmount
                };

            } else if (currentAmount < oldAmount) {

                priceChange = {
                    type: "decreased",
                    amount: oldAmount - currentAmount
                };
            }

            return {
                ...item,

                // Price when item was added
                price: item.price,

                // Current product/variant price
                currentPrice,

                // Price change information
                priceChange
            };
        });

        return res.status(200).json({
            message: "Cart fetched successfully",
            success: true,
            cart: cart
        });

    } catch (error) {

        console.error(
            "Get cart error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch cart",
            success: false,
            error: error.message
        });
    }
};

export const deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await cartModel.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        String(item._id) === String(itemId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });

  } catch (error) {

    console.error(
      "DELETE CART ITEM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete cart item",
      error: error.message,
    });
  }
};

export const incrementCartItemQuantity = async (req, res) => {
    const { productId, variantId } = req.params

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    const cart = await cartModel.findOne({ user: req.user._id })

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        })
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
        return res.status(404).json({
            message: "Variant not found",
            success: false
        });
    }

    const updatedCart = await cartModel.findOneAndUpdate(
        {
            user: req.user._id,
            items: {
                $elemMatch: {
                    product: product._id,
                    variant: variant._id
                }
            },
            $expr: {
                $lt: [
                    {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$items",
                                        as: "cartItem",
                                        cond: {
                                            $and: [
                                                { $eq: ["$$cartItem.product", product._id] },
                                                { $eq: ["$$cartItem.variant", variant._id] }
                                            ]
                                        }
                                    }
                                },
                                as: "cartItem",
                                in: "$$cartItem.quantity"
                            }
                        }
                    },
                    variant.stock
                ]
            }
        },
        { $inc: { "items.$.quantity": 1 } },
        { new: true }
    );

    if (!updatedCart) {
        return res.status(400).json({
            message: "Cart item not found or stock limit reached",
            success: false
        });
    }

    return res.status(200).json({
        message: "Cart item quantity incremented successfully",
        success: true
    })
}

export const decrementCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const cart = await cartModel.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        String(item.product) === String(productId) &&
        String(item.variant) === String(variantId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const item = cart.items[itemIndex];

    // If quantity is 1, remove the item
    if (item.quantity <= 1) {
      cart.items.splice(itemIndex, 1);

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
        cart,
      });
    }

    // Decrease quantity by 1
    item.quantity -= 1;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart item quantity decreased",
      cart,
    });
  } catch (error) {
    console.error(
      "DECREMENT CART ITEM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to decrease cart item quantity",
      error: error.message,
    });
  }
};

export const createOrderController = async (req, res) => {
    try {

     const cart = await getCartDetails(req.user._id);

     if(!cart || cart.items.length === 0){
        return res.status(400).json({
            message: "Cart is empty",
            success: false
        });     
     }
     
        const amount = Number(cart.totalPrice);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Cart total is invalid",
                success: false
            });
        }

        const currency = cart.currency || "INR";
        const order = await createOrder(amount, currency);

        await paymentModel.create({
        user: req.user._id,
        razorpay: {
            orderId: order.id,
        },
        price: {
            amount: cart.totalPrice,
            currency: cart.currency
        },
        orderItems: cart.items.map(item => {
            const variant = item.product.variants?.[0];
            const itemPrice = variant?.price || item.product.price;

            return {
                title: item.product.title,
                productId: item.product._id,
                variantId: item.variant,
                quantity: item.quantity,
                images: variant?.images?.length
                    ? variant.images
                    : item.product.images,
                description: item.product.description,
                price: {
                    amount: itemPrice.amount,
                    currency: itemPrice.currency || currency
                }
            };
        })
    });

   

        return res.status(200).json({   
        message: "Order created successfully",
        success: true,
        keyId: config.RAZORPAY_KEY_ID,
        order
        });
    }   catch (error) { 

        console.error("CREATE ORDER ERROR:", error);

        return res.status(500).json({
            message: "Failed to create order",
            success: false,
            error: error.message
        });
    }       
};

export const verifyCartPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature
        } = req.body;

        if (
            typeof orderId !== "string" ||
            typeof paymentId !== "string" ||
            typeof signature !== "string"
        ) {
            return res.status(400).json({
                message: "Missing payment verification details",
                success: false
            });
        }

        const payment = await paymentModel.findOne({
            user: req.user._id,
            "razorpay.orderId": orderId
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment order not found",
                success: false
            });
        }

        if (payment.status === "paid") {
            await cartModel.updateOne(
                { user: req.user._id },
                { $set: { items: [] } }
            );

            return res.status(200).json({
                message: "Payment already verified",
                success: true
            });
        }

        const isValid = verifyPaymentSignature({
            orderId,
            paymentId,
            signature
        });

        if (!isValid) {
            return res.status(400).json({
                message: "Invalid payment signature",
                success: false
            });
        }

        payment.status = "paid";
        payment.razorpay.paymentId = paymentId;
        payment.razorpay.signature = signature;
        await payment.save();
        await cartModel.updateOne(
            { user: req.user._id },
            { $set: { items: [] } }
        );

        return res.status(200).json({
            message: "Payment verified successfully",
            success: true
        });
    } catch (error) {
        console.error("VERIFY PAYMENT ERROR:", error);

        return res.status(500).json({
            message: "Failed to verify payment",
            success: false
        });
    }
};

