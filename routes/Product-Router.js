import express from "express"
import { addProduct,deleteProduct,getAllProducts , getProductDetails, getRecentMobilePhones, updateProduct } from "../controllers/Product-Controller.js"; 
import { authMiddleware } from "../controllers/authMiddleware.js";

let productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/latestPhones", getRecentMobilePhones);
productRouter.get("/:productId", getProductDetails);
productRouter.put("/update/:id", updateProduct);
productRouter.post("/addProduct", addProduct);
productRouter.delete("/delete/:id", authMiddleware, deleteProduct);

export default productRouter;

