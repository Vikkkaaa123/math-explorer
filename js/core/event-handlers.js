import { app } from './main.js';
import { MathParser } from '../math-core/math-parser.js';

/**
 * Менеджер событий приложения
 * Централизованная обработка всех пользовательских взаимодействий
 */
class EventManager {
    constructor() {
        this.handlers = new Map();
    }

    /**
     * Инициализация всех обработчиков событий
     */
    initialize(appInstance) {
        this.app = appInstance;
        
        console.log('🔄 Инициализация обработчиков событий...');
        
        try {
            this.initializeTabHandlers();
            this.initializeEquationHandlers();
            this.initializeIntegrationHandlers();
            this.initializeDifferentialHandlers();
            this.initializeSystemHandlers();
            this.initializeAreaHandlers();
            this.initializeAIHandlers();
            this.initializeGlobalHandlers();
            
            console.log('✅ Обработчики событий инициализированы');
        } catch (error) {
            console.error('❌ Ошибка инициализации обработчиков:', error);
            throw error;
        }
    }

    /**
     * Обработчики переключения вкладок
     */
    initializeTabHandlers() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            this.addEventListener(button, 'click', (e) => {
                e.preventDefault();
                const tabName = e.currentTarget.dataset.tab;
                console.log(`🎯 Переключение на вкладку: ${tabName}`);
                this.app.switchToTab(tabName);
            });
        });
    }

    /**
     * Обработчики для вкладки уравнений
     */
    initializeEquationHandlers() {
        const calculateBtn = document.getElementById('calculate-equation');
        
        if (calculateBtn) {
            this.addEventListener(calculateBtn, 'click', () => {
                this.handleEquationCalculation();
            });
        }

        // Обработка Enter в полях ввода уравнений
        const equationInputs = document.querySelectorAll('#equations-tab input');
        equationInputs.forEach(input => {
            this.addEventListener(input, 'keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleEquationCalculation();
                }
            });
        });
    }

    /**
     * Обработка расчета уравнений
     */
    async handleEquationCalculation() {
        try {
            this.app.setLoadingState(true);
            
            // Получение данных из полей ввода
            const functionInput = document.getElementById('equation-function');
            const intervalA = document.getElementById('equation-interval-a');
            const intervalB = document.getElementById('equation-interval-b');
            const precision = document.getElementById('equation-precision');
            
            // Валидация входных данных
            if (!this.validateEquationInputs(functionInput, intervalA, intervalB, precision)) {
                return;
            }
            
            const f_x = functionInput.value.trim();
            const a = parseFloat(intervalA.value);
            const b = parseFloat(intervalB.value);
            const eps = parseFloat(precision.value);
            
            console.log(`🧮 Расчет уравнения: f(x)=${f_x}, интервал [${a}, ${b}], точность ${eps}`);
            
            // Парсинг функции
            const parsedFunction = this.app.mathParser.parseFunction(f_x);
            
            // TODO: Здесь будет вызов численных методов и нейросети
            const results = await this.calculateEquationMethods(parsedFunction, a, b, eps);
            
            // Обновление UI с результатами
            this.updateEquationResults(results);
            
        } catch (error) {
            console.error('❌ Ошибка расчета уравнения:', error);
            this.app.showError(`Ошибка расчета: ${error.message}`);
        } finally {
            this.app.setLoadingState(false);
        }
    }

    /**
     * Валидация входных данных для уравнений
     */
    validateEquationInputs(functionInput, intervalA, intervalB, precision) {
        const errors = [];
        
        if (!functionInput.value.trim()) {
            errors.push('Введите функцию f(x)');
            functionInput.focus();
        }
        
        if (!intervalA.value || !intervalB.value) {
            errors.push('Укажите интервал поиска');
        } else if (parseFloat(intervalA.value) >= parseFloat(intervalB.value)) {
            errors.push('Начало интервала должно быть меньше конца');
            intervalA.focus();
        }
        
        if (!precision.value || parseFloat(precision.value) <= 0) {
            errors.push('Точность должна быть положительным числом');
            precision.focus();
        }
        
        if (errors.length > 0) {
            this.app.showError(errors.join('\n'));
            return false;
        }
        
        return true;
    }

    /**
     * Расчет уравнения разными методами (заглушка)
     */
    async calculateEquationMethods(func, a, b, eps) {
        // TODO: Заменить реальной имплементацией
        console.log('📊 Запуск расчета методов...');
        
        // Имитация расчета
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            bisection: {
                root: (a + b) / 2,
                iterations: 10,
                error: 0.001,
                time: 45,
                converged: true
            },
            newton: {
                root: (a + b) / 2 + 0.1,
                iterations: 5,
                error: 0.0001,
                time: 23,
                converged: true
            },
            neural: {
                root: (a + b) / 2 - 0.05,
                iterations: 100,
                error: 0.01,
                time: 120,
                converged: true
            }
        };
    }

    /**
     * Обновление результатов уравнений в UI
     */
    updateEquationResults(results) {
        const resultsContainer = document.getElementById('equation-results');
        
        if (!resultsContainer) {
            console.warn('Контейнер для результатов уравнений не найден');
            return;
        }
        
        const resultsHTML = `
            <div class="result-card">
                <h4>Метод половинного деления</h4>
                <div class="result-value">Корень: ${results.bisection.root.toFixed(6)}</div>
                <div class="result-meta">Итераций: ${results.bisection.iterations} | Погрешность: ${results.bisection.error.toExponential(2)}</div>
            </div>
            <div class="result-card">
                <h4>Метод Ньютона</h4>
                <div class="result-value">Корень: ${results.newton.root.toFixed(6)}</div>
                <div class="result-meta">Итераций: ${results.newton.iterations} | Погрешность: ${results.newton.error.toExponential(2)}</div>
            </div>
            <div class="result-card">
                <h4>Нейросеть</h4>
                <div class="result-value">Корень: ${results.neural.root.toFixed(6)}</div>
                <div class="result-meta">Эпох: ${results.neural.iterations} | Погрешность: ${results.neural.error.toExponential(2)}</div>
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHTML;
        console.log('✅ Результаты уравнений обновлены');
    }

    /**
     * Обработчики для вкладки интегрирования (заглушка)
     */
    initializeIntegrationHandlers() {
        const calculateBtn = document.querySelector('#integration-tab .calculate-btn');
        if (calculateBtn) {
            this.addEventListener(calculateBtn, 'click', () => {
                console.log('∫ Запуск расчета интеграла...');
                this.app.showError('Функционал интегрирования в разработке');
            });
        }
    }

    /**
     * Обработчики для вкладки диффуров (заглушка)
     */
    initializeDifferentialHandlers() {
        const calculateBtn = document.querySelector('#differential-tab .calculate-btn');
        if (calculateBtn) {
            this.addEventListener(calculateBtn, 'click', () => {
                console.log('📐 Запуск расчета диффура...');
                this.app.showError('Функционал диффуров в разработке');
            });
        }
    }

    /**
     * Обработчики для вкладки систем уравнений (заглушка)
     */
    initializeSystemHandlers() {
        const calculateBtn = document.querySelector('#systems-tab .calculate-btn');
        if (calculateBtn) {
            this.addEventListener(calculateBtn, 'click', () => {
                console.log('⚙️ Запуск расчета системы...');
                this.app.showError('Функционал систем уравнений в разработке');
            });
        }
    }

    /**
     * Обработчики для вкладки площадей (заглушка)
     */
    initializeAreaHandlers() {
        const calculateBtn = document.querySelector('#area-tab .calculate-btn');
        if (calculateBtn) {
            this.addEventListener(calculateBtn, 'click', () => {
                console.log('📏 Запуск расчета площади...');
                this.app.showError('Функционал площадей в разработке');
            });
        }
    }

    /**
     * Обработчики для AI вкладки
     */
    initializeAIHandlers() {
        const analyzeBtn = document.getElementById('analyze-ai-task');
        const taskInput = document.getElementById('ai-task-input');
        
        if (analyzeBtn) {
            this.addEventListener(analyzeBtn, 'click', () => {
                this.handleAIAnalysis();
            });
        }
        
        if (taskInput) {
            this.addEventListener(taskInput, 'keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.handleAIAnalysis();
                }
            });
        }
    }

    /**
     * Обработка AI анализа
     */
    async handleAIAnalysis() {
        const taskInput = document.getElementById('ai-task-input');
        const task = taskInput.value.trim();
        
        if (!task) {
            this.app.showError('Введите описание задачи');
            taskInput.focus();
            return;
        }
        
        console.log(`🤖 AI анализ задачи: "${task}"`);
        
        // TODO: Реализовать AI анализ
        this.app.showError('AI анализ в разработке');
    }

    /**
     * Глобальные обработчики
     */
    initializeGlobalHandlers() {
        // Обработка изменения темы
        this.addEventListener(document, 'keydown', (e) => {
            // Ctrl+T для переключения темы
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                const currentTheme = this.app.state.userPreferences.theme;
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.app.applyTheme(newTheme);
                console.log(`🎨 Переключение темы: ${newTheme}`);
            }
        });
        
        // Предотвращение закрытия страницы во время расчетов
        this.addEventListener(window, 'beforeunload', (e) => {
            if (this.app.state.calculationInProgress) {
                e.preventDefault();
                e.returnValue = 'Идут вычисления. Вы уверены, что хотите уйти?';
            }
        });
    }

    /**
     * Универсальный метод добавления обработчиков с отслеживанием
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        // Сохраняем для возможного удаления
        const key = `${event}-${Math.random().toString(36).substr(2, 9)}`;
        this.handlers.set(key, { element, event, handler });
    }

    /**
     * Удаление всех обработчиков (для очистки)
     */
    destroy() {
        this.handlers.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.handlers.clear();
        console.log('🧹 Обработчики событий очищены');
    }
}

export { EventManager };
