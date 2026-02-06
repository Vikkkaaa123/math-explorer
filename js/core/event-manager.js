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
import ChartBuilder from '../visualization/charts/chart-builder.js';
import MathParserDE from '../math-core/math-parserDE.js';
import SystemParser from '../math-core/system-parser.js';

class EventManager {
    constructor() {
         this.methods = {};
        this.neuralMethods = {};
        this.chartBuilder = null;
        this.mathParserDE = null;
        this.systemParser = null;
    }

    initialize(appInstance) {
        this.app = appInstance;
        this.mathParserDE = new MathParserDE();
        this.mathParserDE.initialize();
        this.systemParser = new SystemParser();
        this.initMethods();
        this.setupTabHandlers();
        this.setupCalculationHandlers();
        this.setupSystemInputs();
        this.setupEquationDynamicInterface(); 
        this.setupSystemDynamicInterface();

 // Инициализируем поля начального приближения
    setTimeout(() => {
        const countInput = document.getElementById('system-count');
        if (countInput) {
            this.updateInitialGuessInputs(parseInt(countInput.value));
        }
    }, 500);
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
        this.methods.euler = new EulerMethod(this.mathParserDE);
        this.methods.rungeKutta = new RungeKuttaMethod(this.mathParserDE);
        this.methods.gauss = new GaussMethod();
        this.methods.jacobi = new JacobiMethod();
        this.methods.zeidel = new ZeidelMethod();
        
        this.neuralMethods.equations = new NNEquations(parser);
        this.neuralMethods.integration = new NNIntegration(parser);
        this.neuralMethods.differential = new NNDifferential(this.mathParserDE);
        this.neuralMethods.systems = new NNSystems();

        this.chartBuilder = new ChartBuilder(parser);
    }

    setupEquationDynamicInterface() {        
        const methodSelect = document.getElementById('equation-method');
        const container = document.getElementById('method-inputs-container');
      
        if (!methodSelect) {
            console.error('Элемент equation-method не найден!');
            return;
        }
        
        if (!container) {
            console.error('Элемент method-inputs-container не найден!');
            return;
        }
        
        methodSelect.addEventListener('change', (e) => {
            this.updateEquationInputs(e.target.value);
        });
        
        this.updateEquationInputs(methodSelect.value);
    }



    setupSystemDynamicInterface() {
    const methodSelect = document.getElementById('system-method');
    const container = document.getElementById('system-method-inputs');
    
    if (!methodSelect) {
        console.error('Элемент system-method не найден!');
        return;
    }
    
    if (!container) {
        console.error('Элемент system-method-inputs не найден!');
        return;
    }
    
    methodSelect.addEventListener('change', (e) => {
        this.updateSystemMethodInputs(e.target.value);
    });
    
    // Инициализируем поля при загрузке
    this.updateSystemMethodInputs(methodSelect.value);
}



    updateEquationInputs(method) {
        console.log('Обновление полей для метода:', method);
        
        const container = document.getElementById('method-inputs-container');
        
        if (!container) {
            console.error('ОШИБКА: Контейнер method-inputs-container не найден в updateEquationInputs!');
            return;
        }
        
        try {
            container.innerHTML = '';
        } catch (error) {
            console.error('Ошибка при очистке контейнера:', error);
            return;
        }
        
        if (!method) {
            console.log('Метод не выбран, очищаем контейнер');
            return;
        }
        
        const template = document.getElementById(`${method}-template`);
        
        if (!template) {
            console.warn(`Шаблон ${method}-template не найден`);
            return;
        }
        
        try {
            const content = template.content.cloneNode(true);
            container.appendChild(content);
        } catch (error) {
            console.error('Ошибка при добавлении полей:', error);
        }
    }





updateSystemMethodInputs(method) {
    console.log('Обновление полей для системного метода:', method);
    
    const container = document.getElementById('system-method-inputs');
    if (!container) {
        console.error('ОШИБКА: Контейнер system-method-inputs не найден!');
        return;
    }
    
    try {
        container.innerHTML = '';
    } catch (error) {
        console.error('Ошибка при очистке контейнера:', error);
        return;
    }
    
    if (!method) {
        console.log('Метод не выбран, очищаем контейнер');
        return;
    }
    
    const template = document.getElementById(`${method}-template`);
    
    if (!template) {
        console.warn(`Шаблон ${method}-template не найден`);
        return;
    }
    
    try {
        const content = template.content.cloneNode(true);
        container.appendChild(content);
        
        // Если это Якоби или Зейдель, обновляем поля начального приближения
        if (method === 'jacobi' || method === 'zeidel') {
            // Получаем текущее количество уравнений
            const countInput = document.getElementById('system-count');
            const count = countInput ? parseInt(countInput.value) : 2;
            
            // Обновляем поля векторного ввода
            setTimeout(() => {
                this.updateInitialGuessInputs(count);
            }, 50);
        }
        
    } catch (error) {
        console.error('Ошибка при добавлении полей:', error);
    }
}


    setupTabHandlers() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.currentTarget.dataset.tab;
            this.app.switchToTab(tab);
        });
    });
}




