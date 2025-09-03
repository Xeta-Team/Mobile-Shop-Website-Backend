import express from "express"
import { addProduct,getAllProducts , updateProduct } from "../controllers/Product-Controller.js"; 

let productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.put("/update", updateProduct);
productRouter.post("/addProduct", addProduct);
productRouter.delete("/:idS", addProduct);

export default productRouter;

