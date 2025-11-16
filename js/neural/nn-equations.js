import TFWrapper from './tf-wrapper.js';
import NewtonMethod from '../numerical-methods/equations/newton.js';
import BisectionMethod from '../numerical-methods/equations/bisection.js';
import SecantMethod from '../numerical-methods/equations/secant.js';
import IterationMethod from '../numerical-methods/equations/iteration.js';

class NNEquations {
    constructor(mathParser) {
        this.mathParser = mathParser;
        this.tfWrapper = new TFWrapper();
        this.initialized = false;
        
        this.methods = {
            newton: new NewtonMethod(mathParser),
            bisection: new BisectionMethod(mathParser),
            secant: new SecantMethod(mathParser),
            iteration: new IterationMethod(mathParser)
        };
    }

    async initialize() {
        if (this.initialized) return true;
        this.initialized = await this.tfWrapper.initialize();
        return this.initialized;
    }

    async solve(func, range = { min: -1000, max: 1000 }) {
        if (!await this.initialize()) {
            return { roots: [], converged: false, message: 'Не удалось инициализировать нейросеть' };
        }

        try {
            const f = this.mathParser.parseFunction(func);
            const roots = await this._trainAndFindRoots(f, range);
            
            return {
                roots: roots,
                converged: roots.length > 0,
                message: `Найдено ${roots.length} корней`,
                method: 'Нейросеть'
            };

        } catch (error) {
            return { roots: [], converged: false, message: 'Ошибка: ' + error.message };
        }
    }

    async _trainAndFindRoots(func, range) {
        // 1. Находим корни классическими методами
        const classicalRoots = this._findRootsClassical(func, range);
        if (classicalRoots.length === 0) return [];

        // 2. Создаем обучающие данные на основе классических методов
        const trainingData = this._createTrainingData(func, range, classicalRoots);
        
        // 3. Обучаем нейросеть
        const model = this.tfWrapper.createModel({
            inputSize: 1,
            hiddenLayers: [32, 16],
            outputSize: 1
        });

        this.tfWrapper.compileModel(model, 0.001);
        await this.tfWrapper.trainModel(model, trainingData.inputs, trainingData.outputs, 100);

        // 4. Нейросеть ищет корни самостоятельно
        return this._findRootsWithNeural(model, func, range);
    }

    _findRootsClassical(func, range) {
        const roots = new Set();
        const mid = (range.min + range.max) / 2;

        try {
            const newton = this.methods.newton.solve(func, mid);
            if (newton.converged && newton.root !== null) roots.add(newton.root);
        } catch (e) {}

        try {
            const bisection = this.methods.bisection.solve(func, range.min, range.max);
            if (bisection.converged && bisection.root !== null) roots.add(bisection.root);
        } catch (e) {}

        try {
            const secant = this.methods.secant.solve(func, range.min, mid);
            if (secant.converged && secant.root !== null) roots.add(secant.root);
        } catch (e) {}

        try {
            const iteration = this.methods.iteration.solve(func, mid);
            if (iteration.converged && iteration.root !== null) roots.add(iteration.root);
        } catch (e) {}

        return Array.from(roots).filter(root => 
            typeof root === 'number' && isFinite(root)
        );
    }

    _createTrainingData(func, range, classicalRoots) {
        const inputs = [];
        const outputs = [];
        
        for (let i = 0; i < 1000; i++) {
            const x = range.min + Math.random() * (range.max - range.min);
            
            try {
                const isRoot = classicalRoots.some(root => Math.abs(root - x) < 0.1);
                inputs.push([x]);
                outputs.push([isRoot ? 1 : 0]);
            } catch (e) {}
        }

        return { inputs, outputs };
    }

    _findRootsWithNeural(model, func, range) {
        const roots = [];
        
        for (let i = 0; i < 200; i++) {
            const x = range.min + Math.random() * (range.max - range.min);
            const confidence = this.tfWrapper.predict(model, [[x]])[0];
            
            if (confidence > 0.7) {
                try {
                    const y = func(x);
                    if (Math.abs(y) < 0.01) {
                        const isNew = !roots.some(r => Math.abs(r.x - x) < 0.01);
                        if (isNew) {
                            roots.push({ 
                                x: x, 
                                fx: y,
                                confidence: confidence 
                            });
                        }
                    }
                } catch (e) {}
            }
        }

        return roots.sort((a, b) => b.confidence - a.confidence);
    }
}

export default NNEquations;