// Добавьте этот метод в EventManager
saveVectorInputValues(methodName, count) {
    // Сохраняем текущие значения перед обновлением
    const savedValues = [];
    for (let i = 0; i < count; i++) {
        const input = document.getElementById(`${methodName}-initial-${i}`);
        if (input && input.value !== '') {
            savedValues.push(input.value);
        }
    }
    return savedValues;
}

restoreVectorInputValues(methodName, savedValues) {
    // Восстанавливаем сохраненные значения
    if (savedValues && savedValues.length > 0) {
        setTimeout(() => {
            for (let i = 0; i < savedValues.length; i++) {
                const input = document.getElementById(`${methodName}-initial-${i}`);
                if (input) {
                    input.value = savedValues[i];
                }
            }
        }, 100);
    }
}


   setupSystemInputs() {
    const systemCountInput = document.getElementById('system-count');
    if (systemCountInput) {
        systemCountInput.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            this.updateSystemInputs(count);
            
            // Обновляем также поля начального приближения
            this.updateInitialGuessInputs(count);
        });
        this.updateSystemInputs(2);
        this.updateInitialGuessInputs(2);
    }
}

updateSystemInputs(count) {
    const container = document.getElementById('system-equations');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'equation-input-wrapper';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'system-eq';
        input.placeholder = `Введите уравнение ${i + 1} (например: 2x+3y=10)`;
        
        const label = document.createElement('div');
        label.className = 'equation-label';
        label.textContent = `Уравнение ${i + 1}:`;
        
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}

// Новый метод для создания полей начального приближения
updateInitialGuessInputs(count) {
    console.log('Обновление полей начального приближения для', count, 'уравнений');
    
    // Обновляем поля для Якоби
    const jacobiContainer = document.getElementById('jacobi-vector-inputs');
    if (jacobiContainer) {
        this.createVectorInputFields(jacobiContainer, count, 'jacobi');
    }
    
    // Обновляем поля для Зейделя
    const zeidelContainer = document.getElementById('zeidel-vector-inputs');
    if (zeidelContainer) {
        this.createVectorInputFields(zeidelContainer, count, 'zeidel');
    }
}

