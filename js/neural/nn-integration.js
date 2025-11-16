import TFWrapper from './tf-wrapper.js';
import SimpsonMethod from '../numerical-methods/integration/simpson.js';
import TrapezoidalMethod from '../numerical-methods/integration/trapezoidal.js';
import RectanglesMethod from '../numerical-methods/integration/rectangles.js';
import MonteCarloMethod from '../numerical-methods/integration/monte-carlo.js';

class NNIntegration {
    constructor(mathParser) {
        this.mathParser = mathParser;
        this.tfWrapper = new TFWrapper();
        this.initialized = false;
        
        this.methods = {
            simpson: new SimpsonMethod(mathParser),
            trapezoidal: new TrapezoidalMethod(mathParser),
            rectangles: new RectanglesMethod(mathParser),
            monteCarlo: new MonteCarloMethod(mathParser)
        };
    }

    async initialize() {
        if (this.initialized) return true;
        this.initialized = await this.tfWrapper.initialize();
        return this.initialized;
    }

    async solve(func, a, b) {
        if (!await this.initialize()) {
            return { result: null, converged: false, message: 'Не удалось инициализировать нейросеть' };
        }

        try {
            const f = this.mathParser.parseFunction(func);
            const result = await this._trainAndIntegrate(f, a, b);
            
            return {
                result: result.value,
                converged: true,
                message: `Интеграл вычислен нейросетью (вероятность точности: ${result.probability}%)`,
                method: 'Нейросеть',
                probability: result.probability
            };

        } catch (error) {
            return { result: null, converged: false, message: 'Ошибка: ' + error.message };
        }
    }

    async _trainAndIntegrate(func, targetA, targetB) {
        // 1. Создаем обучающие данные на разных промежутках
        const trainingData = this._createTrainingData(func, targetA, targetB);
        
        // 2. Обучаем нейросеть
        const model = this.tfWrapper.createModel({
            inputSize: 2,
            hiddenLayers: [32, 16],
            outputSize: 1
        });

        this.tfWrapper.compileModel(model, 0.001);
        await this.tfWrapper.trainModel(model, trainingData.inputs, trainingData.outputs, 100);

        // 3. Нейросеть угадывает интеграл и вычисляем вероятность
        return this._integrateWithNeural(model, func, targetA, targetB);
    }

    _createTrainingData(func, targetA, targetB) {
        const inputs = [];
        const outputs = [];
        
        const baseRange = targetB - targetA;
        
        for (let i = 0; i < 1000; i++) {
            const variation = (Math.random() - 0.5) * 2;
            const trainA = targetA + variation * baseRange;
            const trainB = targetA + (variation + 1 + Math.random()) * baseRange;
            
            if (trainA >= trainB) continue;

            const integral = this._computeIntegralClassical(func, trainA, trainB);
            
            if (Math.abs(integral) < 1e10) {
                inputs.push([trainA, trainB]);
                outputs.push([integral]);
            }
        }

        return { inputs, outputs };
    }

    _computeIntegralClassical(func, a, b) {
        const results = this._getAllIntegrals(func, a, b);
        return results.length > 0? results.reduce((sum, val) => sum + val, 0) / results.length: 0;
    }

    _integrateWithNeural(model, func, a, b) {
        const neuralValue = this.tfWrapper.predict(model, [[a, b]])[0];
        
        const classicalResults = this._getAllIntegrals(func, a, b);
        const classicalValue = classicalResults.length > 0? classicalResults.reduce((sum, val) => sum + val, 0) / classicalResults.length: neuralValue;
        
        const error = Math.abs(neuralValue - classicalValue);
        const relativeError = error / (Math.abs(classicalValue) + 1e-10);
        const probability = Math.max(0, 100 - relativeError * 100);
        
        return {
            value: neuralValue,
            probability: Math.min(99, Math.round(probability))
        };
    }

    _getAllIntegrals(func, a, b) {
        const results = [];

        try {
            const simpson = this.methods.simpson.solve(func, a, b);
            if (simpson.converged) results.push(simpson.result);
        } catch (e) {}

        try {
            const trapezoidal = this.methods.trapezoidal.solve(func, a, b);
            if (trapezoidal.converged) results.push(trapezoidal.result);
        } catch (e) {}

        try {
            const rectangles = this.methods.rectangles.solve(func, a, b);
            if (rectangles.converged) results.push(rectangles.result);
        } catch (e) {}

        try {
            const monteCarlo = this.methods.monteCarlo.solve(func, a, b);
            if (monteCarlo.converged) results.push(monteCarlo.result);
        } catch (e) {}

        return results.filter(val => typeof val === 'number' && isFinite(val) && Math.abs(val) < 1e10);
    }
}

export default NNIntegration;
