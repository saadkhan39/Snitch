import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";



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

            if (
                quantityInCart +
                Number(quantity) >
                stock
            ) {
                return res.status(400).json({
                    message:
                        `Only ${stock} items left in stock. ` +
                        `You already have ${quantityInCart} ` +
                        `items in your cart`,
                    success: false
                });
            }


            // ----------------------------------------------
            // UPDATE QUANTITY
            // ----------------------------------------------

            existingItem.quantity =
                quantityInCart +
                Number(quantity);


            await cart.save();


            return res.status(200).json({
                message: "Cart updated successfully",
                success: true
            });
        }


        // ==================================================
        // NEW ITEM
        // ==================================================

        if (Number(quantity) > stock) {
            return res.status(400).json({
                message:
                    `Only ${stock} items left in stock`,
                success: false
            });
        }


        // ==================================================
        // PUSH NEW ITEM
        // ==================================================

        cart.items.push({

            product: productId,

            variant: variantId,

            selectedAttributes:
                normalizedAttributes,

            quantity: Number(quantity),

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


        let cart = await cartModel
            .findOne({
                user: user._id
            })
            .populate("items.product");


        // ==================================================
        // CREATE EMPTY CART IF NOT EXISTS
        // ==================================================

        if (!cart) {

            cart = await cartModel.create({
                user: user._id,
                items: []
            });
        }


        return res.status(200).json({

            message:
                "Cart fetched successfully",

            success: true,

            cart
        });


    } catch (error) {

        console.error(
            "Get cart error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch cart",

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

    const stock = await stockOfVariant(productId, variantId)

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
            success: false
        })
    }

    await cartModel.findOneAndUpdate(
        { user: req.user._id, "items.product": productId, "items.variant": variantId },
        { $inc: { "items.$.quantity": 1 } },
        { new: true }
    )

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


