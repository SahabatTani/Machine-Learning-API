class BadRequestError extends Error {
    constructor(message){
        super(message)
        this.statusCode = 400
    }
}

class UnauthorizeError extends Error {
    constructor(message){
        super(message)
        this.statusCode = 401
    }
}

class NotFoundError extends Error {
    constructor(message){
        super(message)
        this.statusCode = 404
    }
}

class ForbiddenError extends Error {
    constructor(message){
        super(message)
        this.statusCode = 403
    }
}

module.exports = { BadRequestError, UnauthorizeError, NotFoundError, ForbiddenError }