// Метод для создания полей векторного ввода
createVectorInputFields(container, count, methodName) {
    container.innerHTML = '';
    
    // Левая скобка
    const leftBracket = document.createElement('span');
    leftBracket.className = 'vector-bracket';
    leftBracket.textContent = '[';
    container.appendChild(leftBracket);
    
    // Поля ввода
    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'vector-input-wrapper';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = `vector-input-field ${methodName}-initial-guess`;
        input.id = `${methodName}-initial-${i}`;
        input.value = '0';
        input.step = 'any';
        input.placeholder = '0';
        
        wrapper.appendChild(input);
        
        // Добавляем разделитель, если не последний элемент
        if (i < count - 1) {
            const separator = document.createElement('span');
            separator.className = 'vector-separator';
            separator.textContent = ',';
            wrapper.appendChild(separator);
        }
        
        container.appendChild(wrapper);
    }
    
    // Правая скобка
    const rightBracket = document.createElement('span');
    rightBracket.className = 'vector-bracket';
    rightBracket.textContent = ']';
    container.appendChild(rightBracket);
    
    // Подсказка
    const hint = document.createElement('div');
    hint.className = 'vector-hint';
    hint.textContent = `Введите ${count} значений через запятую или используйте поля выше`;
    container.appendChild(hint);
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



    async solveEquation() {
        try {
            const func = document.getElementById('equation-function')?.value;
            const method = document.getElementById('equation-method')?.value;
            
            if (!func) {
                this.app.showError('Введите функцию');
                return;
            }
            
            if (!method) {
                this.app.showError('Выберите метод решения');
                return;
            }
            
            this.app.setLoadingState(true);
            let result;
            
            if (method === 'neural') {
                const a = parseFloat(document.getElementById('neural-interval-a')?.value) || -10;
                const b = parseFloat(document.getElementById('neural-interval-b')?.value) || 10;
                result = await this.neuralMethods.equations.solve(func, { min: a, max: b });
            } else {
                switch (method) {
                    case 'newton': 
                        const newtonX0 = parseFloat(document.getElementById('newton-x0')?.value) || 1.0;
                        const newtonPrecision = parseFloat(document.getElementById('newton-precision')?.value) || 0.0001;
                        result = this.methods.newton.solve(func, newtonX0, newtonPrecision); 
                        break;
                        
                    case 'bisection': 
                        const a = parseFloat(document.getElementById('bisection-a')?.value) || 0;
                        const b = parseFloat(document.getElementById('bisection-b')?.value) || 1;
                        const bisectionPrecision = parseFloat(document.getElementById('bisection-precision')?.value) || 0.0001;
                        result = this.methods.bisection.solve(func, a, b, bisectionPrecision); 
                        break;
                        
                   case 'iteration': 
                       const iterationX0 = parseFloat(document.getElementById('iteration-x0')?.value) || 1.0;
                       const iterationLambda = parseFloat(document.getElementById('iteration-lambda')?.value) || 0.1;
                       const iterationPrecision = parseFloat(document.getElementById('iteration-precision')?.value) || 0.0001;
                       result = this.methods.iteration.solve(func, iterationX0, iterationLambda, iterationPrecision); 
                       break;
                        
                    case 'secant': 
                        const x1 = parseFloat(document.getElementById('secant-x1')?.value) || 0.5;
                        const x2 = parseFloat(document.getElementById('secant-x2')?.value) || 1.0;
                        const secantPrecision = parseFloat(document.getElementById('secant-precision')?.value) || 0.0001;
                        result = this.methods.secant.solve(func, x1, x2, secantPrecision); 
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
        
        const newtonX0 = parseFloat(document.getElementById('newton-x0')?.value) || 1.0;
        const bisectionA = parseFloat(document.getElementById('bisection-a')?.value) || 0;
        const bisectionB = parseFloat(document.getElementById('bisection-b')?.value) || 1;
        const iterationX0 = parseFloat(document.getElementById('iteration-x0')?.value) || 1.0;
        const iterationLambda = parseFloat(document.getElementById('iteration-lambda')?.value) || 0.1;
        const secantX1 = parseFloat(document.getElementById('secant-x1')?.value) || 0.5;
        const secantX2 = parseFloat(document.getElementById('secant-x2')?.value) || 1.0;
        const neuralA = parseFloat(document.getElementById('neural-interval-a')?.value) || -10;
        const neuralB = parseFloat(document.getElementById('neural-interval-b')?.value) || 10;
        
        const results = {
            newton: this.methods.newton.solve(func, newtonX0),
            bisection: this.methods.bisection.solve(func, bisectionA, bisectionB),
            iteration: this.methods.iteration.solve(func, iterationX0, iterationLambda),
            secant: this.methods.secant.solve(func, secantX1, secantX2),
            neural: await this.neuralMethods.equations.solve(func, { min: neuralA, max: neuralB })
        };
        
        if (results.newton.converged) {
            this.chartBuilder.drawEquationChart(
                func, 
                results.newton.root, 
                results.newton.iterations, 
                'newton'
            );
        }
        
        this.displayComparison(results, 'equation-results', 'Уравнения');
        this.app.setLoadingState(false);
    } catch (error) {
        this.app.showError('Ошибка сравнения: ' + error.message);
        this.app.setLoadingState(false);
    }
}



    async solveIntegration() {
    try {
        const func = document.getElementById('integration-function').value;
        const method = document.getElementById('integration-method').value;
        const a = parseFloat(document.getElementById('integration-a').value);
        const b = parseFloat(document.getElementById('integration-b').value);
        const precision = parseFloat(document.getElementById('integration-precision').value) || 1e-6;
        const N = parseInt(document.getElementById('integration-n').value) || 100;
        const maxIterations = 50;
        
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
                    result = this.methods.simpson.solve(func, a, b, precision, N, maxIterations); 
                    break;
                case 'trapezoidal': 
                    result = this.methods.trapezoidal.solve(func, a, b, precision, N, maxIterations); 
                    break;
                case 'rectangles': 
                    result = this.methods.rectangles.solve(func, a, b, precision, N, maxIterations); 
                    break;
                case 'monte-carlo': 
                    result = this.methods.monteCarlo.solve(func, a, b, precision, N, maxIterations); 
                    break;
                default: 
                    this.app.showError('Неизвестный метод'); 
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
        const precision = parseFloat(document.getElementById('integration-precision').value) || 1e-6;
        const N = parseInt(document.getElementById('integration-n').value) || 100;
        const maxIterations = 50;
        
        if (!func || isNaN(a) || isNaN(b)) {
            this.app.showError('Введите функцию и пределы интегрирования');
            return;
        }
        
        this.app.setLoadingState(true);
        
        const results = {
            simpson: this.methods.simpson.solve(func, a, b, precision, N, maxIterations),
            trapezoidal: this.methods.trapezoidal.solve(func, a, b, precision, N, maxIterations),
            rectangles: this.methods.rectangles.solve(func, a, b, precision, N, maxIterations),
            monteCarlo: this.methods.monteCarlo.solve(func, a, b, precision, N, maxIterations),
            neural: await this.neuralMethods.integration.solve(func, a, b)
        };
        
        this.displayComparison(results, 'integration-results', 'Интегрирование');
        this.app.setLoadingState(false);
    } catch (error) {
        this.app.showError('Ошибка сравнения: ' + error.message);
        this.app.setLoadingState(false);
    }
}




    async solveDifferential() {
    try {
        const func = document.getElementById('diff-equation').value;
        const method = document.getElementById('diff-method').value;
        const x0 = parseFloat(document.getElementById('diff-x0').value);
        const y0 = parseFloat(document.getElementById('diff-y0').value);
        const xEnd = parseFloat(document.getElementById('diff-end').value);
        const step = parseFloat(document.getElementById('diff-step')?.value) || 0.1; // Добавить поле!
        
        console.log('Параметры диффура:', { func, method, x0, y0, xEnd, step });
        
        if (!func) {
            this.app.showError('Введите уравнение');
            return;
        }
        
        if (isNaN(x0) || isNaN(y0) || isNaN(xEnd)) {
            this.app.showError('Введите корректные числовые значения');
            return;
        }
        
        if (step <= 0) {
            this.app.showError('Шаг должен быть положительным');
            return;
        }
        
        this.app.setLoadingState(true);
        let result;
        
        if (method === 'neural') {
            result = await this.neuralMethods.differential.solve(func, x0, y0, xEnd);
        } else {
            switch (method) {
                case 'euler': 
                    result = this.methods.euler.solve(func, x0, y0, xEnd, step);
                    break;
                case 'runge-kutta': 
                    result = this.methods.rungeKutta.solve(func, x0, y0, xEnd, step);
                    break;
                default: 
                    this.app.showError('Неизвестный метод'); 
                    this.app.setLoadingState(false);
                    return;
            }
        }
        
        console.log('Результат диффура:', result);
        this.displayDifferentialResult(result);
        this.app.setLoadingState(false);
    } catch (error) {
        console.error('Ошибка расчета диффура:', error);
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
        const step = parseFloat(document.getElementById('diff-step')?.value) || 0.1;
        
        if (!func || isNaN(x0) || isNaN(y0) || isNaN(xEnd)) {
            this.app.showError('Введите уравнение и начальные условия');
            return;
        }
        
        this.app.setLoadingState(true);
        const results = {
            euler: this.methods.euler.solve(func, x0, y0, xEnd, step),
            rungeKutta: this.methods.rungeKutta.solve(func, x0, y0, xEnd, step),
            neural: await this.neuralMethods.differential.solve(func, x0, y0, xEnd)
        };
        
        //рисуем оба метода на одном графике
        if (results.euler.iterations && results.rungeKutta.iterations) {
            this.chartBuilder.drawDifferentialEquationChart(
                func,
                'compare',
                x0,
                y0,
                step,
                Math.max(results.euler.iterationsCount || 0, results.rungeKutta.iterationsCount || 0),
                {
                    euler: results.euler.iterations,
                    rungeKutta: results.rungeKutta.iterations
                }
            );
        }
        
        this.displayComparison(results, 'differential-results', 'Дифф. уравнения');
        this.app.setLoadingState(false);
    } catch (error) {
        this.app.showError('Ошибка сравнения: ' + error.message);
        this.app.setLoadingState(false);
    }
}




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
        
        // Парсим систему (один раз для всех методов)
        const { matrix, vector, variables } = this.systemParser.parseEquations(equations);
        
        console.log('=== СИСТЕМА ДЛЯ РЕШЕНИЯ ===');
        console.log('Метод:', method);
        console.log('Матрица:', matrix);
        console.log('Вектор:', vector);
        console.log('Переменные:', variables);
        
         let result;
        
        if (method === 'neural') {
            result = await this.neuralMethods.systems.solve(equations);
        } else {
            switch (method) {
                case 'gauss': 
                    result = this.methods.gauss.solve(matrix, vector, variables);
                    break;
                    
                case 'jacobi': 
                    const jacobiParams = this.getJacobiParameters(matrix.length);
                    result = this.methods.jacobi.solve(
                        matrix, 
                        vector, 
                        jacobiParams.initialGuess,
                        variables,
                        jacobiParams.precision,
                        jacobiParams.maxIterations
                    );
                    // Сохраняем начальное приближение для Якоби
                    result.initialGuess = jacobiParams.initialGuess;
                    break;
                    
                case 'zeidel': 
                    const zeidelParams = this.getZeidelParameters(matrix.length);
                    result = this.methods.zeidel.solve(
                        matrix, 
                        vector, 
                        zeidelParams.initialGuess,
                        variables,
                        zeidelParams.precision,
                        zeidelParams.maxIterations
                    );
                    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем начальное приближение для Зейделя
                    result.initialGuess = zeidelParams.initialGuess;
                    break;
                    
                default: 
                    this.app.showError('Неизвестный метод'); 
                    this.app.setLoadingState(false);
                    return;
            }
        }
        
        console.log('=== РЕЗУЛЬТАТ РЕШЕНИЯ ===');
        console.log('Метод:', result.method);
        console.log('Итерации:', result.iterations);
        console.log('Сошелся:', result.converged);
        console.log('Решение:', result.solution);
        console.log('Итерации:', result.iterations);
        console.log('Начальное приближение в result:', result.initialGuess); // Проверяем!
        
        // ВСЕГДА передаем данные системы в результат для графика
        // Но не перезаписываем, если они уже есть
        if (!result.matrix) result.matrix = matrix;
        if (!result.vector) result.vector = vector;
        if (!result.variables) result.variables = variables;
        
        this.displaySystemResult(result);
        this.app.setLoadingState(false);
        
    } catch (error) {
        console.error('Ошибка решения системы:', error);
        this.app.showError('Ошибка решения системы: ' + error.message);
        this.app.setLoadingState(false);
    }
}

