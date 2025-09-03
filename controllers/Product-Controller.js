import express from "express";
import Product from "../models/Add-product-model.js";
import bodyParser from "body-parser";



export function addProduct(req, res) 
{
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


export function getAllProducts(req, res)
{
    Product.find().then
    (
        (result) =>
        {
            res.status(200).json(result)
        }
    ).catch
    (
        (err) =>
        {
            res.json
            (
                {
                    "message" : "An error occured"
                }
            )
        }
    )
}

export async function updateProduct(req, res)
{
    const { id } = req.params.id; // <-- get id from URL
    console.log("Product ID:", id);
    console.log(id);

    const data = req.body;

    const updatedProduct = Product.findByIdAndUpdate(
        id,
        data,
        { new: true , runValidators: true}

    ).then
    (
        (result) => 
            {
                res.status(200).json
                (
                    {
                        "message" : "Product updated successfully",
                        "product" : result
                    }
                )
            }
    ).catch
    (
        (err) => 
        {
            res.json
            (
                {
                    "message" : "An error occured"
                }
            )
        }
    )
}

export async function deleteProduct(req,res)
{
    try{
        const { id } = req.params; // <-- get id from URL

        const deletedProduct = Product.findByIdAndDelete(id);

        if(!deleteProduct){
            return res.status(404).json({ "message":"Product not found", deletedProduct });
        } 

        res.status(404).json({ message: "Deleted succesfully "});
        }catch{

            console.error("Error deleting product");
            res.status(500).json({ error : "Internal server error" });

    }
    
    
} 
   
