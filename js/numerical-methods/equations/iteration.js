class IterationMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, x0, precision = 1e-6, maxIterations = 100) {
        try {
            const f = this.parser.parseFunction(func);
            
            const derivative = this._derivative(f, x0);
          
            if (Math.abs(derivative) < 1e-10) {
                return {
                    root: null,
                    iterations: [],
                    converged: false,
                    message: 'Производная близка к нулю, метод не применим'
                };
            }
            
            const lambda = 1 / derivative;
            const phi = (x) => x - lambda * f(x);
            
            let x = x0;
            const iterations = [];
            
            for (let i = 0; i < maxIterations; i++) {
                const xNew = phi(x);
                const error = Math.abs(xNew - x);
                
                iterations.push({
                    iteration: i + 1,
                    x: x,
                    xNew: xNew,
                    error: error
                });
                
                if (error < precision) {
                    return {
                        root: xNew,
                        iterations: iterations,
                        converged: true,
                        message: `Сошлось за ${i + 1} итераций`
                    };
                }
                
                if (!this._isNumber(xNew)) {
                    return {
                        root: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Метод расходится'
                    };
                }
                
                x = xNew;
            }
            
            return {
                root: x,
                iterations: iterations,
                converged: false,
                message: `Достигнут предел ${maxIterations} итераций`
            };
            
        } catch (error) {
            return {
                root: null,
                iterations: [],
                converged: false,
                message: 'Ошибка: ' + error.message
            };
        }
    }

    _derivative(func, x, h = 1e-7) {
        return (func(x + h) - func(x - h)) / (2 * h);
    }

    _isNumber(num) {
        return typeof num === 'number' && isFinite(num);
    }
}

export default IterationMethod;
