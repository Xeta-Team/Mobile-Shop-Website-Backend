import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// --- Import all of your API routers ---
import productRouter from "./routes/Product-Router.js";
import userRouter from "./routes/User-Router.js";
import authRouter from "./routes/Auth-Router.js";

dotenv.config();

const app = express();
const port = 3001;

// --- Database Connection ---
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB connection established successfully");
});

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- API Routes ---
// Connect your routers to the main application
// Any request to "/api/products" will be handled by productRouter
app.use("/api/products", productRouter);

// Any request to "/api/users" will be handled by userRouter (e.g., standard registration)
app.use("/api/users", userRouter);

// Any request to "/api/auth" will be handled by authRouter (e.g., Google OAuth)
app.use("/api/auth", authRouter);


// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server is running on port ${3001}`);
});
