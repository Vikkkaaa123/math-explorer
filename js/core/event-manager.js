import app from './main.js';
import NewtonMethod from '../numerical-methods/equations/newton.js';
import BisectionMethod from '../numerical-methods/equations/bisection.js';
import IterationMethod from '../numerical-methods/equations/iteration.js';
import SecantMethod from '../numerical-methods/equations/secant.js';

class EventManager {
    constructor() {
        this.handlers = new Map();
        this.methods = {};
    }

    initialize(appInstance) {
        this.app = appInstance;
        this.initMethods();
        this.setupTabHandlers();
        this.setupCalculationHandlers();
    }

    initMethods() {
        const parser = this.app.getMathParser();
        this.methods.newton = new NewtonMethod(parser);
        this.methods.bisection = new BisectionMethod(parser);
        this.methods.iteration = new IterationMethod(parser);
        this.methods.secant = new SecantMethod(parser);
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

    setupCalculationHandlers() {
        // Обработчик для уравнений
        const equationBtn = document.getElementById('calculate-equation');
        if (equationBtn) {
            equationBtn.addEventListener('click', () => this.solveEquation());
        }

        // Обработчик для сравнения методов уравнений
        const compareEquationBtn = document.getElementById('compare-equation-methods');
        if (compareEquationBtn) {
            compareEquationBtn.addEventListener('click', () => this.compareEquationMethods());
        }

        // Заглушки для других вкладок
        document.getElementById('calculate-integration')?.addEventListener('click', () => {
            this.app.showError('Интегрирование в разработке');
        });
        document.getElementById('calculate-differential')?.addEventListener('click', () => {
            this.app.showError('Диффуры в разработке');
        });
        document.getElementById('calculate-system')?.addEventListener('click', () => {
            this.app.showError('Системы в разработке');
        });
    }

    solveEquation() {
        try {
            const func = document.getElementById('equation-function').value;
            const method = document.getElementById('equation-method').value;
            
            if (!func) {
                this.app.showError('Введите функцию');
                return;
            }

            this.app.setLoadingState(true);

            setTimeout(() => {
                let result;
                
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
                    case 'neural':
                        this.app.showError('Нейросеть в разработке');
                        this.app.setLoadingState(false);
                        return;
                    default:
                        this.app.showError('Неизвестный метод');
                        this.app.setLoadingState(false);
                        return;
                }

                this.displayEquationResult(result);
                this.app.setLoadingState(false);
                
            }, 100);

        } catch (error) {
            this.app.showError('Ошибка расчета: ' + error.message);
            this.app.setLoadingState(false);
        }
    }

    displayEquationResult(result) {
        const resultsContainer = document.getElementById('equation-results');
        resultsContainer.innerHTML = '';

        if (!result.converged) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${result.message}
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="result-success">
                <h4><i class="fas fa-check-circle"></i> Решение найдено!</h4>
                <p><strong>Корень:</strong> ${result.root.toFixed(6)}</p>
                <p><strong>Сообщение:</strong> ${result.message}</p>
                <p><strong>Итераций:</strong> ${result.iterations.length}</p>
            </div>
        `;

        if (result.iterations.length > 0) {
            this.displayIterationsTable(resultsContainer, result.iterations);
        }
    }

    displayIterationsTable(container, iterations) {
        const table = document.createElement('table');
        table.className = 'iterations-table';
        
        table.innerHTML = `
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
        `;
        
        container.appendChild(table);
    }

    compareEquationMethods() {
        this.app.showError('Сравнение методов в разработке');
    }

    addHandler(element, event, handler) {
        element.addEventListener(event, handler);
        this.handlers.set(element, { event, handler });
    }
}

export default EventManager;
