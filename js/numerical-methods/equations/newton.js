class NewtonMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, x0, precision = 1e-6, maxIterations = 100) {
        try {
            const f = this.parser.parseFunction(func);
            let x = x0;
            const iterations = [];
            
            for (let i = 0; i < maxIterations; i++) {
                const fx = f(x);
                const dfx = this._derivative(f, x);
                
                if (Math.abs(dfx) < 1e-10) {
                    return {
                        root: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Производная близка к нулю'
                    };
                }
                
                const xNew = x - fx / dfx;
                const error = Math.abs(xNew - x);
                
                iterations.push({
                    iteration: i + 1,
                    x: x,
                    fx: fx,
                    derivative: dfx,
                    xNew: xNew,
                    error: error
                });
                
                if (error < precision || Math.abs(fx) < precision) {
                    return {
                        root: xNew,
                        iterations: iterations,
                        converged: true,
                        message: `Сошлось за ${i + 1} итераций`
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
}

export default NewtonMethod;
