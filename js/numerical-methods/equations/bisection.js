class BisectionMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(func, a, b, precision = 1e-6, maxIterations = 100) {
        try {
            const f = this.parser.parseFunction(func);
            
            if (a >= b) throw new Error('Интервал задан некорректно');
            
            const fa = f(a), fb = f(b);
            if (!this._isNumber(fa) || !this._isNumber(fb)) {
                throw new Error('Функция не определена на границах');
            }
            
            if (Math.abs(fa) < precision) return this._result(a, [], true, 'Корень в точке a');
            if (Math.abs(fb) < precision) return this._result(b, [], true, 'Корень в точке b');
            if (fa * fb > 0) throw new Error('Нет смены знака на интервале');
            
            return this._bisect(f, a, b, precision, maxIterations);
            
        } catch (error) {
            return this._result(null, [], false, error.message);
        }
    }

    _bisect(f, a, b, precision, maxIterations) {
        let left = a, right = b, fLeft = f(a);
        const iterations = [];
        
        for (let i = 0; i < maxIterations; i++) {
            const mid = (left + right) / 2;
            const fMid = f(mid);
            
            iterations.push({ 
                iteration: i + 1, 
                a: left, 
                b: right, 
                mid: mid, 
                fMid: fMid,
                intervalLength: right - left
            });
            
            // Проверка сходимости
            if (Math.abs(fMid) < precision) {
                return this._result(mid, iterations, true, `Сошлось за ${i + 1} итераций`);
            }
            
            // Выбор следующего интервала
            if (fLeft * fMid < 0) {
                right = mid;
            } else {
                left = mid;
                fLeft = fMid;
            }
            
            // Дополнительный критерий - длина интервала
            if (right - left < precision) {
                const finalMid = (left + right) / 2;
                return this._result(finalMid, iterations, true, `Сошлось за ${i + 1} итераций (по длине интервала)`);
            }
        }
        
        const finalRoot = (left + right) / 2;
        return this._result(finalRoot, iterations, false, `Достигнут предел ${maxIterations} итераций`);
    }

    _result(root, iterations, converged, message) {
        return { 
            root: root, 
            iterations: iterations, 
            converged: converged, 
            message: message 
        };
    }

    _isNumber(num) {
        return typeof num === 'number' && isFinite(num);
    }

    checkApplicability(func, a, b) {
        try {
            if (a >= b) {
                return { applicable: false, reason: 'Интервал задан некорректно' };
            }
            
            const f = this.parser.parseFunction(func);
            const fa = f(a);
            const fb = f(b);
            
            if (!this._isNumber(fa) || !this._isNumber(fb)) {
                return { applicable: false, reason: 'Функция не определена на границах' };
            }
            
            if (Math.abs(fa) < 1e-10) {
                return { applicable: true, reason: 'Корень в точке a', root: a };
            }
            if (Math.abs(fb) < 1e-10) {
                return { applicable: true, reason: 'Корень в точке b', root: b };
            }
            
            return {
                applicable: fa * fb < 0,
                reason: fa * fb < 0 ? 'Условие применимости выполнено' : 'Нет смены знака',
                fa: fa,
                fb: fb
            };
            
        } catch (error) {
            return { applicable: false, reason: 'Ошибка анализа функции' };
        }
    }

    findSuitableInterval(func, start = -10, end = 10, step = 1) {
        try {
            const f = this.parser.parseFunction(func);
            const intervals = [];
            const maxPoints = 1000;
            
            for (let x = start, count = 0; x < end && count < maxPoints; x += step, count++) {
                const x1 = x;
                const x2 = x + step;
                
                try {
                    const f1 = f(x1);
                    const f2 = f(x2);
                    
                    if (this._isNumber(f1) && this._isNumber(f2)) {
                        if (Math.abs(f1) < 1e-10) {
                            intervals.push({ a: x1, b: x1, exactRoot: true, root: x1 });
                        } else if (f1 * f2 < 0) {
                            intervals.push({ a: x1, b: x2, exactRoot: false });
                        }
                    }
                } catch (error) {
                    // Пропускаем проблемные точки
                }
            }
            
            return intervals;
            
        } catch (error) {
            return [];
        }
    }
}

export default BisectionMethod;
