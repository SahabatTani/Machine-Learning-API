const Jimp = require('jimp');
const tf = require('@tensorflow/tfjs-node');

async function preprocessImage(buffer, size) {
    const image = await Jimp.read(buffer)
    image.resize(size, size)
    
    const resizedBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
    const tensor = tf.node.decodeImage(resizedBuffer, 3)
    return tensor.div(255.0).expandDims(0)
}

const publicPredictResponse = prediction => {
    return {
        status: prediction.status,
        reason: prediction.reason,
        indication: prediction.indication,
        solution: prediction.solution,
        plant: prediction.plant,
        mediecene: prediction.mediecene
    }
}

const historyResponse = (history, user, prediction) => {
    return {
        id: history.id,
        image_url: `${process.env.SUPABASE_PUBLIC_URL_PREFIX}/${process.env.SUPABASE_BUCKET}/${history.image_url}`,
        latitude: history.latitude,
        longitude: history.longitude,
        created_at: history.created_at,
        user: {
            fullname: user.fullname
        },
        prediction: {
            status: prediction.status,
            reason: prediction.reason,
            indication: prediction.indication,
            solution: prediction.solution,
            plant: prediction.plant,
            mediecene: prediction.mediecene
        }
    }
}

module.exports = { preprocessImage, publicPredictResponse, historyResponse }
