import productModel from "../models/product.model.js";
import { uploadFiles } from "../services/storage.service.js";

export async function createProduct(req,res){
        const {title,description,priceAmount,priceCurrency} = req.body
    const rawAttributes = req.body.attributes
    const attributes = typeof rawAttributes === "string"
        ? JSON.parse(rawAttributes)
        : rawAttributes || {}

        const seller = req.user

         const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFiles({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const product = await productModel.create({
        title,
        description,
        price:{
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        seller:seller._id,
        attributes,
        images
    })

     res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req,res){
    const seller = req.user

    const products = await productModel.find({seller:seller._id})

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}  

export async function getAllProduct(req, res) {
    const { search } = req.query;

    const filter = {};

    if (search?.trim()) {
        filter.$or = [
            {
                title: {
                    $regex: search.trim(),
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: search.trim(),
                    $options: "i"
                }
            }
        ];
    }

    const products = await productModel.find(filter);

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    });
}
export async function getProductDetails(req,res){
    const { id } = req.params

    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}

export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files || [];
    const images = [];
    if (files.length > 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFiles({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    console.log(price)

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })

}

export async function updateProductVariant(req, res) {
    try {
        const { productId, variantId } = req.params;

        let {
            stock,
            attributes,
            price,
            priceCurrency
        } = req.body;

        console.log("========== UPDATE VARIANT ==========");
        console.log("productId:", productId);
        console.log("variantId:", variantId);
        console.log("req.body:", req.body);
        console.log("====================================");

        // Find product owned by logged-in seller
        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find variant
        const variant = product.variants.id(variantId);

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        // -----------------------------
        // UPDATE STOCK
        // -----------------------------
        if (stock !== undefined && stock !== "") {
            variant.stock = Number(stock);
        }

        // -----------------------------
        // UPDATE ATTRIBUTES
        // -----------------------------
        if (attributes !== undefined) {

            if (typeof attributes === "string") {
                try {
                    attributes = JSON.parse(attributes);
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid attributes format"
                    });
                }
            }

            const cleanAttributes = {};

            Object.entries(attributes || {}).forEach(([key, value]) => {
                const cleanKey = String(key).trim();
                const cleanValue = String(value).trim();

                if (cleanKey && cleanValue) {
                    cleanAttributes[cleanKey] = cleanValue;
                }
            });

            variant.attributes = cleanAttributes;
        }

        // -----------------------------
        // UPDATE PRICE
        // -----------------------------
        if (price !== undefined && price !== "") {

            const numericPrice = Number(price);

            if (Number.isNaN(numericPrice) || numericPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid price"
                });
            }

            variant.price = {
                amount: numericPrice,
                currency:
                    priceCurrency ||
                    variant.price?.currency ||
                    product.price?.currency ||
                    "INR"
            };
        }

        // Save
        await product.save();

        console.log("Variant updated successfully");

        return res.status(200).json({
            success: true,
            message: "Variant updated successfully",
            product,
            variant
        });

    } catch (error) {

        console.error("====================================");
        console.error("UPDATE VARIANT ERROR");
        console.error(error);
        console.error("MESSAGE:", error.message);
        console.error("STACK:", error.stack);
        console.error("====================================");

        return res.status(500).json({
            success: false,
            message: "Failed to update variant",
            error: error.message
        });
    }
}

export async function deleteProductVariant(req, res) {
    try {
        const { productId, variantId } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            });
        }

        const variant = product.variants.id(variantId);

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found",
                success: false
            });
        }

        variant.deleteOne();

        await product.save();

        return res.status(200).json({
            message: "Variant deleted successfully",
            success: true,
            product
        });

    } catch (error) {
        console.error("Delete variant error:", error);

        return res.status(500).json({
            message: "Failed to delete variant",
            success: false,
            error: error.message
        });
    }
}