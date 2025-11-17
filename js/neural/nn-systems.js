import TFWrapper from './tf-wrapper.js';
import GaussMethod from '../numerical-methods/systems/gauss.js';
import JacobiMethod from '../numerical-methods/systems/jacobi.js';
import ZeidelMethod from '../numerical-methods/systems/zeidel.js';

class NNSystems {
    constructor(mathParser) {
        this.mathParser = mathParser;
        this.tfWrapper = new TFWrapper();
        this.initialized = false;
        
        this.methods = {
            gauss: new GaussMethod(mathParser),
            jacobi: new JacobiMethod(mathParser),
            zeidel: new ZeidelMethod(mathParser)
        };
    }

    async initialize() {
        if (this.initialized) return true;
        this.initialized = await this.tfWrapper.initialize();
        return this.initialized;
    }

    async solve(equations) {
        if (!await this.initialize()) {
            return { solution: null, converged: false, message: 'Не удалось инициализировать нейросеть' };
        }

        try {
            const { matrix, vector } = this._parseEquations(equations);
            const result = await this._trainAndSolve(matrix, vector);
            
            return {
                solution: result.solution,
                converged: true,
                message: `Система решена нейросетью (вероятность точности: ${result.probability}%)`,
                method: 'Нейросеть',
                probability: result.probability
            };

        } catch (error) {
            return { solution: null, converged: false, message: 'Ошибка: ' + error.message };
        }
    }

    async _trainAndSolve(targetMatrix, targetVector) {
        // 1. Решаем классическими методами
        const classicalSolution = this._solveClassical(targetMatrix, targetVector);
        if (!classicalSolution) return { solution: null, probability: 0 };

        // 2. Создаем обучающие данные
        const trainingData = this._createTrainingData(targetMatrix, targetVector, classicalSolution);
        
        // 3. Обучаем нейросеть
        const n = targetVector.length;
        const model = this.tfWrapper.createModel({
            inputSize: n * n + n,
            hiddenLayers: [32, 16],
            outputSize: n
        });

        this.tfWrapper.compileModel(model, 0.001);
        await this.tfWrapper.trainModel(model, trainingData.inputs, trainingData.outputs, 100);

        // 4. Нейросеть предсказывает решение
        return this._solveWithNeural(model, targetMatrix, targetVector, classicalSolution);
    }

    _solveClassical(matrix, vector) {
        try {
            const gauss = this.methods.gauss.solve(matrix, vector);
            if (gauss.converged) return gauss.solution;
        } catch (e) {}

        try {
            const zeidel = this.methods.zeidel.solve(matrix, vector);
            if (zeidel.converged) return zeidel.solution;
        } catch (e) {}

        try {
            const jacobi = this.methods.jacobi.solve(matrix, vector);
            if (jacobi.converged) return jacobi.solution;
        } catch (e) {}

        return null;
    }

    _createTrainingData(targetMatrix, targetVector, classicalSolution) {
        const inputs = [];
        const outputs = [];
        const n = targetVector.length;
        
        for (let i = 0; i < 1000; i++) {
            const { matrix, vector } = this._generateRandomSystem(targetMatrix, targetVector);
            
            inputs.push([...matrix.flat(), ...vector]);
            outputs.push(classicalSolution);
        }

        return { inputs, outputs };
    }

    _generateRandomSystem(targetMatrix, targetVector) {
        const n = targetVector.length;
        const matrix = [];
        const vector = [];
        
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                const noise = (Math.random() - 0.5) * 0.5;
                row.push(targetMatrix[i][j] + noise);
            }
            matrix.push(row);
            vector.push(targetVector[i] + (Math.random() - 0.5) * 0.5);
        }
        
        return { matrix, vector };
    }

    _solveWithNeural(model, matrix, vector, classicalSolution) {
        const input = [...matrix.flat(), ...vector];
        const neuralSolution = this.tfWrapper.predict(model, [input]);
        
        const error = this._calculateError(matrix, vector, neuralSolution);
        const classicalError = this._calculateError(matrix, vector, classicalSolution);
      
        const relativeError = Math.abs(error - classicalError) / (Math.abs(classicalError) + 1e-10);
        const probability = Math.max(0, 100 - relativeError * 100);
        
        return {
            solution: neuralSolution,
            probability: Math.min(99, Math.round(probability))
        };
    }

    _calculateError(matrix, vector, solution) {
        let totalError = 0;
        const n = matrix.length;
        
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                sum += matrix[i][j] * solution[j];
            }
            totalError += Math.abs(sum - vector[i]);
        }
        
        return totalError / n;
    }

    _parseEquations(equations) {
        const n = equations.length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));
        const vector = Array(n).fill(0);
        
        const variables = [];
        for (let i = 0; i < n; i++) {
            variables.push(String.fromCharCode(120 + i));
        }
        
        for (let i = 0; i < n; i++) {
            const eq = equations[i].toLowerCase().replace(/\s/g, '');
            const [left, right] = eq.split('=');
            
            vector[i] = parseFloat(right);
            
            for (let j = 0; j < n; j++) {
                const varName = variables[j];
                const regex = new RegExp(`([+-]?\\d*\\.?\\d*)${varName}`);
                const match = left.match(regex);
                
                if (match) {
                    let coef = match[1] || '1';
                    if (coef === '+') coef = '1';
                    if (coef === '-') coef = '-1';
                    matrix[i][j] = parseFloat(coef);
                }
            }
        }
        
        return { matrix, vector };
    }
}

export default NNSystems;
