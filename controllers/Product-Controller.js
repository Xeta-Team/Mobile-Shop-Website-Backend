import { Product, Variant } from '../models/Add-product-model.js';
import mongoose from 'mongoose';



export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product ID format." });
        }

        const product = await Product.findById(productId).populate('variants');

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate('variants');
        
        res.status(200).json({
            message: "Products fetched successfully.",
            count: products.length,
            products: products
        });

    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const categoryName = req.params.category;
        const products = await Product.find({ category: new RegExp(`^${categoryName}$`, 'i') }).populate('variants');

        if (!products || products.length === 0) { 
            return res.status(404).json({ message: `No products found for category: ${categoryName}` });
        }
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};




export const getLatestPhones = async (req, res) => {
    try {
        const latestPhones = await Product.find({
            category: { $in: ['iPhone', 'other Phone', 'Mobile Phone'] }
        })
        .sort({ createdAt: -1 })
        .limit(5) 
        .populate('variants');

        res.status(200).json({ firstFiveDevices: latestPhones });

    } catch (error) {
        console.error("Error fetching latest phones:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};


export const addProductVariant = async (req, res) => {
    try {
        const {
            name, brand, description, category, base_image, sku,
            image_url, colorName, colorHex, storage, condition, packaging, price, stock_quantity
        } = req.body;

        const productExists = await Product.findOne({ name, brand });
        if (!productExists && !base_image) {
            return res.status(400).json({
                message: "A base image is required when creating a new product for the first time."
            });
        }

        
        const parentProduct = await Product.findOneAndUpdate(
            { name, brand },
            { $setOnInsert: { name, brand, description, category, base_image } },
            { upsert: true, new: true, runValidators: true }
        );

        
        const existingVariant = await Variant.findOne({ sku });
        if (existingVariant) {
            return res.status(409).json({
                message: `A variant with SKU "${sku}" already exists. SKUs must be unique.`
            });
        }

        
        const newVariant = new Variant({
            product: parentProduct._id,
            sku, image_url, colorName, colorHex, storage,
            condition, packaging, price, stock_quantity
        });
        await newVariant.save();

        
        parentProduct.variants.push(newVariant._id);
        await parentProduct.save();

        res.status(201).json({
            message: `Successfully added variant "${sku}" to product "${name}".`,
            product: parentProduct,
            variant: newVariant
        });

    } catch (error) {
        console.error("Error adding product variant:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};


export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, brand, description, category, variants } = req.body;

        
        const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { name, brand, description, category },
    { new: true, runValidators: true }
);

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        
        const variantIds = [];
for (const variantData of variants) {
    if (variantData._id) {
        
        await Variant.findByIdAndUpdate(variantData._id, variantData);
        variantIds.push(variantData._id);
    } else {
        
        const newVariant = new Variant({ ...variantData, product: productId });
        await newVariant.save();
        variantIds.push(newVariant._id);
    }
}

        
const variantsToDelete = await Variant.find({ product: productId, _id: { $nin: variantIds } });
if (variantsToDelete.length > 0) {
    const idsToDelete = variantsToDelete.map(v => v._id);
    await Variant.deleteMany({ _id: { $in: idsToDelete } });
}

        
        updatedProduct.variants = variantIds;
        await updatedProduct.save();
        res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        
        if (product.variants && product.variants.length > 0) {
            await Variant.deleteMany({ _id: { $in: product.variants } });
        }

        
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: "Product and all its variants were deleted successfully." });

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};