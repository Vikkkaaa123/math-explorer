import { MathParser } from '../math-core/math-parser.js';
import { EventManager } from './event-handlers.js';

class NumericalExplorer {
    constructor() {
        this.config = {};
        this.eventManager = new EventManager();
        this.mathParser = new MathParser();
        
        this.state = {
            currentTab: 'equations',
            calculationInProgress: false,
            currentResults: null,
            userPreferences: {
                precision: 0.0001,
                theme: 'light'
            }
        };
        
        this.elements = {};
    }

    async initialize() {
        try {
            this.initializeDOMElements();
            this.eventManager.initialize(this);
            await this.mathParser.initialize();
            this.setInitialState();
            
        } catch (error) {
            this.showError('Ошибка запуска приложения: ' + error.message);
        }
    }

    initializeDOMElements() {
        this.elements = {
            tabsContent: document.querySelector('.tabs-content'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            tabButtons: document.querySelectorAll('.tab-button'),
            header: document.querySelector('.app-header'),
            main: document.querySelector('.main-content'),
            footer: document.querySelector('.app-footer'),
            equationResults: document.getElementById('equation-results'),
            aiResults: document.getElementById('ai-results'),
            equationChart: document.getElementById('equation-chart')
        };

        this.validateDOMElements();
    }

    validateDOMElements() {
        const requiredElements = ['tabsContent', 'tabButtons', 'header', 'main', 'footer'];
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            throw new Error(`Не найдены DOM элементы: ${missingElements.join(', ')}`);
        }
    }

    setInitialState() {
        this.switchToTab(this.state.currentTab);
        this.updatePrecisionDisplay();
        this.applyTheme(this.state.userPreferences.theme);
    }

    switchToTab(tabName) {
        const validTabs = ['equations', 'integration', 'differential', 'systems', 'area', 'ai'];
        if (!validTabs.includes(tabName)) return;

        this.state.currentTab = tabName;
        this.updateTabButtons(tabName);
        this.updateTabPanes(tabName);
        this.initializeTabSpecificComponents(tabName);
    }

    updateTabButtons(activeTab) {
        this.elements.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === activeTab;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive);
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    updateTabPanes(activeTab) {
        this.elements.tabPanes.forEach(pane => {
            const isActive = pane.id === `${activeTab}-tab`;
            pane.classList.toggle('active', isActive);
            pane.setAttribute('aria-hidden', !isActive);
        });
    }

    initializeTabSpecificComponents(tabName) {
        // Инициализация специфичная для вкладки
        const functionInput = document.getElementById('equation-function');
        if (tabName === 'equations' && functionInput && !functionInput.value) {
            functionInput.value = 'x^3 - 2*x - 5';
        }
    }

    updatePrecisionDisplay() {
        const precisionInputs = document.querySelectorAll('input[type="number"]');
        precisionInputs.forEach(input => {
            if (input.id.includes('precision') && !input.value) {
                input.value = this.state.userPreferences.precision;
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.state.userPreferences.theme = theme;
    }

    showError(message) {
        // Можно заменить на красивый toast
        alert(`Ошибка: ${message}`);
    }

    setLoadingState(isLoading) {
        this.state.calculationInProgress = isLoading;
        document.body.classList.toggle('loading', isLoading);
        
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.classList.contains('calculate-btn')) return;
            button.disabled = isLoading;
            button.innerHTML = isLoading ? 
                '<i class="fas fa-spinner fa-spin"></i> Вычисление...' : 
                '<i class="fas fa-play"></i> Рассчитать';
        });
    }

    getState() {
        return { ...this.state };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }
}

const numericalExplorer = new NumericalExplorer();

document.addEventListener('DOMContentLoaded', () => {
    numericalExplorer.initialize();
});

export { NumericalExplorer, numericalExplorer as app };
