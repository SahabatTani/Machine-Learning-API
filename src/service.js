const { loadModel } = require("./model/model")
const { preprocessImage, publicPredictResponse, historyResponse } = require("./utils")
const classes = require("./model/classes")
const { createClient } = require('@supabase/supabase-js');
const { v4: uuid } = require("uuid")
const path = require("path");
const { NotFoundError, ForbiddenError } = require("./errors");

class Service {
    constructor(db){
        this._db = db
        this._supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        )
        this._bucket = process.env.SUPABASE_BUCKET
        this._dir = "histories"
        this._public_url_prefix = process.env.SUPABASE_PUBLIC_URL_PREFIX
    }

    async publicPredict(file, plant){
        const model = await loadModel(plant)
        const size = model.inputs[0].shape[1]

        const imageTensor = await preprocessImage(file.buffer, size)

        const predict = model.predict(imageTensor)
        const result = await predict.array()

        const predictArray = result[0]
        const maxIndex = predictArray.indexOf(Math.max(...predictArray))
        const predictedClass = classes[plant][maxIndex]
        console.log(predictedClass)

        const prediction = await this.getPrediction(predictedClass)

        return publicPredictResponse(prediction)
    }

    async predict(file, { user_id, plant, latitude, longitude }){
        const model = await loadModel(plant)
        const size = model.inputs[0].shape[1]

        const imageTensor = await preprocessImage(file.buffer, size)

        const predict = model.predict(imageTensor)
        const result = await predict.array()

        const predictArray = result[0]
        const maxIndex = predictArray.indexOf(Math.max(...predictArray))
        const predictedClass = classes[plant][maxIndex]

        const history = await this.addHistory(file, { user_id, status: predictedClass, latitude, longitude })

        return history
    }

    async getHistoriesMap(){
        const query = "SELECT * FROM history"
        const result = await this._db.query(query)
        
        const historyList = await Promise.all(
            result.rows.map(async(row) => {
                const user = await this.getUserById(row.user_id)
                const prediction = await this.getPrediction(row.status)

                return historyResponse(row, user, prediction)
            })
        )

        return historyList
    }

    async getHistories(user_id){
        const query = {
            text: "SELECT * FROM history WHERE user_id = $1",
            values: [user_id]
        }
        const result = await this._db.query(query)

        const user = await this.getUserById(user_id)

        const historyList = await Promise.all(
            result.rows.map(async(row) => {
                const prediction = await this.getPrediction(row.status)
                return historyResponse(row, user, prediction)
            })
        )

        return historyList
    }

    async getHistoryById(id, user_id){
        const query = {
            text: "SELECT * FROM history WHERE id = $1",
            values: [id]
        }
        const result = await this._db.query(query)

        if (!result.rows.length){
            throw new NotFoundError("History tidak ditemukan")
        }

        if (result.rows[0].user_id !== user_id){
            throw new ForbiddenError("Pengguna tidak memiliki hak akses")
        }

        return result.rows[0]
    }

    async addHistory(file, { user_id, status, latitude, longitude }){
        const image_url = await this.addImage(file)
        const id = uuid()
        const createdAt = new Date()
        
        const query = {
            text: "INSERT INTO history(id, user_id, latitude, longitude, status, image_url, created_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            values: [id, user_id, latitude, longitude, status, image_url, createdAt]
        }
        const result = await this._db.query(query)

        if (!result.rows[0].id){
            throw new Error("error")
        } 

        const prediction = await this.getPrediction(status)

        return publicPredictResponse(prediction)
    }

    async deleteHistoryById(id, user_id){
        const history = await this.getHistoryById(id, user_id)
        await this.deleteImage(history.image_url)

        const query = {
            text: "DELETE FROM history WHERE id = $1",
            values: [id]
        }
        await this._db.query(query)
    }

    async getPrediction(status){
        const query = {
            text: "SELECT * FROM predictions WHERE status = $1",
            values: [status]
        }
        const result = await this._db.query(query)

        if (!result.rows.length){
            throw new NotFoundError("Penyakit tidak ditemukan")
        }

        return result.rows[0]
    }

    async getUserById(id){
        const query = {
            text: "SELECT fullname FROM users WHERE id = $1",
            values: [id]
        }
        const result = await this._db.query(query)

        if (!result.rows.length){
            throw new NotFoundError("Pengguna tidak ditemukan")
        }

        return result.rows[0]
    }

    async addImage(file){
        const fileExt = path.extname(file.originalname)
        const fileName = uuid() + fileExt

        const { data, error } = await this._supabase.storage.from(this._bucket).upload(`${this._dir}/${fileName}`, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        })

        if (error){
            throw new Error(error.message)
        }

        return data.path
    }

    async deleteImage(fileName){
        const { error } = await this._supabase.storage.from(this._bucket).remove(fileName)

        if (error){
            throw new Error(error.message)
        }
    }
}

module.exports = Service