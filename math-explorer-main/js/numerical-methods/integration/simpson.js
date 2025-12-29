class SimpsonMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, a, b, precision = 1e-6, maxIterations = 20) {
        try {
            const f = this.parser.parseFunction(func);
            
            let n = 2;
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
        if (n % 2 !== 0) n++;
        
        const h = (b - a) / n;
        let sum = f(a) + f(b);

        for (let i = 1; i < n; i++) {
            const coefficient = (i % 2 === 0) ? 2 : 4;
            sum += coefficient * f(a + i * h);
        }

        return (h / 3) * sum;
    }

    _isFiniteNumber(num) {
        return typeof num === 'number' && isFinite(num);
    }
}

export default SimpsonMethod;
