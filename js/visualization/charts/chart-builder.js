import ChartManager from './chart-manager.js';

class ChartBuilder {
    constructor(mathParser) {
        this.parser = mathParser;
        this.chartManager = new ChartManager();
    }

    drawEquationChart(funcStr, root, iterations, methodType) {
        const canvasId = 'equation-chart';
        const func = this.parser.parseFunction(funcStr);
        
        const bounds = this._getBoundsForFunction(func, root, iterations);
        const points = this.chartManager.generatePoints(func, bounds.xMin, bounds.xMax);
        
        const datasets = this._buildBaseDatasets(points, root);
        this._addMethodVisualization(datasets, func, iterations, methodType);
        
        const chartConfig = {
            data: { datasets },
            options: { scales: { x: { min: bounds.xMin, max: bounds.xMax } } }
        };
        
        this.chartManager.createChart(canvasId, chartConfig);
    }

    _getBoundsForFunction(func, root, iterations) {
        let xMin = -10, xMax = 10;
        
        if (root !== null) {
            xMin = Math.min(xMin, root - 5);
            xMax = Math.max(xMax, root + 5);
        }
        
        if (iterations && iterations.length > 0) {
            const xs = iterations.map(i => i.x || i.mid || i.xCurr);
            const minIter = Math.min(...xs);
            const maxIter = Math.max(...xs);
            xMin = Math.min(xMin, minIter - 2);
            xMax = Math.max(xMax, maxIter + 2);
        }
        
        return { xMin, xMax };
    }

    _buildBaseDatasets(points, root) {
        const datasets = [];
        
        datasets.push(this.chartManager.createDataset(
            points, 
            'f(x)', 
            this.chartManager.colors.function
        ));
        
        datasets.push(this.chartManager.createLine(
            -1000, 0, 1000, 0, 
            'y = 0', 
            'rgba(156, 163, 175, 0.3)',
            true
        ));
        
        if (root !== null) {
            datasets.push(this.chartManager.createPoint(
                root, 0, 
                `Корень: ${root.toFixed(4)}`, 
                this.chartManager.colors.root
            ));
        }
        
        return datasets;
    }

    _addMethodVisualization(datasets, func, iterations, methodType) {
        if (!iterations || iterations.length === 0) return;
        
        switch(methodType) {
            case 'newton':
                this._addNewtonVisualization(datasets, func, iterations);
                break;
            case 'bisection':
                this._addBisectionVisualization(datasets, iterations);
                break;
            case 'secant':
                this._addSecantVisualization(datasets, func, iterations);
                break;
            case 'iteration':
                this._addIterationVisualization(datasets, iterations);
                break;
        }
    }

    _addNewtonVisualization(datasets, func, iterations) {
        for (let i = 0; i < Math.min(iterations.length, 5); i++) {
            const iter = iterations[i];
            if (iter.x === undefined || iter.fx === undefined) continue;
            
            const df = this._numericalDerivative(func, iter.x);
            const tangentSlope = df;
            const tangentIntercept = iter.fx - tangentSlope * iter.x;
            
            const x1 = iter.x - 1;
            const x2 = iter.x + 1;
            const y1 = tangentSlope * x1 + tangentIntercept;
            const y2 = tangentSlope * x2 + tangentIntercept;
            
            datasets.push(this.chartManager.createLine(
                x1, y1, x2, y2,
                `Касательная ${i+1}`,
                this.chartManager.colors.tangent
            ));
            
            datasets.push(this.chartManager.createPoint(
                iter.x, iter.fx,
                `x${i+1}`,
                this.chartManager.colors.iteration
            ));
        }
    }

    _addBisectionVisualization(datasets, iterations) {
        for (let i = 0; i < Math.min(iterations.length, 10); i++) {
            const iter = iterations[i];
            if (iter.a === undefined || iter.b === undefined) continue;
            
            const yPos = -5 + i * 1;
            datasets.push(this.chartManager.createLine(
                iter.a, yPos, iter.b, yPos,
                `Интервал ${i+1}`,
                this.chartManager.colors.interval
            ));
            
            if (iter.mid !== undefined) {
                datasets.push(this.chartManager.createPoint(
                    iter.mid, yPos,
                    `c${i+1}`,
                    this.chartManager.colors.root
                ));
            }
        }
    }

    _addSecantVisualization(datasets, func, iterations) {
        for (let i = 0; i < Math.min(iterations.length - 1, 5); i++) {
            const iter1 = iterations[i];
            const iter2 = iterations[i + 1];
            
            if (!iter1 || !iter2 || iter1.x === undefined || iter2.x === undefined) continue;
            
            datasets.push(this.chartManager.createLine(
                iter1.x, iter1.fx, 
                iter2.x, iter2.fx,
                `Секущая ${i+1}`,
                'rgba(236, 72, 153, 0.7)'
            ));
        }
    }

    _addIterationVisualization(datasets, iterations) {
        for (let i = 0; i < Math.min(iterations.length, 10); i++) {
            const iter = iterations[i];
            if (iter.x === undefined || iter.xNew === undefined) continue;
            
            datasets.push(this.chartManager.createLine(
                iter.x, iter.fx,
                iter.xNew, 0,
                `Итерация ${i+1}`,
                'rgba(16, 185, 129, 0.5)',
                true
            ));
        }
    }

    _numericalDerivative(func, x, h = 0.001) {
        return (func(x + h) - func(x - h)) / (2 * h);
    }
}

export default ChartBuilder;
