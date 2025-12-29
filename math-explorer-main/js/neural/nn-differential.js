import TFWrapper from './tf-wrapper.js';
import EulerMethod from '../numerical-methods/differential/euler.js';
import RungeKuttaMethod from '../numerical-methods/differential/runge-kutta.js';

class NNDifferential {
    constructor(mathParser) {
        this.mathParser = mathParser;
        this.tfWrapper = new TFWrapper();
        this.initialized = false;
        this.methods = {
            euler: new EulerMethod(mathParser),
            rungeKutta: new RungeKuttaMethod(mathParser)
        };
    }

    async initialize() {
        if (this.initialized) return true;
        this.initialized = await this.tfWrapper.initialize();
        return this.initialized;
    }

    async solve(func, x0, y0, xEnd) {
        if (!await this.initialize()) {
            return { solution: null, converged: false, message: 'Не удалось инициализировать нейросеть' };
        }

        try {
            const f = this.mathParser.parseFunction(func);
            const classical = this._getClassicalSolution(f, x0, y0, xEnd);
            const neural = await this._trainAndPredict(f, x0, y0, xEnd);
            
            return {
                solution: classical.solution,
                iterations: classical.iterations,
                converged: true,
                message: `Решено нейросетью (точность: ${neural.probability}%)`,
                method: 'Нейросеть + Классические методы',
                probability: neural.probability,
                neuralPrediction: neural.finalY
            };

        } catch (error) {
            return { solution: null, converged: false, message: 'Ошибка: ' + error.message };
        }
    }

    async _trainAndPredict(func, x0, y0, xEnd) {
        const trainingData = this._createTrainingData(func, x0, y0, xEnd);
        const model = this.tfWrapper.createModel({
            inputSize: 3,
            hiddenLayers: [32, 16],
            outputSize: 1
        });

        this.tfWrapper.compileModel(model, 0.001);
        await this.tfWrapper.trainModel(model, trainingData.inputs, trainingData.outputs, 100);

        return this._predictFinalY(model, func, x0, y0, xEnd);
    }

    _createTrainingData(func, targetX0, targetY0, targetXEnd) {
        const inputs = [];
        const outputs = [];
        const range = 5;
        
        for (let i = 0; i < 500; i++) {
            const trainX0 = targetX0 + (Math.random() - 0.5) * range;
            const trainY0 = targetY0 + (Math.random() - 0.5) * range;
            const trainXEnd = targetXEnd + (Math.random() - 0.5) * range;
            
            if (trainX0 >= trainXEnd) continue;

            const finalYs = this._getFinalYValues(func, trainX0, trainY0, trainXEnd);
            for (const y of finalYs) {
                if (typeof y === 'number' && isFinite(y)) {
                    inputs.push([trainX0, trainY0, trainXEnd]);
                    outputs.push([y]);
                }
            }
        }

        return { inputs, outputs };
    }

    _getFinalYValues(func, x0, y0, xEnd) {
        const results = [];
        
        const methods = [this.methods.rungeKutta, this.methods.euler];
        for (const method of methods) {
            try {
                const solution = method.solve(func, x0, y0, xEnd);
                if (solution.converged && solution.solution.y.length > 0) {
                    results.push(solution.solution.y[solution.solution.y.length - 1]);
                }
            } catch (e) {}
        }
        
        return results;
    }

    _getClassicalSolution(func, x0, y0, xEnd) {
        try {
            const rk = this.methods.rungeKutta.solve(func, x0, y0, xEnd);
            if (rk.converged) return rk;
        } catch (e) {}
        
        try {
            const euler = this.methods.euler.solve(func, x0, y0, xEnd);
            if (euler.converged) return euler;
        } catch (e) {}
        
        throw new Error('Классические методы не сработали');
    }

    _predictFinalY(model, func, x0, y0, xEnd) {
        const neuralY = this.tfWrapper.predict(model, [[x0, y0, xEnd]])[0];
        const classical = this._getClassicalSolution(func, x0, y0, xEnd);
        const classicalY = classical.solution.y[classical.solution.y.length - 1];
        
        const error = Math.abs(neuralY - classicalY);
        const relativeError = error / (Math.abs(classicalY) + 1e-10);
        const probability = Math.max(0, 100 - relativeError * 100);
        
        return {
            finalY: neuralY,
            probability: Math.min(99, Math.round(probability))
        };
    }
}

export default NNDifferential;
