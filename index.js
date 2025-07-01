import dotenv from "dotenv"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"

dotenv.config()

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.listen(3001, () => {
    console.log("Server is runing on port 3001")
})
