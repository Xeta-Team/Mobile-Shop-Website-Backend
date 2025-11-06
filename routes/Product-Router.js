import express from 'express';
import { authMiddleware } from '../controllers/authMiddleware.js'; 
const router = express.Router();

// Import all your controller functions
import { 
    getAllProducts,
    getLatestPhones,
    addProductVariant,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsForSearch,
} from '../controllers/Product-Controller.js';

// --- Define Routes ---

// General GET routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/searchbar/products',getProductsForSearch);

// Specific GET route - MUST be before any dynamic routes like '/:id'
router.get('/latestPhones', getLatestPhones);

// POST route for adding a product
router.post('/addProduct', authMiddleware, addProductVariant);

// Dynamic routes that use an ID - These should come last
router.get('/:id', getProductById);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;

