require("dotenv").config()
const express = require("express")
const cors = require("cors")
const DB = require("./db")
const router = require("./route")
const { errorHandlerMiddleware } = require("./middleware")

const app = express()
app.use(cors())

const db = DB()
app.use(router(db))
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})