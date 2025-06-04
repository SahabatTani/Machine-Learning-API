const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const fs = require("fs").promises;

const loadModel = async (modelName) => {
    const modelDir = path.resolve(__dirname, modelName);
    const modelJsonPath = path.join(modelDir, "model.json");
    const modelJson = await fs.readFile(modelJsonPath, "utf8");
    const parsed = JSON.parse(modelJson);

    const modelPath = `file://${modelJsonPath}`;

    if (parsed.format === "graph-model") {
        return await tf.loadGraphModel(modelPath);
    } else if (parsed.format === "layers-model") {
        return await tf.loadLayersModel(modelPath);
    } else {
        throw new Error("Unknown model format");
    }
}

module.exports = { loadModel }