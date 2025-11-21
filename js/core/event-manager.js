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
        this.methods = {};
        this.neuralMethods = {};
    }

    initialize(appInstance) {
        this.app = appInstance;
        this.initMethods();
        this.setupTabHandlers();
        this.setupCalculationHandlers();
        this.setupSystemInputs();
    }

    initMethods() {
        const parser = this.app.getMathParser();
        
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
        
        this.neuralMethods.equations = new NNEquations(parser);
        this.neuralMethods.integration = new NNIntegration(parser);
        this.neuralMethods.differential = new NNDifferential(parser);
        this.neuralMethods.systems = new NNSystems(parser);
    }

    setupTabHandlers() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.switchToTab(e.currentTarget.dataset.tab);
            });
        });
    }

    setupSystemInputs() {
        const systemCountInput = document.getElementById('system-count');
        if (systemCountInput) {
            systemCountInput.addEventListener('change', (e) => {
                this.updateSystemInputs(parseInt(e.target.value));
            });
            this.updateSystemInputs(2);
        }
    }

    updateSystemInputs(count) {
        const container = document.getElementById('system-equations');
        if (!container) return;
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
        document.getElementById('calculate-equation')?.addEventListener('click', () => this.solveEquation());
        document.getElementById('compare-equation-methods')?.addEventListener('click', () => this.compareEquationMethods());
        document.getElementById('calculate-integration')?.addEventListener('click', () => this.solveIntegration());
        document.getElementById('compare-integration-methods')?.addEventListener('click', () => this.compareIntegrationMethods());
        document.getElementById('calculate-differential')?.addEventListener('click', () => this.solveDifferential());
        document.getElementById('compare-diff-methods')?.addEventListener('click', () => this.compareDiffMethods());
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
                    case 'newton': result = this.methods.newton.solve(func, 1.0); break;
                    case 'bisection': 
                        const a = parseFloat(document.getElementById('equation-interval-a').value) || 0;
                        const b = parseFloat(document.getElementById('equation-interval-b').value) || 1;
                        result = this.methods.bisection.solve(func, a, b); 
                        break;
                    case 'iteration': result = this.methods.iteration.solve(func, 1.0); break;
                    case 'secant': result = this.methods.secant.solve(func, 0.5, 1.0); break;
                    default: this.app.showError('Неизвестный метод'); return;
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
            const results = {
                newton: this.methods.newton.solve(func, (a + b) / 2),
                bisection: this.methods.bisection.solve(func, a, b),
                iteration: this.methods.iteration.solve(func, (a + b) / 2),
                secant: this.methods.secant.solve(func, a, (a + b) / 2),
                neural: await this.neuralMethods.equations.solve(func, { min: a, max: b })
            };
            this.displayComparison(results, 'equation-results', 'Уравнения');
            this.app.setLoadingState(false);
        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    // ИНТЕГРАЛЫ
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
                    case 'simpson': result = this.methods.simpson.solve(func, a, b); break;
                    case 'trapezoidal': result = this.methods.trapezoidal.solve(func, a, b); break;
                    case 'rectangles': result = this.methods.rectangles.solve(func, a, b); break;
                    case 'monte-carlo': result = this.methods.monteCarlo.solve(func, a, b); break;
                    default: this.app.showError('Неизвестный метод'); return;
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
            const results = {
                simpson: this.methods.simpson.solve(func, a, b),
                trapezoidal: this.methods.trapezoidal.solve(func, a, b),
                rectangles: this.methods.rectangles.solve(func, a, b),
                monteCarlo: this.methods.monteCarlo.solve(func, a, b),
                neural: await this.neuralMethods.integration.solve(func, a, b)
            };
            this.displayComparison(results, 'integration-results', 'Интегрирование');
            this.app.setLoadingState(false);
        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    //ДИФФУРЫ
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
                    case 'euler': result = this.methods.euler.solve(func, x0, y0, xEnd); break;
                    case 'runge-kutta': result = this.methods.rungeKutta.solve(func, x0, y0, xEnd); break;
                    default: this.app.showError('Неизвестный метод'); return;
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
            const results = {
                euler: this.methods.euler.solve(func, x0, y0, xEnd),
                rungeKutta: this.methods.rungeKutta.solve(func, x0, y0, xEnd),
                neural: await this.neuralMethods.differential.solve(func, x0, y0, xEnd)
            };
            this.displayComparison(results, 'differential-results', 'Дифф. уравнения');
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
                const { matrix, vector } = this.parseEquations(equations);
                switch (method) {
                    case 'gauss': result = this.methods.gauss.solve(matrix, vector); break;
                    case 'jacobi': result = this.methods.jacobi.solve(matrix, vector); break;
                    case 'zeidel': result = this.methods.zeidel.solve(matrix, vector); break;
                    default: this.app.showError('Неизвестный метод'); return;
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
            const { matrix, vector } = this.parseEquations(equations);
            const results = {
                gauss: this.methods.gauss.solve(matrix, vector),
                jacobi: this.methods.jacobi.solve(matrix, vector),
                zeidel: this.methods.zeidel.solve(matrix, vector),
                neural: await this.neuralMethods.systems.solve(equations)
            };
            this.displayComparison(results, 'system-results', 'Системы уравнений');
            this.app.setLoadingState(false);
        } catch (error) {
            this.app.showError('Ошибка сравнения: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    //ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    parseEquations(equations) {
        const n = equations.length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));
        const vector = Array(n).fill(0);
        const variables = [];
        for (let i = 0; i < n; i++) {
            variables.push(String.fromCharCode(120 + i));
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

   /* displayEquationResult(result) {
    const container = document.getElementById('equation-results');
    this.displaySingleResult(container, result, 'уравнение');
}

displayIntegrationResult(result) {
    const container = document.getElementById('integration-results');
    this.displaySingleResult(container, result, 'интеграл');
}

displayDifferentialResult(result) {
    const container = document.getElementById('differential-results');
    this.displaySingleResult(container, result, 'дифференциальное уравнение');
}

displaySystemResult(result) {
    const container = document.getElementById('system-results');
    this.displaySingleResult(container, result, 'система уравнений');
}
*/
displaySingleResult(container, result, type) {
    if (!result.converged) {
        container.innerHTML = `<div class="error-message">${result.message}</div>`;
        return;
    }
    
    let content = `
        <div class="result-success">
            <h3>Результаты расчета</h3>
            <div class="result-main">
                <div class="result-icon">✅</div>
                <div class="result-text">${this.getSuccessMessage(type)} решено!</div>
            </div>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Метод:</span>
                    <span class="detail-value">${result.method || 'Не указан'}</span>
                </div>
    `;
    
    if (result.iterationsCount !== undefined) {
        content += `
                <div class="detail-row">
                    <span class="detail-label">Количество итераций:</span>
                    <span class="detail-value">${result.iterationsCount}</span>
                </div>
        `;
    }
    
    if (type === 'уравнение' && result.residual !== undefined) {
        content += `
                <div class="detail-row">
                    <span class="detail-label">Невязка:</span>
                    <span class="detail-value">${result.residual.toFixed(10)}</span>
                </div>
        `;
    }
    
    if (result.error !== undefined && result.error !== null && type !== 'уравнение') {
        content += `
                <div class="detail-row">
                    <span class="detail-label">Погрешность:</span>
                    <span class="detail-value">${result.error.toFixed(10)}</span>
                </div>
        `;
    }
    
    if (result.root !== undefined && result.root !== null) {
        content += `
                <div class="detail-row">
                    <span class="detail-label">Результат:</span>
                    <span class="detail-value">x ≈ ${result.root.toFixed(6)}</span>
                </div>
        `;
    } else if (result.result !== undefined && result.result !== null) {
        content += `
                <div class="detail-row">
                    <span class="detail-label">Результат:</span>
                    <span class="detail-value">${result.result.toFixed(6)}</span>
                </div>
        `;
    } else if (result.solution && Array.isArray(result.solution)) {
        content += `
                <div class="detail-row">
                    <span class="detail-label">Решение:</span>
                    <span class="detail-value">[${result.solution.map(x => x.toFixed(6)).join(', ')}]</span>
                </div>
        `;
    }
    
    content += `
            </div>
        </div>
    `;
    
    container.innerHTML = content;
    
    if (result.iterations && result.iterations.length > 0) {
        this.displayIterationsTable(container, result.iterations);
    }
}

// Вспомогательный метод для правильных сообщений
getSuccessMessage(type) {
    const messages = {
        'уравнение': 'Уравнение',
        'интеграл': 'Интеграл', 
        'дифференциальное уравнение': 'Дифференциальное уравнение',
        'система уравнений': 'Система уравнений'
    };
    return messages[type] || 'Задача';
}

    displayIterationsTable(container, iterations) {
        const tableHTML = `
            <div class="iterations-table-container">
                <h4>Процесс итераций:</h4>
                <table class="iterations-table">
                    <thead>
                        <tr>
                            <th>Итерация</th>
                            <th>x</th>
                            <th>f(x)</th>
                            <th>Ошибка</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${iterations.map(iter => `
                            <tr>
                                <td>${iter.iteration}</td>
                                <td>${iter.x?.toFixed(6) || iter.mid?.toFixed(6) || '-'}</td>
                                <td>${iter.fx?.toFixed(6) || iter.fMid?.toFixed(6) || iter.fCurrent?.toFixed(6) || '-'}</td>
                                <td>${iter.error?.toFixed(6) || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', tableHTML);
    }

    displayComparison(results, containerId, title) {
        const container = document.getElementById(containerId);
        let html = `<div class="comparison-results"><h3>Сравнение методов: ${title}</h3>`;
        for (const [method, result] of Object.entries(results)) {
            const methodClass = result.converged ? 'method-success' : 'method-error';
            html += `<div class="method-result ${methodClass}"><h4>${method}</h4>`;
            if (result.converged) {
                html += `<p>${result.message}</p>`;
                if (result.probability) html += `<p>Вероятность: ${result.probability}%</p>`;
                if (result.roots) html += `<p>Корни: ${result.roots.map(r => r.x.toFixed(6)).join(', ')}</p>`;
                if (result.result !== undefined) html += `<p>Результат: ${result.result.toFixed(6)}</p>`;
                if (result.solution && Array.isArray(result.solution)) html += `<p>Решение: [${result.solution.map(x => x.toFixed(6)).join(', ')}]</p>`;
            } else {
                html += `<p>${result.message}</p>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
    }
}

export default EventManager;
