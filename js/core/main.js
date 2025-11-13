import MathParser from '../math-core/math-parser.js';
import EventManager from './event-manager.js';

class NumericalExplorer {
    constructor() {
        this.eventManager = new EventManager();
        this.mathParser = new MathParser();
        
        this.currentTab = 'equations';
        this.isCalculating = false;
        
        this.elements = {};
    }

    initialize() {
        console.log('🚀 Инициализация приложения...');
        
        // СНАЧАЛА находим элементы, потом всё остальное
        this.findElements();
        
        try {
            this.mathParser.initialize();
            console.log('✅ MathParser инициализирован');
            
            this.eventManager.initialize(this);
            console.log('✅ EventManager инициализирован');
            
            this.setupInitialState();
            console.log('✅ Начальное состояние установлено');
            
            this.testEventHandlers();
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }

    testEventHandlers() {
        console.log('🧪 Тест обработчиков:');
        console.log('Вкладки:', document.querySelectorAll('.tab-button').length);
        console.log('Кнопки расчета:', document.querySelectorAll('.calculate-btn').length);
        console.log('Кнопки сравнения:', document.querySelectorAll('.compare-btn').length);
        
        const elements = [
            'equation-function', 'equation-method', 'calculate-equation'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            console.log(`Элемент ${id}:`, element ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
        });
    }

    findElements() {
        this.elements.tabButtons = document.querySelectorAll('.tab-button');
        this.elements.tabPanes = document.querySelectorAll('.tab-pane');
        this.elements.calculateButtons = document.querySelectorAll('.calculate-btn');
        
        console.log('📋 Найдены элементы:', {
            tabButtons: this.elements.tabButtons.length,
            tabPanes: this.elements.tabPanes.length,
            calculateButtons: this.elements.calculateButtons.length
        });
    }
    
    setupInitialState() {
        this.switchToTab(this.currentTab);
    }

    switchToTab(tabName) {
        console.log('🔄 Переключение на вкладку:', tabName);
        this.currentTab = tabName;
        
        this.elements.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === tabName;
            button.classList.toggle('active', isActive);
        });
        
        this.elements.tabPanes.forEach(pane => {
            const isActive = pane.id === `${tabName}-tab`;
            pane.classList.toggle('active', isActive);
        });
    }

    showError(message) {
        console.error('❌ Ошибка:', message);
        alert('Ошибка: ' + message);
    }

    setLoadingState(isLoading) {
        this.isCalculating = isLoading;
        
        this.elements.calculateButtons.forEach(button => {
            button.disabled = isLoading;
            if (isLoading) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вычисление...';
            } else {
                button.innerHTML = '<i class="fas fa-play"></i> Рассчитать';
            }
        });
    }

    getCurrentTab() {
        return this.currentTab;
    }

    getMathParser() {
        return this.mathParser;
    }
}

// Ждем полной загрузки DOM перед инициализацией
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, запускаем приложение...');
    const app = new NumericalExplorer();
    app.initialize();
});

export default NumericalExplorer;
