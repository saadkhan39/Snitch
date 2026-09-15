import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const heroModel = mongoose.model("hero", heroSchema);

export default heroModel;