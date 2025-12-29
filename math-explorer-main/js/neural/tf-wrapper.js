class TFWrapper {
    constructor() {
        this.tf = null;
        this.ready = false;
        this.models = new Map();
    }

    async initialize() {
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js не загружен');
        }
        
        this.tf = tf;
        await this._initializeBackend();
        this.ready = true;
        return true;
    }

    async _initializeBackend() {
        for (const backend of ['webgl', 'cpu']) {
            try {
                this.tf.setBackend(backend);
                await this.tf.ready();
                return backend;
            } catch (error) {
                //переход к следующему backend
            }
        }
        throw new Error('Нет доступных backend');
    }

    createModel(config) {
        const model = this.tf.sequential();
        
        model.add(this.tf.layers.dense({
            units: config.hiddenLayers[0],
            inputShape: [config.inputSize],
            activation: 'relu'
        }));

        for (let i = 1; i < config.hiddenLayers.length; i++) {
            model.add(this.tf.layers.dense({
                units: config.hiddenLayers[i],
                activation: 'relu'
            }));
        }

        model.add(this.tf.layers.dense({
            units: config.outputSize,
            activation: 'linear'
        }));

        return model;
    }

    compileModel(model, learningRate = 0.001) {
        model.compile({
            optimizer: this.tf.train.adam(learningRate),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });
    }

    async trainModel(model, inputs, outputs, epochs = 100) {
        const inputTensor = this.tf.tensor2d(inputs);
        const outputTensor = this.tf.tensor2d(outputs);

        const history = await model.fit(inputTensor, outputTensor, { epochs });
        
        inputTensor.dispose();
        outputTensor.dispose();
        
        return history;
    }

    createTrainingData(func, range, samples = 1000) {
        const inputs = [];
        const outputs = [];
        
        for (let i = 0; i < samples; i++) {
            const x = range.min + (range.max - range.min) * Math.random();
            inputs.push([x]);
            
            try {
                const y = func(x);
                outputs.push([typeof y === 'number' && isFinite(y) ? y : 0]);
            } catch (error) {
                outputs.push([0]);
            }
        }
        
        return { inputs, outputs };
    }

    predict(model, inputs) {
        const inputTensor = this.tf.tensor2d(inputs);
        const prediction = model.predict(inputTensor);
        const result = Array.from(prediction.dataSync());
        
        inputTensor.dispose();
        prediction.dispose();
        
        return result;
    }
}

export default TFWrapper;
