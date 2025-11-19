import express from 'express';
import { authMiddleware } from '../controllers/authMiddleware.js'; 
const router = express.Router();


import { 
    getAllProducts,
    getLatestPhones,
    addProductVariant,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
} from '../controllers/Product-Controller.js';

router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);

router.get('/latestPhones', getLatestPhones);
router.get('/searchbar/products', getAllProducts);

router.post('/addProduct', authMiddleware, addProductVariant);

router.get('/:id', getProductById);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;

