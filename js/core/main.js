import { MathParser } from '../math-core/math-parser.js';
import { EventManager } from './event-handlers.js';
import { Config } from './config.js';

/**
 * Главный класс приложения - ядро системы
 * Управляет инициализацией, состоянием и координацией модулей
 */
class NumericalExplorer {
    constructor() {
        this.config = new Config();
        this.eventManager = new EventManager();
        this.mathParser = new MathParser();
        
        // Состояние приложения
        this.state = {
            currentTab: 'equations',
            calculationInProgress: false,
            currentResults: null,
            userPreferences: {
                precision: 0.0001,
                theme: 'light'
            }
        };
        
        // Ссылки на DOM элементы
        this.elements = {};
    }

    /**
     * Инициализация приложения после загрузки DOM
     */
    async initialize() {
        try {
            console.log('🚀 Инициализация Numerical Explorer...');
            
            // 1. Инициализация DOM элементов
            this.initializeDOMElements();
            
            // 2. Инициализация менеджера событий
            this.eventManager.initialize(this);
            
            // 3. Инициализация математического парсера
            await this.mathParser.initialize();
            
            // 4. Установка начального состояния
            this.setInitialState();
            
            // 5. Показ приветственного сообщения
            this.showWelcomeMessage();
            
            console.log('✅ Numerical Explorer успешно инициализирован');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showError('Ошибка запуска приложения: ' + error.message);
        }
    }

    /**
     * Инициализация ссылок на DOM элементы
     */
    initializeDOMElements() {
        this.elements = {
            // Контейнеры вкладок
            tabsContent: document.querySelector('.tabs-content'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            
            // Кнопки вкладок
            tabButtons: document.querySelectorAll('.tab-button'),
            
            // Основные секции
            header: document.querySelector('.app-header'),
            main: document.querySelector('.main-content'),
            footer: document.querySelector('.app-footer'),
            
            // Контейнеры для результатов
            equationResults: document.getElementById('equation-results'),
            aiResults: document.getElementById('ai-results'),
            
            // Графики
            equationChart: document.getElementById('equation-chart')
        };

        // Проверка что все элементы найдены
        this.validateDOMElements();
    }

    /**
     * Проверка что все необходимые DOM элементы найдены
     */
    validateDOMElements() {
        const requiredElements = [
            'tabsContent', 'tabButtons', 'header', 'main', 'footer'
        ];
        
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            throw new Error(`Не найдены DOM элементы: ${missingElements.join(', ')}`);
        }
    }

    /**
     * Установка начального состояния приложения
     */
    setInitialState() {
        // Активация начальной вкладки
        this.switchToTab(this.state.currentTab);
        
        // Установка значений по умолчанию
        this.updatePrecisionDisplay();
        
        // Применение темы
        this.applyTheme(this.state.userPreferences.theme);
    }

    /**
     * Переключение на указанную вкладку
     */
    switchToTab(tabName) {
        // Валидация имени вкладки
        const validTabs = ['equations', 'integration', 'differential', 'systems', 'area', 'ai'];
        if (!validTabs.includes(tabName)) {
            console.warn(`Попытка переключения на неизвестную вкладку: ${tabName}`);
            return;
        }

        // Обновление состояния
        this.state.currentTab = tabName;

        // Обновление UI вкладок
        this.updateTabButtons(tabName);
        this.updateTabPanes(tabName);

        // Логирование для отладки
        console.log(`📁 Переключение на вкладку: ${tabName}`);
        
        // Вызов специфичной инициализации для вкладки
        this.initializeTabSpecificComponents(tabName);
    }