getJacobiParameters(n) {
    console.log('getJacobiParameters вызван с n =', n);
    
    let precision = 1e-6;
    let maxIterations = 1000;
    
    // Получаем точность
    const precisionInput = document.getElementById('jacobi-precision');
    if (precisionInput && precisionInput.value) {
        precision = parseFloat(precisionInput.value);
    }
    
    // Получаем максимальное количество итераций
    const maxIterationsInput = document.getElementById('jacobi-max-iterations');
    if (maxIterationsInput && maxIterationsInput.value) {
        maxIterations = parseInt(maxIterationsInput.value);
    }
    
    // Получаем начальное приближение из векторных полей
    let initialGuess = Array(n).fill(0);
    
    try {
        // Собираем значения из полей векторного ввода
        const values = [];
        for (let i = 0; i < n; i++) {
            const input = document.getElementById(`jacobi-initial-${i}`);
            if (input && input.value !== '') {
                const val = parseFloat(input.value);
                if (!isNaN(val)) {
                    values.push(val);
                } else {
                    values.push(0);
                }
            } else {
                values.push(0);
            }
        }
        
        // Проверяем, все ли значения корректны
        if (values.length === n && values.every(v => !isNaN(v))) {
            initialGuess = values;
            console.log('Используем векторное приближение Якоби:', initialGuess);
        } else {
            console.log('Не все значения корректны, используем нули для Якоби');
        }
        
    } catch (e) {
        console.warn('Ошибка чтения начального приближения Якоби:', e);
    }
    
    return { precision, maxIterations, initialGuess };
}

