class NewtonMethod {
    constructor(mathParser) {
        this.parser = mathParser;
        this.method = 'Метод Ньютона';
    }

    solve(func, x0, precision = 1e-6, maxIterations = 100) {
        try {
            //проверка начального приближения
            if (typeof x0 !== 'number' || !isFinite(x0)) {
                return {
                    root: null,
                    iterations: [],
                    converged: false,
                    message: 'Некорректное начальное приближение',
                    method: this.method,
                    residual: null
                };
            }

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
                        message: 'Производная близка к нулю',
                        method: this.method,
                        residual: Math.abs(fx)
                    };
                }
                
                const xNew = x - fx / dfx;
                
                //проверка на расходимость
                if (Math.abs(xNew) > 1e10 || !isFinite(xNew)) {
                    return {
                        root: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Метод расходится (значение стало слишком большим)',
                        method: this.method,
                        residual: Math.abs(fx)
                    };
                }
                
                const error = Math.abs(xNew - x);
                
                iterations.push({
                    iteration: i + 1,
                    x: x,
                    fx: fx,
                    derivative: dfx,
                    xNew: xNew,
                    error: error
                });
                
                //проверка на зацикливание (после минимум 3 итераций)
                if (iterations.length > 3) {
                    const lastErrors = iterations.slice(-3).map(it => it.error);
                    const errorChange = Math.abs(lastErrors[2] - lastErrors[0]);
                    if (errorChange < 1e-15) {
                        const finalResidual = Math.abs(f(xNew));
                        return {
                            root: xNew,
                            iterations: iterations,
                            converged: false,
                            message: 'Зацикливание - ошибка перестала уменьшаться',
                            method: this.method,
                            iterationsCount: i + 1,
                            residual: finalResidual
                        };
                    }
                }
                
                //критерий остановки
                const tolerance = Math.max(precision, 1e-12);
                if (error < tolerance || Math.abs(fx) < tolerance) {
                    const finalResidual = Math.abs(f(xNew));
                    return {
                        root: xNew,
                        iterations: iterations,
                        converged: true,
                        message: `Сошлось за ${i + 1} итераций`,
                        method: this.method,
                        iterationsCount: i + 1,
                        residual: finalResidual
                    };
                }
                
                x = xNew;
            }
            
            //если вышли по количеству итераций
            const finalResidual = Math.abs(f(x));
            return {
                root: x,
                iterations: iterations,
                converged: false,
                message: `Достигнут предел ${maxIterations} итераций`,
                method: this.method,
                iterationsCount: maxIterations,
                residual: finalResidual
            };
            
        } catch (error) {
            return {
                root: null,
                iterations: [],
                converged: false,
                message: 'Ошибка: ' + error.message,
                method: this.method,
                residual: null
            };
        }
    }

    _derivative(func, x, h = 1e-7) {
        //адаптивный шаг для производной
        const h0 = Math.max(1e-10, 1e-7 * Math.abs(x || 1));
        return (func(x + h0) - func(x - h0)) / (2 * h0);
    }
}

export default NewtonMethod;
