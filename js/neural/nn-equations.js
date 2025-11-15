import TFWrapper from './tf-wrapper.js';

class NNEquations {
    constructor(mathParser) {
        this.mathParser = mathParser;
        this.tfWrapper = new TFWrapper();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return true;
        this.initialized = await this.tfWrapper.initialize();
        return this.initialized;
    }

    async solve(func, range = { min: -10, max: 10 }) {
        if (!await this.initialize()) {
            return this._errorResult('Не удалось инициализировать нейросеть');
        }

        try {
            const f = this.mathParser.parseFunction(func);
            const roots = await this._trainRootFinder(f, range);
            
            return {
                roots: roots,
                converged: roots.length > 0,
                message: `Нейросеть нашла ${roots.length} корней`,
                method: 'Нейросеть'
            };

        } catch (error) {
            return this._errorResult('Ошибка решения: ' + error.message);
        }
    }

    async _trainRootFinder(func, range) {
        const trainingRoots = this._findRootsClassical(func, range);
        
        if (trainingRoots.length === 0) {
            return [];
        }

        const trainingData = this._createRootTrainingData(func, range, trainingRoots);

        const model = this.tfWrapper.createModel({
            inputSize: 1,
            hiddenLayers: [32, 16], // Было [64, 32, 16]
            outputSize: 1 
        });

        this.tfWrapper.compileModel(model, 0.001);

        await this.tfWrapper.trainModel(
            model, 
            trainingData.inputs, 
            trainingData.outputs, 
            100
        );

        return this._findRootsNeural(model, func, range);
    }

    _createRootTrainingData(func, range, knownRoots) {
        const inputs = [];
        const outputs = [];

        for (let i = 0; i < 1000; i++) {
            const x = range.min + (range.max - range.min) * Math.random();
            
            const isRoot = knownRoots.some(root => Math.abs(root - x) < 0.1);
            const actualY = func(x);
            const isActuallyRoot = Math.abs(actualY) < 0.01;
            
            inputs.push([x]);
            outputs.push([isRoot || isActuallyRoot ? 1 : 0]);
        }

        return { inputs, outputs };
    }

    _findRootsNeural(model, func, range) {
        const roots = [];
        
        for (let i = 0; i < 50; i++) {
            const x = range.min + (range.max - range.min) * Math.random();
            const prediction = this.tfWrapper.predict(model, [[x]])[0];
            
            if (prediction > 0.8) {
                const actualY = func(x);
                if (Math.abs(actualY) < 0.01) {
                    roots.push({ 
                        x: x, 
                        fx: actualY,
                        confidence: prediction
                    });
                }
            }
        }

        return this._removeDuplicateRoots(roots);
    }

    _findRootsClassical(func, range) {
        const roots = [];
        const step = (range.max - range.min) / 100;
        
        let prevX = range.min;
        let prevY = func(prevX);
        
        for (let x = range.min + step; x <= range.max; x += step) {
            const currentY = func(x);
            
            if (prevY * currentY <= 0) {
                const root = this._refineRootClassical(func, prevX, x);
                if (root !== null) {
                    roots.push(root);
                }
            }
            
            prevX = x;
            prevY = currentY;
        }
        
        return roots;
    }

    _refineRootClassical(func, a, b) {
        let left = a, right = b;
        
        for (let i = 0; i < 10; i++) {
            const mid = (left + right) / 2;
            const midY = func(mid);
            
            if (Math.abs(midY) < 1e-6) return mid;
            if (func(left) * midY < 0) right = mid;
            else left = mid;
        }
        
        return (left + right) / 2;
    }

    _removeDuplicateRoots(roots) {
        const unique = [];
        for (const root of roots) {
            const isDuplicate = unique.some(r => Math.abs(r.x - root.x) < 0.1);
            if (!isDuplicate) unique.push(root);
        }
        return unique;
    }

    _errorResult(message) {
        return {
            roots: [],
            converged: false,
            message: message
        };
    }
}

export default NNEquations;
