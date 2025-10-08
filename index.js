import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import productRouter from "./routes/Product-Router.js";
import userRouter from "./routes/User-Router.js";
import authRouter from "./routes/Auth-Router.js";
import orderRouter from './routes/Order-Router.js';
import reviewRouter from "./routes/Review-Router.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Database Connection ---
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB connection established successfully");
});

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- API Routes ---
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);


// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

