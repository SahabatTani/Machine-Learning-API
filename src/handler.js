class Handler {
    constructor(service){
        this._service = service

        this.publicPredict = this.publicPredict.bind(this)
        this.predict = this.predict.bind(this)
        this.getHistories = this.getHistories.bind(this)
        this.deleteHistory = this.deleteHistory.bind(this)
    }

    async publicPredict(req, res, next){
        try {
            const { file } = req 
            const { plant } = req.body
            const prediction = await this._service.publicPredict(file, plant)

            return res.status(200).json({
                status: "success",
                data: { prediction }      
            })
        } catch(error){
            next(error)
        }
    }

    async predict(req, res, next){
        try {
            const { user_id } = res.locals
            const { file } = req 
            const { plant, latitude, longitude } = req.body
            const prediction = await this._service.predict(file, { user_id, plant, latitude, longitude })

            return res.status(200).json({
                status: "success",
                data: { prediction }      
            })
        } catch(error){
            next(error)
        }
    }

    async getHistories(_, res, next){
        try {
            const { user_id } = res.locals
            const histories = await this._service.getHistories(user_id)

            return res.status(200).json({
                status: "success",
                data: { histories }
            })
        } catch(error){
            next(error)
        }
    }

    async deleteHistory(req, res, next){
        try {
            const { user_id } = res.locals
            const { id } = req.params
            await this._service.deleteHistoryById(id, user_id)

            return res.status(200).json({
                status: "success"
            })
        } catch(error){
            next(error)
        }
    }
}

module.exports = Handler