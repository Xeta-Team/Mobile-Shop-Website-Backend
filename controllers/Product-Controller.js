import express from "express";
import Product from "../models/Add-product-model.js";
import bodyParser from "body-parser";



export function addProduct(req, res) 
{
    if(!req.user){  
        return res.status(401).json({ message: "Unauthorized" });
    }

    // if(!req.user.isAdmin) {
    //     return res.status(403).json({ message: "Forbidden: Admins only" });
    // }

    console.log(req.user);
        let newProduct = req.body;
        let product = new Product(newProduct);
        product.save().then(
            () => {
                res.status(200).json
                (   
                    {
                    "messaege" : "Product added successfully"
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
   