    /**
     * Обновление состояния кнопок вкладок
     */
    updateTabButtons(activeTab) {
        this.elements.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === activeTab;
            button.classList.toggle('active', isActive);
            
            // Обновление ARIA атрибутов для доступности
            button.setAttribute('aria-selected', isActive);
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    /**
     * Обновление отображения панелей вкладок
     */
    updateTabPanes(activeTab) {
        this.elements.tabPanes.forEach(pane => {
            const isActive = pane.id === `${activeTab}-tab`;
            pane.classList.toggle('active', isActive);
            pane.setAttribute('aria-hidden', !isActive);
        });
    }

    /**
     * Инициализация компонентов специфичных для вкладки
     */
    initializeTabSpecificComponents(tabName) {
        switch (tabName) {
            case 'equations':
                this.initializeEquationsTab();
                break;
            case 'integration':
                this.initializeIntegrationTab();
                break;
            case 'differential':
                this.initializeDifferentialTab();
                break;
            case 'systems':
                this.initializeSystemsTab();
                break;
            case 'area':
                this.initializeAreaTab();
                break;
            case 'ai':
                this.initializeAITab();
                break;
        }
    }

    /**
     * Инициализация вкладки уравнений
     */
    initializeEquationsTab() {
        // Установка значений по умолчанию для полей ввода
        const functionInput = document.getElementById('equation-function');
        if (functionInput && !functionInput.value) {
            functionInput.value = 'x^3 - 2*x - 5';
        }
        
        console.log('📈 Инициализация вкладки уравнений');
    }

    /**
     * Инициализация вкладки интегрирования
     */
    initializeIntegrationTab() {
        console.log('∫ Инициализация вкладки интегрирования');
        // TODO: Добавить специфичную логику
    }

    /**
     * Инициализация вкладки диффуров
     */
    initializeDifferentialTab() {
        console.log('📐 Инициализация вкладки диффуров');
        // TODO: Добавить специфичную логику
    }

    /**
     * Инициализация вкладки систем уравнений
     */
    initializeSystemsTab() {
        console.log('⚙️ Инициализация вкладки систем уравнений');
        // TODO: Добавить специфичную логику
    }

    /**
     * Инициализация вкладки площадей
     */
    initializeAreaTab() {
        console.log('📏 Инициализация вкладки площадей');
        // TODO: Добавить специфичную логику
    }

    /**
     * Инициализация AI вкладки
     */
    initializeAITab() {
        console.log('🤖 Инициализация AI вкладки');
        // TODO: Добавить специфичную логику
    }

    /**
     * Обновление отображения точности
     */
    updatePrecisionDisplay() {
        const precisionInputs = document.querySelectorAll('input[type="number"]');
        precisionInputs.forEach(input => {
            if (input.id.includes('precision') && !input.value) {
                input.value = this.state.userPreferences.precision;
            }
        });
    }

    /**
     * Применение темы оформления
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.state.userPreferences.theme = theme;
    }

    /**
     * Показать приветственное сообщение
     */
    showWelcomeMessage() {
        console.log(`
🌈 Добро пожаловать в Numerical Explorer!
        
Доступные вкладки:
📈 Уравнения - решение f(x) = 0
∫ Интегрирование - вычисление интегралов  
📐 Дифф. уравнения - решение ОДУ
⚙️ Системы уравнений - решение систем
📏 Поиск площадей - площадь между кривыми
🤖 AI-Сравнение - умный ввод

Текущая точность: ${this.state.userPreferences.precision}
        `);
    }

    /**
     * Показать сообщение об ошибке
     */
    showError(message) {
        // Временная реализация - можно заменить на красивый toast
        console.error('❌ Ошибка:', message);
        alert(`Ошибка: ${message}`);
    }

    /**
     * Установка состояния "загрузка"
     */
    setLoadingState(isLoading) {
        this.state.calculationInProgress = isLoading;
        document.body.classList.toggle('loading', isLoading);
        
        // Блокировка/разблокировка кнопок
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.classList.contains('calculate-btn')) return;
            button.disabled = isLoading;
            button.innerHTML = isLoading ? 
                '<i class="fas fa-spinner fa-spin"></i> Вычисление...' : 
                '<i class="fas fa-play"></i> Рассчитать';
        });
    }

    /**
     * Получение текущего состояния
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Обновление состояния
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }
}

// Создание и экспорт глобального экземпляра приложения
const numericalExplorer = new NumericalExplorer();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    numericalExplorer.initialize().catch(console.error);
});

// Экспорт для использования в других модулях
export { NumericalExplorer, numericalExplorer as app };
