class RectanglesMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, a, b, precision = 1e-6, maxIterations = 20) {
        try {
            const f = this.parser.parseFunction(func);
            
            if (a >= b) {
                return {
                    result: null,
                    iterations: [],
                    converged: false,
                    message: 'Интервал задан некорректно: a должно быть меньше b'
                };
            }
            
            let n = 1;
            let previous = 0;
            let current = this._calculate(f, a, b, n);
            const iterations = [];

            for (let i = 0; i < maxIterations; i++) {
                const error = Math.abs(current - previous);
                
                iterations.push({
                    iteration: i + 1,
                    segments: n,
                    result: current,
                    error: error,
                    h: (b - a) / n
                });

                if (i > 0 && error < precision) {
                    return {
                        result: current,
                        iterations: iterations,
                        converged: true,
                        message: `Интеграл вычислен с точностью ${error.toExponential(2)}`
                    };
                }

                if (!this._isFiniteNumber(current)) {
                    return {
                        result: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Метод расходится'
                    };
                }

                previous = current;
                n *= 2;
                
                if (n > 1000000) {
                    return {
                        result: current,
                        iterations: iterations,
                        converged: false,
                        message: 'Достигнут предел segments'
                    };
                }
                
                current = this._calculate(f, a, b, n);
            }

            return {
                result: current,
                iterations: iterations,
                converged: false,
                message: `Достигнут предел ${maxIterations} итераций`
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
        const h = (b - a) / n;
        let sum = 0;

        for (let i = 0; i < n; i++) {
            const x_mid = a + (i + 0.5) * h;
            sum += f(x_mid);
        }

        return h * sum;
    }

    _isFiniteNumber(num) {
        return typeof num === 'number' && isFinite(num);
    }
}

export default RectanglesMethod;
