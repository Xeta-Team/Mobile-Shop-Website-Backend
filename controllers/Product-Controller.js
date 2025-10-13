import { Product, Variant } from '../models/Add-product-model.js';
import mongoose from 'mongoose';


/**
 * @description Fetches a single product by its ID.
 * @route GET /api/products/:id
 * @access Public
 */
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
/**
 * @description Get all products and populate their variants.
 * @route GET /api/products
 * @access Public
 */
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
/**
 * @description Fetches products by their category.
 * @route GET /api/products/category/:category
 * @access Public
 */
export const getProductsByCategory = async (req, res) => {
    try {
        const categoryName = req.params.category;
        // Use a case-insensitive regex to match the category
        const products = await Product.find({ category: new RegExp(`^${categoryName}$`, 'i') }).populate('variants');

        if (!products) { // products can be an empty array, so check for that too if needed
            return res.status(404).json({ message: `No products found for category: ${categoryName}` });
        }
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};



/**
 * @description Get the 5 most recently added phones for the home page carousel.
 * @route GET /api/products/latestPhones
 * @access Public
 */
export const getLatestPhones = async (req, res) => {
    try {
        const latestPhones = await Product.find({
            category: { $in: ['iPhone', 'other Phone', 'Mobile Phone'] }
        })
        .sort({ createdAt: -1 })
        .limit(5) // Fetch only the 5 needed for the carousel
        .populate('variants');

        // The frontend expects an object with a 'firstFiveDevices' key.
        res.status(200).json({ firstFiveDevices: latestPhones });

    } catch (error) {
        console.error("Error fetching latest phones:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

/**
 * @description Adds a new product variant. If the parent product doesn't exist, it creates it first.
 * @route POST /api/products/addProduct
 * @access Private/Admin
 */
export const addProductVariant = async (req, res) => {
    try {
        const {
            name, brand, description, category, base_image, sku,
            image_url, colorName, colorHex, storage, condition, packaging, price, stock_quantity
        } = req.body;

        // Ensure a base image is provided when creating a brand-new product
        const productExists = await Product.findOne({ name, brand });
        if (!productExists && !base_image) {
            return res.status(400).json({
                message: "A base image is required when creating a new product for the first time."
            });
        }

        // Find the parent product by name and brand, or create it if it doesn't exist
        const parentProduct = await Product.findOneAndUpdate(
            { name, brand },
            { $setOnInsert: { name, brand, description, category, base_image } },
            { upsert: true, new: true, runValidators: true }
        );

        // Ensure the variant SKU is unique
        const existingVariant = await Variant.findOne({ sku });
        if (existingVariant) {
            return res.status(409).json({
                message: `A variant with SKU "${sku}" already exists. SKUs must be unique.`
            });
        }

        // Create and save the new variant
        const newVariant = new Variant({
            product: parentProduct._id,
            sku, image_url, colorName, colorHex, storage,
            condition, packaging, price, stock_quantity
        });
        await newVariant.save();

        // Add the new variant's ID to the parent product's variants array
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

/**
 * @description Updates an existing product and its variants.
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, brand, description, category, variants } = req.body;

        // Update the parent product's details
        const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { name, brand, description, category },
    { new: true, runValidators: true }
);

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Process all variants sent from the frontend
        const variantIds = [];
for (const variantData of variants) {
    if (variantData._id) {
        // If variant already exists, update it.
        await Variant.findByIdAndUpdate(variantData._id, variantData);
        variantIds.push(variantData._id);
    } else {
        // If it's new (no _id), create it.
        const newVariant = new Variant({ ...variantData, product: productId });
        await newVariant.save();
        variantIds.push(newVariant._id);
    }
}

        // Find and delete any variants that were removed on the frontend
const variantsToDelete = await Variant.find({ product: productId, _id: { $nin: variantIds } });
if (variantsToDelete.length > 0) {
    const idsToDelete = variantsToDelete.map(v => v._id);
    await Variant.deleteMany({ _id: { $in: idsToDelete } });
}

        // Update the product's variant list and save
        updatedProduct.variants = variantIds;
        await updatedProduct.save();
        res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
};

/**
 * @description Deletes a product and all of its associated variants.
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Delete all variants associated with the product
        if (product.variants && product.variants.length > 0) {
            await Variant.deleteMany({ _id: { $in: product.variants } });
        }

        // Delete the parent product itself
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: "Product and all its variants were deleted successfully." });

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const getProductsForSearch = async(request,response) => {
    try{
        const products = await Product.find({}, 'name base_image')
        .populate({
            path:'variants',
            select: 'price colorName',
            options: {sort:{price:1 }, limit: 1}
        }).lean()
        response.status(200).json(products)
    }catch(error){
        response.json(error)
    }
    
}
