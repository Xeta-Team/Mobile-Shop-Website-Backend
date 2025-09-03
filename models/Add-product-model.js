import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productDescription: {
      type: String,
      required: true,
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    variants: [
      {
        colorName: { type: String, required: true },
        colorHex: { type: String, required: true },
        storage: { type: String, required: true },
        stock: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    productCategory: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String, 
        required: true,
      },
    ],
    mainImage: {
      type: String, 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

