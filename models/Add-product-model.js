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
      default: "https://images.unsplash.com/photo-1632582593957-e28f748ba619?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

