const multer = require('multer')
const { UnauthorizeError } = require('./errors')
const { verify } = require('jsonwebtoken')

const uploadMiddleware = multer()

const authMiddleware = async(req, res, next) => {
    try {
        const authorization = req.header("Authorization")

        if (!authorization){
            const error = new UnauthorizeError("Token tidak ditemukan")
            
            return res.status(error.statusCode).json({
                status: "fail",
                message: error.message
            })
        }
        
        const token = authorization.split(" ")[1]

        if (!token){
            const error = new UnauthorizeError("Token tidak ditemukan")
            
            return res.status(error.statusCode).json({
                status: "fail",
                message: error.message
            })
        }
        
        const payload = verify(token, process.env.ACCESS_TOKEN_KEY)

        res.locals.user_id = payload.id

        next()
    } catch(error){
        next(error)
    }
}

const errorHandlerMiddleware = async(err, _, res, __) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    return res.status(statusCode).json({
        status: "fail",
        message,
    })
}

module.exports = { uploadMiddleware, authMiddleware, errorHandlerMiddleware }