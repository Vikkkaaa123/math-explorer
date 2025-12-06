class SimpleIterationMethod {
    constructor(mathParser) {
        this.parser = mathParser;
        this.method = 'Метод простой итерации';
    }

    solve(func, x0, precision = 1e-6, maxIterations = 100) {
        try {
            const phi = this.parser.parseFunction(func); // φ(x)
            let x = x0;
            const iterations = [];
            
            for (let i = 0; i < maxIterations; i++) {
                const xNew = phi(x);
                
                if (Math.abs(xNew) > 1e10 || !isFinite(xNew)) {
                    return {
                        root: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Метод расходится',
                        method: this.method,
                        iterationsCount: i + 1,
                        residual: null
                    };
                }
                
                const error = Math.abs(xNew - x);
                
                iterations.push({
                    iteration: i + 1,
                    x: x,
                    fx: xNew,
                    error: error
                });
                
                if (error < precision) {
                    const residual = error;
                    return {
                        root: xNew,
                        iterations: iterations,
                        converged: true,
                        message: 'Уравнение решено!',
                        method: this.method,
                        iterationsCount: i + 1,
                        residual: residual
                    };
                }
                
                x = xNew;
            }
            
            const finalError = Math.abs(phi(x) - x);
            return {
                root: x,
                iterations: iterations,
                converged: false,
                message: `Достигнут предел ${maxIterations} итераций`,
                method: this.method,
                iterationsCount: maxIterations,
                residual: finalError
            };
            
        } catch (error) {
            return {
                root: null,
                iterations: [],
                converged: false,
                message: 'Ошибка: ' + error.message,
                method: this.method,
                iterationsCount: 0,
                residual: null
            };
        }
    }
}

export default SimpleIterationMethod;
