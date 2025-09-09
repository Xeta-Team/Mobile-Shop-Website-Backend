import express from "express"
import { addProduct,getAllProducts , getProductDetails, getRecentMobilePhones, updateProduct } from "../controllers/Product-Controller.js"; 

let productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/latestPhones", getRecentMobilePhones);
productRouter.get("/:productId", getProductDetails);
productRouter.put("/update", updateProduct);
productRouter.post("/addProduct", addProduct);
productRouter.delete("/:idS", addProduct);

export default productRouter;