getZeidelParameters(n) {
    console.log('getZeidelParameters вызван с n =', n);
    
    let precision = 1e-6;
    let maxIterations = 1000;
    
    const precisionInput = document.getElementById('zeidel-precision');
    if (precisionInput && precisionInput.value) {
        precision = parseFloat(precisionInput.value);
    }
    
    const maxIterationsInput = document.getElementById('zeidel-max-iterations');
    if (maxIterationsInput && maxIterationsInput.value) {
        maxIterations = parseInt(maxIterationsInput.value);
    }
    
    let initialGuess = Array(n).fill(0);
    
    try {
        // Собираем значения из полей векторного ввода
        const values = [];
        for (let i = 0; i < n; i++) {
            const input = document.getElementById(`zeidel-initial-${i}`);
            if (input && input.value !== '') {
                const val = parseFloat(input.value);
                if (!isNaN(val)) {
                    values.push(val);
                } else {
                    values.push(0);
                }
            } else {
                values.push(0);
            }
        }
        
        if (values.length === n && values.every(v => !isNaN(v))) {
            initialGuess = values;
            console.log('Используем векторное приближение Зейделя:', initialGuess);
        } else {
            console.log('Не все значения корректны, используем нули для Зейделя');
        }
        
    } catch (e) {
        console.warn('Ошибка чтения начального приближения Зейделя:', e);
    }
    
    return { precision, maxIterations, initialGuess };
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
        
        // Используем новый парсер
        const { matrix, vector, variables } = this.systemParser.parseEquations(equations);
        
        const results = {
            gauss: this.methods.gauss.solve(matrix, vector, variables),
            jacobi: this.methods.jacobi.solve(matrix, vector, this.getInitialApproximation(matrix.length)),
            zeidel: this.methods.zeidel.solve(matrix, vector, this.getInitialApproximation(matrix.length)),
            neural: await this.neuralMethods.systems.solve(equations)
        };
        
        this.displayComparison(results, 'system-results', 'Системы уравнений');
        this.app.setLoadingState(false);
    } catch (error) {
        this.app.showError('Ошибка сравнения: ' + error.message);
        this.app.setLoadingState(false);
    }
}






     displayEquationResult(result) {
    const container = document.getElementById('equation-results');
    this.displaySingleResult(container, result, 'уравнение');
    
    if (result.converged && result.root !== null) {
        const method = document.getElementById('equation-method').value;
        const func = document.getElementById('equation-function').value;
        this.chartBuilder.drawEquationChart(
            func, 
            result.root, 
            result.iterations, 
            method
        );
    }
}



