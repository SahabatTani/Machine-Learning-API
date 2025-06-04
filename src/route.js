const { Router } = require("express")
const Handler = require("./handler")
const Service = require("./service")
const { uploadMiddleware, authMiddleware } = require("./middleware")

const router = db => {
    const service = new Service(db)
    const handler = new Handler(service)
    const route = Router()

    route.post("/api/public-predict", uploadMiddleware.single("image"), handler.publicPredict)
    route.post("/api/predict", authMiddleware, uploadMiddleware.single("image"), handler.predict)
    route.get("/api/histories", authMiddleware, handler.getHistories)
    route.delete("/api/histories/:id", authMiddleware, handler.deleteHistory)

    return route
}

module.exports = router