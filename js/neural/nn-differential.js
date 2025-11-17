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
            const result = await this._trainAndSolve(f, x0, y0, xEnd);
            
            return {
                solution: result.solution,
                converged: true,
                message: `Дифф. уравнение решено нейросетью (вероятность точности: ${result.probability}%)`,
                method: 'Нейросеть',
                probability: result.probability
            };

        } catch (error) {
            return { solution: null, converged: false, message: 'Ошибка: ' + error.message };
        }
    }

    async _trainAndSolve(func, targetX0, targetY0, targetXEnd) {
        // 1. Создаем обучающие данные на разных начальных условиях
        const trainingData = this._createTrainingData(func, targetX0, targetY0, targetXEnd);
        
        // 2. Обучаем нейросеть
        const model = this.tfWrapper.createModel({
            inputSize: 3,  // [x0, y0, xEnd]
            hiddenLayers: [32, 16],
            outputSize: 1
        });

        this.tfWrapper.compileModel(model, 0.001);
        await this.tfWrapper.trainModel(model, trainingData.inputs, trainingData.outputs, 100);

        // 3. Нейросеть предсказывает решение и вычисляем вероятность
        return this._solveWithNeural(model, func, targetX0, targetY0, targetXEnd);
    }

    _createTrainingData(func, targetX0, targetY0, targetXEnd) {
        const inputs = [];
        const outputs = [];
        
        const range = 5;
        
        for (let i = 0; i < 1000; i++) {
            const trainX0 = targetX0 + (Math.random() - 0.5) * range;
            const trainY0 = targetY0 + (Math.random() - 0.5) * range;
            const trainXEnd = targetXEnd + (Math.random() - 0.5) * range;
            
            if (trainX0 >= trainXEnd) continue;

            // Получаем все решения
            const allSolutions = this._getAllSolutions(func, trainX0, trainY0, trainXEnd);
            
            // Обучаем
            for (const solution of allSolutions) {
                if (typeof solution === 'number' && isFinite(solution)) {
                    inputs.push([trainX0, trainY0, trainXEnd]);
                    outputs.push([solution]);
                }
            }
        }

        return { inputs, outputs };
    }

    // _solveClassical(func, x0, y0, xEnd) {
    //     const results = this._getAllSolutions(func, x0, y0, xEnd);
    //     return results.length > 0? results.reduce((sum, val) => sum + val, 0) / results.length: 0;
    // }

    _solveWithNeural(model, func, x0, y0, xEnd) {
        const neuralValue = this.tfWrapper.predict(model, [[x0, y0, xEnd]])[0];
        
        const classicalResults = this._getAllSolutions(func, x0, y0, xEnd);
        const classicalValue = classicalResults.length > 0? classicalResults.reduce((sum, val) => sum + val, 0) / classicalResults.length: neuralValue;
        
        const error = Math.abs(neuralValue - classicalValue);
        const relativeError = error / (Math.abs(classicalValue) + 1e-10);
        const probability = Math.max(0, 100 - relativeError * 100);
        
        return {
            solution: {
                x: [x0, xEnd],
                y: [y0, neuralValue]
            },
            probability: Math.min(99, Math.round(probability))
        };
    }

    _getAllSolutions(func, x0, y0, xEnd) {
        const results = [];

        try {
            const euler = this.methods.euler.solve(func, x0, y0, xEnd);
            if (euler.converged && euler.solution && euler.solution.y.length > 0) {
                results.push(euler.solution.y[euler.solution.y.length - 1]);
            }
        } catch (e) {}

        try {
            const rungeKutta = this.methods.rungeKutta.solve(func, x0, y0, xEnd);
            if (rungeKutta.converged && rungeKutta.solution && rungeKutta.solution.y.length > 0) {
                results.push(rungeKutta.solution.y[rungeKutta.solution.y.length - 1]);
            }
        } catch (e) {}

        return results.filter(val => typeof val === 'number' && isFinite(val) && Math.abs(val) < 1e10);
    }
}

export default NNDifferential;
