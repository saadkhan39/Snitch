import productModel from "../models/product.model.js";
import { uploadFiles } from "../services/storage.service.js";

export async function createProduct(req,res){
        const {title,description,priceAmount,priceCurrency} = req.body

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

export async function getAllProduct(req,res){
    const products = await productModel.find()

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
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

export async function createProductVariant(req,res){
    const { productId } = req.params

    const product = await productModel.findOne({_id:productId,seller:req.user._id})

    if(!product){
        return res.status(404).json({
            message: "Product not found or you are not authorized to add variant",
            success: false
        })
    }

    const files = req.files 
    const images =[]

    if(files && files.length > 0){
        for(const file of files){
            const uploadedFile = await uploadFiles({
                buffer: file.buffer,
                fileName: file.originalname
            })
            images.push(uploadedFile)
        }
    }
    const price = req.body.priceAmount
    const stock = Number(req.body.stock) || 0
    const rawAttributes = req.body.attributes
    const attributes = typeof rawAttributes === "string"
        ? JSON.parse(rawAttributes)
        : rawAttributes || {}

    console.log(price,stock,attributes,images);

    product.variants.push({
        images,
        price:{
            amount :Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save()

      return res.status(201).json({
        message: "Product variant added successfully",
        success: true,
          variant: product.variants[product.variants.length - 1]
    })
    
}