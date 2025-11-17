import app from './main.js';
import NewtonMethod from '../numerical-methods/equations/newton.js';
import BisectionMethod from '../numerical-methods/equations/bisection.js';
import IterationMethod from '../numerical-methods/equations/iteration.js';
import SecantMethod from '../numerical-methods/equations/secant.js';
import SimpsonMethod from '../numerical-methods/integration/simpson.js';
import TrapezoidalMethod from '../numerical-methods/integration/trapezoidal.js';
import RectanglesMethod from '../numerical-methods/integration/rectangles.js';
import MonteCarloMethod from '../numerical-methods/integration/monte-carlo.js';
import EulerMethod from '../numerical-methods/differential/euler.js';
import RungeKuttaMethod from '../numerical-methods/differential/runge-kutta.js';
import GaussMethod from '../numerical-methods/systems/gauss.js';
import JacobiMethod from '../numerical-methods/systems/jacobi.js';
import ZeidelMethod from '../numerical-methods/systems/zeidel.js';

import NNEquations from '../neural/nn-equations.js';
import NNIntegration from '../neural/nn-integration.js';
import NNDifferential from '../neural/nn-differential.js';
import NNSystems from '../neural/nn-systems.js';

class EventManager {
    constructor() {
        this.handlers = new Map();
        this.methods = {};
        this.neuralMethods = {};
    }

    async initialize(appInstance) {
        this.app = appInstance;
        await this.initMethods();
        this.setupTabHandlers();
        this.setupCalculationHandlers();
        this.setupSystemInputs();
    }

    async initMethods() {
        const parser = this.app.getMathParser();
        
        // Классические методы
        this.methods.newton = new NewtonMethod(parser);
        this.methods.bisection = new BisectionMethod(parser);
        this.methods.iteration = new IterationMethod(parser);
        this.methods.secant = new SecantMethod(parser);
        
        this.methods.simpson = new SimpsonMethod(parser);
        this.methods.trapezoidal = new TrapezoidalMethod(parser);
        this.methods.rectangles = new RectanglesMethod(parser);
        this.methods.monteCarlo = new MonteCarloMethod(parser);
        
        this.methods.euler = new EulerMethod(parser);
        this.methods.rungeKutta = new RungeKuttaMethod(parser);
        
        this.methods.gauss = new GaussMethod(parser);
        this.methods.jacobi = new JacobiMethod(parser);
        this.methods.zeidel = new ZeidelMethod(parser);
        
        // Нейросетевые методы
        this.neuralMethods.equations = new NNEquations(parser);
        this.neuralMethods.integration = new NNIntegration(parser);
        this.neuralMethods.differential = new NNDifferential(parser);
        this.neuralMethods.systems = new NNSystems(parser);
    }

