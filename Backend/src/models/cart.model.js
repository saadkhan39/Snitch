import mongoose from "mongoose";
import priceSchema from "./priceSchema.js";

const cartSchema = new mongoose.Schema({

  // ============================================
  // USER
  // ============================================

  user: {

    type:
      mongoose.Schema.Types.ObjectId,

    ref: "user",

    required: true,

  },


  // ============================================
  // CART ITEMS
  // ============================================

  items: [

    {

      // ========================================
      // PRODUCT
      // ========================================

      product: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "product",

        required: true,

      },


      // ========================================
      // VARIANT
      // ========================================

      variant: {

        type:
          mongoose.Schema.Types.ObjectId,

      },


      // ========================================
      // EXACT USER SELECTION
      // ========================================

      selectedAttributes: {

        type: Map,

        of: String,

        default: {},

      },


      // ========================================
      // QUANTITY
      // ========================================

      quantity: {

        type: Number,

        default: 1,

        min: 1,

      },


      // ========================================
      // PRICE AT TIME OF ADDING
      // ========================================

      price: {

        type: priceSchema,

        required: true,

      },

    },

  ],

});


const cartModel =
  mongoose.model(
    "cart",
    cartSchema
  );


export default cartModel;

