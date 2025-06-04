const { loadModel } = require("./model/model")
const { preprocessImage, predictResponse, historyWithNoDiseaseResponse, historyWithDiseaseResponse } = require("./utils")
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

        const prediction = model.predict(imageTensor)
        const result = await prediction.array()

        const predictionArray = result[0]
        const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
        const predictedClass = classes[plant][maxIndex]

        if (predictedClass === "Healthy"){
            return predictedClass
        }

        const disease = await this.getDiseaseByName(predictedClass)

        return predictResponse(disease)
    }

    async predict(file, { user_id, plant, latitude, longitude }){
        const model = await loadModel(plant)
        const size = model.inputs[0].shape[1]

        const imageTensor = await preprocessImage(file.buffer, size)

        const prediction = model.predict(imageTensor)
        const result = await prediction.array()

        const predictionArray = result[0]
        const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
        const predictedClass = classes[plant][maxIndex]

        const history = await this.addHistory(file, { user_id, prediction: predictedClass === "Healthy" ? null : predictedClass, latitude, longitude })

        return history
    }

    async getHistories(user_id){
        const query = {
            text: "SELECT * FROM history WHERE user_id = $1",
            values: [user_id]
        }
        const result = await this._db.query(query)

        return result.rows
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

    async addHistory(file, { user_id, prediction, latitude, longitude }){
        const image_url = await this.addImage(file)
        const id = uuid()
        const createdAt = new Date()
        
        const query = {
            text: "INSERT INTO history(id, user_id, latitude, longitude, disease, image_url, created_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            values: [id, user_id, latitude, longitude, prediction, image_url, createdAt]
        }
        const result = await this._db.query(query)

        if (!result.rows[0].id){
            throw new Error("error")
        } 

        const history = result.rows[0]
        const user = await this.getUserById(user_id)

        if (!prediction){
            return historyWithNoDiseaseResponse(history, user)
        }
        const disease = await this.getDiseaseByName(prediction)

        return historyWithDiseaseResponse(history, user, disease)
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

    async getDiseaseByName(name){
        const query = {
            text: "SELECT * FROM disease WHERE name = $1",
            values: [name]
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