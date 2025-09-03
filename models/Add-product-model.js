import express from "express"
import mongoose from "mongoose" 

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productType: {
      type: String,
      enum: ["iPhone", "iPad", "MacBook", "Apple Watch", "AirPods", "Accessory"],
      required: true,
    },
    productBrand: {
      type: String,
      default: "Apple", // since your shop only sells Apple
      immutable: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    colors: [
      {
        type: String,
        enum: ["Black", "White", "Silver", "Gold", "Space Gray", "Blue", "Red", "Green", "Pink", "Purple"], // Apple colors
      },
    ],
    storageOptions: [
      {
        type: String, // like "64GB", "128GB", "256GB", "512GB", "1TB"
      },
    ],
    images: [
      {
        type: String, // URLs of product images
      },
    ],
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

let Product = mongoose.model("Product", productSchema);

export default Product;
