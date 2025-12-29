class MonteCarloMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, a, b, precision = 1e-4, maxIterations = 15, minPoints = 10000) {
        try {
            const f = this.parser.parseFunction(func);
            
            if (a >= b) {
                return {
                    result: null,
                    iterations: [],
                    converged: false,
                    message: 'Интервал задан некорректно'
                };
            }
            
            let n = minPoints;
            let previous = 0;
            let current = this._calculate(f, a, b, n);
            const iterations = [];

            for (let i = 0; i < maxIterations; i++) {
                const error = Math.abs(current - previous);
                
                iterations.push({
                    iteration: i + 1,
                    points: n,
                    result: current,
                    error: error
                });

                if (i > 0 && error < precision) {
                    return {
                        result: current,
                        iterations: iterations,
                        converged: true,
                        message: `Интеграл вычислен с точностью ${error.toExponential(2)}`
                    };
                }

                previous = current;
                n *= 2;
                
                if (n > 10000000) {
                    return {
                        result: current,
                        iterations: iterations,
                        converged: false,
                        message: 'Достигнут предел точек'
                    };
                }
                
                current = this._calculate(f, a, b, n);
            }

            return {
                result: current,
                iterations: iterations,
                converged: false,
                message: `Достигнут предел итераций`
            };

        } catch (error) {
            return {
                result: null,
                iterations: [],
                converged: false,
                message: 'Ошибка: ' + error.message
            };
        }
    }

    _calculate(f, a, b, n) {
        let sum = 0;
        
        for (let i = 0; i < n; i++) {
            const x = a + Math.random() * (b - a);
            sum += f(x);
        }
        
        return (b - a) * (sum / n);
    }

    _isFiniteNumber(num) {
        return typeof num === 'number' && isFinite(num);
    }
}

export default MonteCarloMethod;
