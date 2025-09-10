import express from "express"
import { addProduct,getAllProducts , updateProduct, deleteProduct, getProductById } from "../controllers/Product-Controller.js"; 

let productRouter = express.Router();

productRouter.get("/all", getAllProducts);
productRouter.get("/single/:id", getProductById);
productRouter.put("/update/:id", updateProduct);
productRouter.post("/addProduct", addProduct);
productRouter.delete("/delete/:id", deleteProduct);

export default productRouter;