    setupTabHandlers() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.currentTarget.dataset.tab;
                this.app.switchToTab(tabName);
            });
        });
    }

    setupSystemInputs() {
        const systemCountInput = document.getElementById('system-count');
        if (systemCountInput) {
            systemCountInput.addEventListener('change', (e) => {
                this.updateSystemInputs(parseInt(e.target.value));
            });
        }
    }

    updateSystemInputs(count) {
        const container = document.getElementById('system-equations');
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'system-eq';
            input.placeholder = `Уравнение ${i + 1} (например: 2x + y = 5)`;
            container.appendChild(input);
        }
    }

    setupCalculationHandlers() {
        // Уравнения
        document.getElementById('calculate-equation')?.addEventListener('click', () => this.solveEquation());
        document.getElementById('compare-equation-methods')?.addEventListener('click', () => this.compareEquationMethods());
        
        // Интегрирование
        document.getElementById('calculate-integration')?.addEventListener('click', () => this.solveIntegration());
        document.getElementById('compare-integration-methods')?.addEventListener('click', () => this.compareIntegrationMethods());
        
        // Диффуры
        document.getElementById('calculate-differential')?.addEventListener('click', () => this.solveDifferential());
        document.getElementById('compare-diff-methods')?.addEventListener('click', () => this.compareDiffMethods());
        
        // Системы
        document.getElementById('calculate-system')?.addEventListener('click', () => this.solveSystem());
        document.getElementById('compare-system-methods')?.addEventListener('click', () => this.compareSystemMethods());
    }

    
    //УРАВНЕНИЯ
    async solveEquation() {
        try {
            const func = document.getElementById('equation-function').value;
            const method = document.getElementById('equation-method').value;
            
            if (!func) {
                this.app.showError('Введите функцию');
                return;
            }

            this.app.setLoadingState(true);

            let result;
            if (method === 'neural') {
                const a = parseFloat(document.getElementById('equation-interval-a').value) || -10;
                const b = parseFloat(document.getElementById('equation-interval-b').value) || 10;
                result = await this.neuralMethods.equations.solve(func, { min: a, max: b });
            } else {
                switch (method) {
                    case 'newton': 
                        result = this.methods.newton.solve(func, 1.0); 
                        break;
                    case 'bisection': 
                        const a = parseFloat(document.getElementById('equation-interval-a').value) || 0;
                        const b = parseFloat(document.getElementById('equation-interval-b').value) || 1;
                        result = this.methods.bisection.solve(func, a, b); 
                        break;
                    case 'iteration': 
                        result = this.methods.iteration.solve(func, 1.0); 
                        break;
                    case 'secant': 
                        result = this.methods.secant.solve(func, 0.5, 1.0); 
                        break;
                    default:
                        this.app.showError('Неизвестный метод');
                        this.app.setLoadingState(false);
                        return;
                }
            }

            this.displayEquationResult(result);
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка расчета: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    async compareEquationMethods() {
        try {
            const func = document.getElementById('equation-function').value;
            if (!func) {
                this.app.showError('Введите функцию');
                return;
            }

            this.app.setLoadingState(true);

            const a = parseFloat(document.getElementById('equation-interval-a').value) || -10;
            const b = parseFloat(document.getElementById('equation-interval-b').value) || 10;
            const range = { min: a, max: b };

            const results = await Promise.all([
                this._safeSolve(() => this.methods.newton.solve(func, (a + b) / 2)),
                this._safeSolve(() => this.methods.bisection.solve(func, a, b)),
                this._safeSolve(() => this.methods.iteration.solve(func, (a + b) / 2)),
                this._safeSolve(() => this.methods.secant.solve(func, a, (a + b) / 2)),
                this._safeSolve(() => this.neuralMethods.equations.solve(func, range))
            ]);

            const comparison = {
                newton: results[0],
                bisection: results[1],
                iteration: results[2],
                secant: results[3],
                neural: results[4]
            };

            this.displayComparison(comparison, 'equation-results', 'Уравнения');
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }


    
    //ИНТЕГРИРОВАНИЕ
    async solveIntegration() {
        try {
            const func = document.getElementById('integration-function').value;
            const method = document.getElementById('integration-method').value;
            const a = parseFloat(document.getElementById('integration-a').value);
            const b = parseFloat(document.getElementById('integration-b').value);
            
            if (!func || isNaN(a) || isNaN(b)) {
                this.app.showError('Введите функцию и пределы интегрирования');
                return;
            }

            this.app.setLoadingState(true);

            let result;
            if (method === 'neural') {
                result = await this.neuralMethods.integration.solve(func, a, b);
            } else {
                switch (method) {
                    case 'simpson': 
                        result = this.methods.simpson.solve(func, a, b); 
                        break;
                    case 'trapezoidal': 
                        result = this.methods.trapezoidal.solve(func, a, b); 
                        break;
                    case 'rectangles': 
                        result = this.methods.rectangles.solve(func, a, b); 
                        break;
                    case 'monte-carlo': 
                        result = this.methods.monteCarlo.solve(func, a, b); 
                        break;
                    default:
                        this.app.showError('Неизвестный метод');
                        this.app.setLoadingState(false);
                        return;
                }
            }

            this.displayIntegrationResult(result);
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка расчета: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    async compareIntegrationMethods() {
        try {
            const func = document.getElementById('integration-function').value;
            const a = parseFloat(document.getElementById('integration-a').value);
            const b = parseFloat(document.getElementById('integration-b').value);
            
            if (!func || isNaN(a) || isNaN(b)) {
                this.app.showError('Введите функцию и пределы интегрирования');
                return;
            }

            this.app.setLoadingState(true);

            const results = await Promise.all([
                this._safeSolve(() => this.methods.simpson.solve(func, a, b)),
                this._safeSolve(() => this.methods.trapezoidal.solve(func, a, b)),
                this._safeSolve(() => this.methods.rectangles.solve(func, a, b)),
                this._safeSolve(() => this.methods.monteCarlo.solve(func, a, b)),
                this._safeSolve(() => this.neuralMethods.integration.solve(func, a, b))
            ]);

            const comparison = {
                simpson: results[0],
                trapezoidal: results[1],
                rectangles: results[2],
                monteCarlo: results[3],
                neural: results[4]
            };

            this.displayComparison(comparison, 'integration-results', 'Интегрирование');
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }


    
    // ДИФФУРЫ
    async solveDifferential() {
        try {
            const func = document.getElementById('diff-equation').value;
            const method = document.getElementById('diff-method').value;
            const x0 = parseFloat(document.getElementById('diff-x0').value);
            const y0 = parseFloat(document.getElementById('diff-y0').value);
            const xEnd = parseFloat(document.getElementById('diff-end').value);
            
            if (!func || isNaN(x0) || isNaN(y0) || isNaN(xEnd)) {
                this.app.showError('Введите уравнение и начальные условия');
                return;
            }

            this.app.setLoadingState(true);

            let result;
            if (method === 'neural') {
                result = await this.neuralMethods.differential.solve(func, x0, y0, xEnd);
            } else {
                switch (method) {
                    case 'euler': 
                        result = this.methods.euler.solve(func, x0, y0, xEnd); 
                        break;
                    case 'runge-kutta': 
                        result = this.methods.rungeKutta.solve(func, x0, y0, xEnd); 
                        break;
                    default:
                        this.app.showError('Неизвестный метод');
                        this.app.setLoadingState(false);
                        return;
                }
            }

            this.displayDifferentialResult(result);
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка расчета: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    async compareDiffMethods() {
        try {
            const func = document.getElementById('diff-equation').value;
            const x0 = parseFloat(document.getElementById('diff-x0').value);
            const y0 = parseFloat(document.getElementById('diff-y0').value);
            const xEnd = parseFloat(document.getElementById('diff-end').value);
            
            if (!func || isNaN(x0) || isNaN(y0) || isNaN(xEnd)) {
                this.app.showError('Введите уравнение и начальные условия');
                return;
            }

            this.app.setLoadingState(true);

            const results = await Promise.all([
                this._safeSolve(() => this.methods.euler.solve(func, x0, y0, xEnd)),
                this._safeSolve(() => this.methods.rungeKutta.solve(func, x0, y0, xEnd)),
                this._safeSolve(() => this.neuralMethods.differential.solve(func, x0, y0, xEnd))
            ]);

            const comparison = {
                euler: results[0],
                rungeKutta: results[1],
                neural: results[2]
            };

            this.displayComparison(comparison, 'differential-results', 'Дифф. уравнения');
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }


    
    //СИСТЕМЫ
    async solveSystem() {
        try {
            const equationInputs = document.querySelectorAll('.system-eq');
            const equations = Array.from(equationInputs).map(input => input.value).filter(eq => eq.trim());
            
            if (equations.length === 0) {
                this.app.showError('Введите уравнения системы');
                return;
            }

            const method = document.getElementById('system-method').value;
            this.app.setLoadingState(true);

            let result;
            if (method === 'neural') {
                result = await this.neuralMethods.systems.solve(equations);
            } else {
                const { matrix, vector } = this._parseEquations(equations);
                switch (method) {
                    case 'gauss': 
                        result = this.methods.gauss.solve(matrix, vector); 
                        break;
                    case 'jacobi': 
                        result = this.methods.jacobi.solve(matrix, vector); 
                        break;
                    case 'zeidel': 
                        result = this.methods.zeidel.solve(matrix, vector); 
                        break;
                    default:
                        this.app.showError('Неизвестный метод');
                        this.app.setLoadingState(false);
                        return;
                }
            }

            this.displaySystemResult(result);
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка расчета: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    async compareSystemMethods() {
        try {
            const equationInputs = document.querySelectorAll('.system-eq');
            const equations = Array.from(equationInputs).map(input => input.value).filter(eq => eq.trim());
            
            if (equations.length === 0) {
                this.app.showError('Введите уравнения системы');
                return;
            }

            this.app.setLoadingState(true);

            const { matrix, vector } = this._parseEquations(equations);
            const results = await Promise.all([
                this._safeSolve(() => this.methods.gauss.solve(matrix, vector)),
                this._safeSolve(() => this.methods.jacobi.solve(matrix, vector)),
                this._safeSolve(() => this.methods.zeidel.solve(matrix, vector)),
                this._safeSolve(() => this.neuralMethods.systems.solve(equations))
            ]);

            const comparison = {
                gauss: results[0],
                jacobi: results[1],
                zeidel: results[2],
                neural: results[3]
            };

            this.displayComparison(comparison, 'system-results', 'Системы уравнений');
            this.app.setLoadingState(false);

        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }



    
    //ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    async _safeSolve(solver) {
        try {
            return await solver();
        } catch (error) {
            return {
                converged: false,
                message: 'Ошибка: ' + error.message,
                method: 'Unknown'
            };
        }
    }

    _parseEquations(equations) {
        const n = equations.length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));
        const vector = Array(n).fill(0);
        
        const variables = [];
        for (let i = 0; i < n; i++) {
            variables.push(String.fromCharCode(120 + i)); // x, y, z, ...
        }
        
        for (let i = 0; i < n; i++) {
            const eq = equations[i].toLowerCase().replace(/\s/g, '');
            const [left, right] = eq.split('=');
            
            vector[i] = parseFloat(right);
            
            for (let j = 0; j < n; j++) {
                const varName = variables[j];
                const regex = new RegExp(`([+-]?\\d*\\.?\\d*)${varName}`);
                const match = left.match(regex);
                
                if (match) {
                    let coef = match[1] || '1';
                    if (coef === '+') coef = '1';
                    if (coef === '-') coef = '-1';
                    matrix[i][j] = parseFloat(coef);
                }
            }
        }
        
        return { matrix, vector };
    }


    
    //ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ
    displayEquationResult(result) {
        const container = document.getElementById('equation-results');
        this._displaySingleResult(container, result, 'Уравнение');
    }

    displayIntegrationResult(result) {
        const container = document.getElementById('integration-results');
        this._displaySingleResult(container, result, 'Интеграл');
    }

    displayDifferentialResult(result) {
        const container = document.getElementById('differential-results');
        this._displaySingleResult(container, result, 'Дифф. уравнение');
    }

    displaySystemResult(result) {
        const container = document.getElementById('system-results');
        this._displaySingleResult(container, result, 'Система');
    }

    _displaySingleResult(container, result, type) {
        if (!result.converged) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${result.message}
                </div>
            `;
            return;
        }

        let content = `
            <div class="result-success">
                <h4><i class="fas fa-check-circle"></i> ${type} решено!</h4>
                <p><strong>Метод:</strong> ${result.method}</p>
                <p><strong>Сообщение:</strong> ${result.message}</p>
        `;

        if (result.probability) {
            content += `<p><strong>Вероятность точности:</strong> ${result.probability}%</p>`;
        }

        if (result.roots && result.roots.length > 0) {
            content += `<p><strong>Корни:</strong> ${result.roots.map(r => r.x.toFixed(6)).join(', ')}</p>`;
        }

        if (result.result !== undefined && result.result !== null) {
            content += `<p><strong>Результат:</strong> ${result.result.toFixed(6)}</p>`;
        }

        if (result.solution && Array.isArray(result.solution)) {
            content += `<p><strong>Решение:</strong> [${result.solution.map(x => x.toFixed(6)).join(', ')}]</p>`;
        }

        if (result.iterations && result.iterations.length > 0) {
            content += `<p><strong>Итераций:</strong> ${result.iterations.length}</p>`;
        }

        content += `</div>`;
        container.innerHTML = content;
    }

    displayComparison(results, containerId, title) {
        const container = document.getElementById(containerId);
        let html = `
            <div class="comparison-results">
                <h3><i class="fas fa-chart-bar"></i> Сравнение методов: ${title}</h3>
                <div class="methods-grid">
        `;

        for (const [methodName, result] of Object.entries(results)) {
            const methodClass = result.converged ? 'method-success' : 'method-error';
            const icon = result.converged ? 'fa-check-circle' : 'fa-times-circle';
            
            html += `
                <div class="method-result ${methodClass}">
                    <h4><i class="fas ${icon}"></i> ${this._formatMethodName(methodName)}</h4>
            `;
            
            if (result.converged) {
                html += `<p class="method-message">${result.message}</p>`;
                
                if (result.probability) {
                    html += `<p class="method-probability">Вероятность: ${result.probability}%</p>`;
                }
                
                if (result.roots && result.roots.length > 0) {
                    html += `<p class="method-roots">Корни: ${result.roots.map(r => r.x.toFixed(6)).join(', ')}</p>`;
                }
                
                if (result.result !== undefined && result.result !== null) {
                    html += `<p class="method-result-value">Результат: ${result.result.toFixed(6)}</p>`;
                }
                
                if (result.solution && Array.isArray(result.solution)) {
                    html += `<p class="method-solution">Решение: [${result.solution.map(x => x.toFixed(6)).join(', ')}]</p>`;
                }
                
                if (result.iterations && result.iterations.length > 0 && !result.probability) {
                    html += `<p class="method-iterations">Итераций: ${result.iterations.length}</p>`;
                }
            } else {
                html += `<p class="method-error-message">${result.message}</p>`;
            }
            
            html += `</div>`;
        }

        html += `</div></div>`;
        container.innerHTML = html;
    }

    _formatMethodName(method) {
        const names = {
            newton: 'Метод Ньютона',
            bisection: 'Метод половинного деления',
            iteration: 'Метод итераций',
            secant: 'Метод секущих',
            simpson: 'Метод Симпсона',
            trapezoidal: 'Метод трапеций',
            rectangles: 'Метод прямоугольников',
            monteCarlo: 'Метод Монте-Карло',
            euler: 'Метод Эйлера',
            rungeKutta: 'Метод Рунге-Кутты',
            gauss: 'Метод Гаусса',
            jacobi: 'Метод Якоби',
            zeidel: 'Метод Зейделя',
            neural: 'Нейросеть'
        };
        
        return names[method] || method;
    }
}

export default EventManager;
