class SecantMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, x0, x1, precision = 1e-6, maxIterations = 100) {
        try {
            const f = this.parser.parseFunction(func);
            let xPrev = x0;
            let x = x1;
            const iterations = [];
            
            for (let i = 0; i < maxIterations; i++) {
                const fPrev = f(xPrev);
                const fCurrent = f(x);
                
                if (Math.abs(x - xPrev) < 1e-10) {
                    return {
                        root: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Точки слишком близки, деление на ноль'
                    };
                }
                
                const xNew = x - fCurrent * (x - xPrev) / (fCurrent - fPrev);
                const error = Math.abs(xNew - x);
                
                iterations.push({
                    iteration: i + 1,
                    xPrev: xPrev,
                    x: x,
                    fPrev: fPrev,
                    fCurrent: fCurrent,
                    xNew: xNew,
                    error: error
                });
                
                if (error < precision || Math.abs(fCurrent) < precision) {
                    return {
                        root: xNew,
                        iterations: iterations,
                        converged: true,
                        message: `Сошлось за ${i + 1} итераций`
                    };
                }
                
                xPrev = x;
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
}

export default SecantMethod;
