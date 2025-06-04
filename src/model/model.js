const path = require('path');
const tf = require('@tensorflow/tfjs-node');


const loadModel = async (modelName) => {
    const modelPath = `file://${path.resolve(__dirname, `${modelName}/model.json`)}`
    const model = await tf.loadGraphModel(modelPath)

    return model
}

module.exports = { loadModel }