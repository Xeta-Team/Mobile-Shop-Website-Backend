import dotenv from "dotenv"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import mongoose from "mongoose"
import productRouter from "./routes/Product-Router.js"
import userRouter from "./routes/User-Router.js"


dotenv.config()

let mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);

let connection = mongoose.connection;

connection.once("open", ()=>
{
    console.log("MongoDB connection established successfully")
})

dotenv.config()

const app = express()

app.use(cors())
app.use(bodyParser.json())
// app.use((req, res, next) => {
    
//     let token = req.header
//     ("Authorization")
//     console.log(token)
// })
app.use("/api/products", productRouter)
app.use("/api/users", userRouter)




app.listen(3001, () => {
    console.log("Server is runing on port 3001")
})
