class RungeKuttaMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(equation, x0, y0, xEnd, step = 0.1, maxSteps = 1000) {
        try {
            const f = this.parser.parseFunction(equation);
            
            if (x0 >= xEnd || step <= 0) {
                return {
                    solution: null,
                    iterations: [],
                    converged: false,
                    message: 'Некорректные параметры'
                };
            }
            
            const iterations = [];
            let x = x0;
            let y = y0;
            let stepNumber = 0;
            
            iterations.push({ step: stepNumber, x: x, y: y });
            
            while (x < xEnd && stepNumber < maxSteps) {
                const k1 = f(x, y);
                const k2 = f(x + step/2, y + step * k1/2);
                const k3 = f(x + step/2, y + step * k2/2);
                const k4 = f(x + step, y + step * k3);
                
                y = y + (step / 6) * (k1 + 2*k2 + 2*k3 + k4);
                x = x + step;
                stepNumber++;
                
                iterations.push({ step: stepNumber, x: x, y: y });
                
                if (!this._isFiniteNumber(y)) {
                    return {
                        solution: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Решение расходится'
                    };
                }
            }
            
            return {
                solution: {
                    x: iterations.map(point => point.x),
                    y: iterations.map(point => point.y)
                },
                iterations: iterations,
                converged: true,
                message: `Решение получено за ${stepNumber} шагов`
            };
            
        } catch (error) {
            return {
                solution: null,
                iterations: [],
                converged: false,
                message: 'Ошибка: ' + error.message
            };
        }
    }

    _isFiniteNumber(num) {
        return typeof num === 'number' && isFinite(num);
    }
}