displayIntegrationResult(result) {
    const container = document.getElementById('integration-results');
    
    if (!container) {
        console.error('Контейнер integration-results не найден');
        return;
    }
    
    // проверка сходимости
    if (!result.converged) {
        container.innerHTML = `<div class="error-message">${result.message}</div>`;
        return;
    }
    
    //получаем данные для графика
    const func = document.getElementById('integration-function').value;
    const a = parseFloat(document.getElementById('integration-a').value);
    const b = parseFloat(document.getElementById('integration-b').value);
    const method = document.getElementById('integration-method').value;
    
    //рисуем график
    if (func && !isNaN(a) && !isNaN(b) && method) {
        this.lastIntegrationData = { func, a, b, method, iterations: result.iterations };
        this.chartBuilder.drawIntegrationChart(func, a, b, method, result.iterations);
    } else {
        console.warn('Не все данные для графика:', { func, a, b, method });
    }
    
    let html = `
        <div class="result-success">
            <h3>Результаты интегрирования</h3>
            <div class="result-main">
                <div class="result-icon">✅</div>
                <div class="result-text">Интеграл вычислен!</div>
            </div>
    `;
    

    const resultValue = typeof result.result === 'string' 
        ? parseFloat(result.result) 
        : result.result;
    
    html += `
        <div class="result-details">
            <div class="detail-row">
                <span class="detail-label">Метод:</span>
                <span class="detail-value">${result.method || 'Метод Симпсона'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Результат:</span>
                <span class="detail-value">${resultValue !== null && resultValue !== undefined ? resultValue.toFixed(8) : '—'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Итераций:</span>
                <span class="detail-value">${result.iterations?.length || 0}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Погрешность:</span>
                <span class="detail-value">${result.iterations?.length > 0 ? 
                    (typeof result.iterations[result.iterations.length - 1].error === 'number' ? 
                     result.iterations[result.iterations.length - 1].error.toFixed(10) : '—') : '—'}</span>
            </div>
        </div>
    </div>
    `;
    
    if (result.iterations && result.iterations.length > 0) {
        html += `
            <div class="iterations-table-container">
                <h4>Процесс итераций:</h4>
                <table class="iterations-table">
                    <thead>
                        <tr>
                            <th>Итерация</th>
                            <th>n</th>
                            <th>h</th>
                            <th>I_n</th>
                            <th>Погрешность</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        result.iterations.forEach((iteration, index) => {
            const iterationNum = index + 1;
            const n = iteration.n || '—';
            const h = typeof iteration.h === 'number' ? iteration.h.toFixed(8) : iteration.h || '—';
            const I_n = typeof iteration.I_n === 'number' ? iteration.I_n.toFixed(8) : 
                       typeof iteration.result === 'number' ? iteration.result.toFixed(8) : '—';
            const error = typeof iteration.error === 'number' ? iteration.error.toFixed(8) : '—';
            
            html += `
                <tr>
                    <td>${iterationNum}</td> 
                    <td>${n}</td>
                    <td>${h}</td>
                    <td>${I_n}</td>
                    <td>${error}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    container.innerHTML = html;
}



    displayDifferentialResult(result) {
    const container = document.getElementById('differential-results');
    
    if (!container) {
        console.error('Контейнер differential-results не найден');
        return;
    }
    
    if (!result.converged) {
        container.innerHTML = `<div class="error-message">${result.message}</div>`;
        return;
    }
    
    let html = `
        <div class="result-success">
            <h3>📈 Дифференциальные уравнения</h3>
            <div class="result-main">
                <div class="result-icon">✅</div>
                <div class="result-text">Уравнение решено!</div>
            </div>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Метод:</span>
                    <span class="detail-value">${result.method || 'Не указан'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Уравнение:</span>
                    <span class="detail-value">y' = ${document.getElementById('diff-equation').value}</span>
                </div>
    `;
    
    if (result.parameters) {
        html += `
                <div class="detail-row">
                    <span class="detail-label">Начальные условия:</span>
                    <span class="detail-value">y(${result.parameters.x0}) = ${result.parameters.y0}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Конечная точка:</span>
                    <span class="detail-value">x_end = ${result.parameters.xEnd}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Шаг h:</span>
                    <span class="detail-value">${result.parameters.step}</span>
                </div>
        `;
    }
    
    html += `
                <div class="detail-row">
                    <span class="detail-label">Итераций (шагов):</span>
                    <span class="detail-value">${result.iterationsCount || result.iterations?.length || 0}</span>
                </div>
    `;
    
    if (result.final_y !== undefined && result.final_x !== undefined) {
        html += `
                <div class="detail-row">
                    <span class="detail-label">Финальная точка:</span>
                    <span class="detail-value">(${result.final_x.toFixed(6)}, ${result.final_y.toFixed(6)})</span>
                </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // Таблица итераций
    if (result.iterations && result.iterations.length > 0) {
        html += this.generateDiffIterationsTable(result.iterations, result.method);
    }
    
    container.innerHTML = html;
    
    // Рисуем график (если есть метод в chartBuilder)
    if (result.iterations && result.iterations.length > 0) {
    const step = parseFloat(document.getElementById('diff-step')?.value) || 0.1;
    const method = document.getElementById('diff-method').value;
    
    this.chartBuilder.drawDifferentialEquationChart(
        document.getElementById('diff-equation').value,
        method,
        result.iterations[0].x,
        result.iterations[0].y,
        step,
        result.iterationsCount || result.iterations.length,
        result.iterations
    );
}
}



generateDiffIterationsTable(iterations, methodName) {
    let tableHTML = `
        <div class="iterations-table-container">
            <h4>Процесс решения (первые 10 и последние 5 шагов):</h4>
            <table class="iterations-table">
                <thead>
                    <tr>
                        <th>Шаг</th>
                        <th>x</th>
                        <th>y</th>
    `;
    
    // Разные столбцы для разных методов
    if (methodName && methodName.includes('Эйлер')) {
        tableHTML += `<th>Производная</th>`;
    } else if (methodName && methodName.includes('Рунге-Кутт')) {
        tableHTML += `<th>k1</th><th>k2</th><th>k3</th><th>k4</th>`;
    }
    
    tableHTML += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Показываем первые 10 шагов
    const showFirst = Math.min(10, iterations.length);
    for (let i = 0; i < showFirst; i++) {
        const iter = iterations[i];
        tableHTML += this.generateDiffIterationRow(iter, methodName);
    }
    
    // Пропускаем если много итераций
    if (iterations.length > 15) {
        tableHTML += `
            <tr>
                <td colspan="${methodName.includes('Рунге-Кутт') ? 8 : 4}" 
                    style="text-align: center; color: #666; font-style: italic;">
                    ... ${iterations.length - 15} промежуточных шагов ...
                </td>
            </tr>
        `;
        
        // Показываем последние 5 шагов
        for (let i = Math.max(showFirst, iterations.length - 5); i < iterations.length; i++) {
            const iter = iterations[i];
            tableHTML += this.generateDiffIterationRow(iter, methodName);
        }
    }
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    return tableHTML;
}

generateDiffIterationRow(iter, methodName) {
    let row = `<tr>`;
    row += `<td>${iter.step || 0}</td>`;
    row += `<td>${iter.x.toFixed(6)}</td>`;
    row += `<td>${iter.y.toFixed(6)}</td>`;
    
    if (methodName && methodName.includes('Эйлер')) {
        row += `<td>${(iter.derivative || 0).toFixed(6)}</td>`;
    } else if (methodName && methodName.includes('Рунге-Кутт')) {
        row += `<td>${(iter.k1 || 0).toFixed(6)}</td>`;
        row += `<td>${(iter.k2 || 0).toFixed(6)}</td>`;
        row += `<td>${(iter.k3 || 0).toFixed(6)}</td>`;
        row += `<td>${(iter.k4 || 0).toFixed(6)}</td>`;
    }
    
    row += `</tr>`;
    return row;
}





    displaySystemResult(result) {
    const container = document.getElementById('system-results');
    if (!container) {
        console.error('Контейнер system-results не найден!');
        return;
    }
    
    if (!result.converged) {
        container.innerHTML = `<div class="error-message">${result.message}</div>`;
        return;
    }
    
    let html = `
        <div class="result-success">
            <h3>📊 ${result.method}</h3>
            <div class="result-main">
                <div class="result-icon">✅</div>
                <div class="result-text">
                    ${result.message || 'Система решена!'}
                </div>
            </div>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Метод:</span>
                    <span class="detail-value">${result.method}</span>
                </div>
    `;
    
    // Для Гаусса показываем определитель
    if (result.method === 'Метод Гаусса' && result.determinant !== null && result.determinant !== undefined) {
        html += `
                <div class="detail-row">
                    <span class="detail-label">Определитель:</span>
                    <span class="detail-value">${result.determinant.toFixed(6)}</span>
                </div>
        `;
    }
    
    // Для итерационных методов показываем количество итераций
    if ((result.method === 'Метод Якоби' || result.method === 'Метод Зейделя') && 
        result.iterationsCount !== null && result.iterationsCount !== undefined) {
        html += `
                <div class="detail-row">
                    <span class="detail-label">Итераций:</span>
                    <span class="detail-value">${result.iterationsCount}</span>
                </div>
        `;
    }
    
    if (result.residual !== null && result.residual !== undefined) {
        html += `
                <div class="detail-row">
                    <span class="detail-label">Невязка:</span>
                    <span class="detail-value">${result.residual.toFixed(10)}</span>
                </div>
        `;
    }
    
    html += `
                <div class="detail-row">
                    <span class="detail-label">Решение:</span>
                    <span class="detail-value solution">
    `;
    
    // Красиво выводим решение с именами переменных
    if (result.variables && result.solution) {
        result.variables.forEach((varName, idx) => {
            html += `${varName} = ${result.solution[idx].toFixed(6)}<br>`;
        });
    } else if (result.solution) {
        html += `[${result.solution.map(x => x.toFixed(6)).join(', ') || '—'}]`;
    }
    
    html += `</span>
                </div>
            </div>
        </div>
    `;
    
    // РАЗНЫЙ ВЫВОД ДЛЯ РАЗНЫХ МЕТОДОВ
    if (result.method === 'Метод Гаусса' && result.steps) {
        html += this.displayGaussSteps(result.steps, result.variables);
    } else if ((result.method === 'Метод Якоби' || result.method === 'Метод Зейделя') && 
               result.iterations && result.iterations.length > 0) {
        html += this.generateSystemIterationsTable(result.iterations, result.variables);
    }
    
    // Создаем контейнер для ОСНОВНОГО графика системы
    html += `
        <div class="chart-container">
            <div class="chart-wrapper" id="system-graph-wrapper">
                <h4>График системы уравнений</h4>
                <canvas id="system-chart" style="width: 100%; height: 400px;"></canvas>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // РИСУЕМ ОСНОВНОЙ ГРАФИК СИСТЕМЫ (всегда)
    // Проверяем, что система 2D
    if (result.variables && result.variables.length === 2 && 
        result.matrix && result.matrix.length === 2 && 
        result.vector && result.vector.length === 2 &&
        result.solution && result.solution.length === 2) {
        
        setTimeout(() => {
            try {
                // Определяем тип метода
                let methodType = 'gauss';
                if (result.method.includes('Якоби')) methodType = 'jacobi';
                if (result.method.includes('Зейделя') || result.method.includes('Зейдел')) methodType = 'zeidel';
                
                console.log('Рисуем ОСНОВНОЙ график системы, methodType:', methodType);
                
                // Рисуем основной график системы (уравнения + решение)
                const success = this.chartBuilder.drawSystemChart(
                    result.matrix,
                    result.vector,
                    result.variables,
                    methodType,
                    result
                );
                
                console.log('Основной график построен:', success);
                
            } catch (error) {
                console.warn('Ошибка построения основного графика:', error);
            }
        }, 100);
    }
}

displayGaussSteps(steps, variables) {
    let html = '<div class="gauss-steps">';
    
    steps.forEach((step, index) => {
        html += `<div class="gauss-step step-${step.type}">`;
        html += `<h4>${step.label}</h4>`;
        
        if (step.type === 'initial' || step.type === 'after_forward' || 
            step.type === 'row_swap' || step.type === 'elimination') {
            // Выводим матрицу
            html += `<div class="matrix-container">`;
            html += this.formatMatrixTable(step.matrix, variables);
            html += `</div>`;
            
            // Дополнительная информация
            if (step.details) {
                if (step.type === 'row_swap') {
                    html += `<p class="step-details">Переставлены строки ${step.details.row1} и ${step.details.row2}</p>`;
                } else if (step.type === 'elimination') {
                    html += `<p class="step-details">Обнулены элементы под диагональю в столбце ${step.details.column}</p>`;
                }
            }
            
        } else if (step.type === 'back_substitution') {
            // Выводим шаги обратной подстановки
            html += `<div class="back-substitution">`;
            step.steps.forEach(subStep => {
                html += `
                    <div class="substitution-step">
                        <span class="step-number">Шаг ${subStep.step}:</span>
                        <span class="variable">${subStep.variable}</span>
                        <span class="equation">${subStep.equation}</span>
                    </div>
                `;
            });
            html += `</div>`;
        } else if (step.type === 'error') {
            html += `<div class="error-step">
                <p>Матрица вырождена, решение невозможно</p>
            </div>`;
        }
        
        html += `</div>`;
    });
    
    html += '</div>';
    return html;
}

formatMatrixTable(matrix, variables) {
    const n = matrix.length;
    const m = matrix[0].length; // n+1 для расширенной матрицы
    
    let table = '<table class="matrix-table">';
    
    // Заголовок с именами переменных
    table += '<thead><tr><th></th>';
    for (let j = 0; j < m - 1; j++) {
        table += `<th>${variables?.[j] || `x${j+1}`}</th>`;
    }
    table += '<th class="vector-col">b</th></tr></thead>';
    
    // Данные матрицы
    table += '<tbody>';
    for (let i = 0; i < n; i++) {
        table += '<tr>';
        table += `<td class="row-label">${i+1}</td>`;
        
        for (let j = 0; j < m; j++) {
            const value = matrix[i][j];
            let displayValue = value.toFixed(4);
            let cellClass = '';
            
            // Подсветка
            if (Math.abs(value) < 1e-10) {
                displayValue = '0.0000';
                cellClass = 'zero';
            } else if (j === i) {
                cellClass = 'diagonal';
            } else if (j < i && j < m - 1) {
                cellClass = 'below-diagonal';
            }
            
            // Последний столбец (вектор b)
            if (j === m - 1) {
                cellClass += ' vector-cell';
            }
            
            table += `<td class="${cellClass}">${displayValue}</td>`;
        }
        
        table += '</tr>';
    }
    table += '</tbody></table>';
    
    return table;
}



generateSystemIterationsTable(iterations, variables) {
    let tableHTML = `
        <div class="iterations-table-container">
            <h4>Процесс итераций:</h4>
            <table class="iterations-table">
                <thead>
                    <tr>
                        <th>Итерация</th>
    `;
    
    // Заголовки для переменных
    variables.forEach((varName, idx) => {
        tableHTML += `<th>${varName}</th>`;
    });
    
    tableHTML += `
                        <th>Невязка</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Показываем первые 10 шагов
    const showFirst = Math.min(10, iterations.length);
    for (let i = 0; i < showFirst; i++) {
        tableHTML += this.generateSystemIterationRow(iterations[i], variables, i);
    }
    
    // Пропускаем если много итераций
    if (iterations.length > 15) {
        tableHTML += `
            <tr>
                <td colspan="${variables.length + 2}" style="text-align: center; color: #666; font-style: italic;">
                    ... ${iterations.length - 15} промежуточных итераций ...
                </td>
            </tr>
        `;
        
        // Показываем последние 5 шагов
        for (let i = Math.max(showFirst, iterations.length - 5); i < iterations.length; i++) {
            tableHTML += this.generateSystemIterationRow(iterations[i], variables, i);
        }
    }
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    return tableHTML;
}

generateSystemIterationRow(iter, variables, index) {
    let row = `<tr>`;
    row += `<td>${iter.iteration || index + 1}</td>`;
    
    // Значения переменных
    variables.forEach((_, idx) => {
        const value = iter.x?.[idx] || iter.solution?.[idx] || 0;
        row += `<td>${value.toFixed(6)}</td>`;
    });
    
    // Только невязка
    row += `<td>${iter.residual?.toFixed(6) || '—'}</td>`;
    
    row += `</tr>`;
    return row;
}





    displaySingleResult(container, result, type) {
        if (!container) {
            console.error(`Контейнер для ${type} не найден`);
            return;
        }
        
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
