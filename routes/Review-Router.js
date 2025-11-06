import express from "express";
import { submitReview } from "../controllers/Review-Controller.js";

let reviewRouter = express.Router();

reviewRouter.post("/submitReview", submitReview);

export default reviewRouter;