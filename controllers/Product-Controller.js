import express from "express";
import Product from "../models/Add-product-model.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";

export function addProduct(req, res) {
    const newProductData = req.body;
    const product = new Product(newProductData);

    product.save()
        .then(savedProduct => {
            res.status(201).json({
                message: "Product added successfully",
                product: savedProduct
            });
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                console.error("Validation Error:", err.message);
                return res.status(400).json({
                    message: "Failed to add product due to validation errors.",
                    errors: err.errors
                });
            }
            console.error("Server Error:", err);
            res.status(500).json({
                message: "An internal server error occurred."
            });
        });
}

export function getAllProducts(req, res) {
    Product.find()
        .then((result) => {
            const formattedProducts = result.map((product) => ({
                id: product._id,
                name: product.productName,
                category: product.productCategory,
                colors: product.variants.map(v => ({
                    name: v.colorName,
                    hex: v.colorHex
                })),
                status: product.variants.some(v => v.stock > 0) ? "Available" : "Out of Stock",
                price: product.productPrice,
                imageUrl: product.mainImage || (product.images && product.images[0]),
                description: product.productDescription
            }));
            res.status(200).json(formattedProducts);
        })
        .catch((err) => {
            console.error("Error fetching all products:", err);
            res.status(500).json({
                "message": "An error occurred while fetching products."
            });
        });
}

export function getProductById(req, res) {
    const { id } = req.params;
    Product.findById(id)
        .then((product) => {
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.status(200).json(product);
        })
        .catch((err) => {
            console.error(`Error fetching product by ID (${id}):`, err);
            res.status(500).json({ message: "An error occurred", error: err.message });
        });
}

// =======================================================
// CORRECTED FUNCTION
// =======================================================
export async function updateProduct(req, res) {
    try {
        // 1. Correctly get the 'id' string from req.params object
        const { id } = req.params;
        const updateData = req.body;

        // 2. Use 'await' to wait for the database operation to complete.
        // The 'result' will now be the actual updated document or null.
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        // 3. Check if a product was found and updated.
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 4. Send the updated product data, which is a clean object.
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        // 5. Add error handling for database or other potential errors.
        console.error("Error updating product:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
}


export async function deleteProduct(req, res) {
    try {
        let { id } = req.params;
        id = id.trim();

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Deleted successfully", deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
