const Jimp = require('jimp');
const tf = require('@tensorflow/tfjs-node');

async function preprocessImage(buffer, size) {
    const image = await Jimp.read(buffer)
    image.resize(size, size)
    
    const resizedBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
    const tensor = tf.node.decodeImage(resizedBuffer, 3)
    return tensor.div(255.0).expandDims(0)
}

const predictResponse = disease => {
    return {
        name: disease.name,
        reason: disease.reason,
        indication: disease.indication,
        solution: disease.solution,
        plant: disease.plant,
        mediecene: disease.mediecene
    }
}

const historyWithDiseaseResponse = (history, user, disease) => {
    return {
        id: history.id,
        image_url: history.image_url,
        latitude: history.latitude,
        longitude: history.longitude,
        user: {
            fullname: user.fullname
        },
        prediction: {
            disease_name: disease.name,
            reason: disease.reason,
            indication: disease.indication,
            solution: disease.solution,
            plant: disease.plant,
            mediecene: disease.mediecene
        }
    }
}

const historyWithNoDiseaseResponse = (history, user) => {
    return {
        id: history.id,
        image_url: history.image_url,
        latitude: history.latitude,
        longitude: history.longitude,
        user: {
            fullname: user.fullname
        },
        prediction: "Healthy"
    }
}

module.exports = { preprocessImage, predictResponse, historyWithDiseaseResponse, historyWithNoDiseaseResponse }
