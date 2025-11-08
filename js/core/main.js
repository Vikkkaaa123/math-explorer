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
    this.findElements();
    this.eventManager.initialize(this);
    this.mathParser.initialize();
    this.setupInitialState();
}

findElements() {
    this.elements.tabButtons = document.querySelectorAll('.tab-button');
    this.elements.tabPanes = document.querySelectorAll('.tab-pane');
    this.elements.calculateButtons = document.querySelectorAll('.calculate-btn');
}
    
    setupInitialState() {
        this.switchToTab(this.currentTab);
        this.setDefaultValues();
    }

    switchToTab(tabName) {
        this.currentTab = tabName;
        
        this.elements.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === tabName;
            button.classList.toggle('active', isActive);
        });
        
        this.elements.tabPanes.forEach(pane => {
            const isActive = pane.id === `${tabName}-tab`;
            pane.classList.toggle('active', isActive);
        });
        
        this.setupTab(tabName);
    }

    setupTab(tabName) {
        switch(tabName) {
            case 'equations':
                this.setupEquationsTab();
                break;
            case 'ai':
                this.setupAITab();
                break;
        }
    }

    setupEquationsTab() {
        const functionInput = document.getElementById('equation-function');
        if (functionInput && !functionInput.value) {
            functionInput.value = 'x^3 - 2*x - 5';
        }
        
        const precisionInput = document.getElementById('equation-precision');
        if (precisionInput && !precisionInput.value) {
            precisionInput.value = '0.0001';
        }
    }

    setupAITab() {
        const taskInput = document.getElementById('ai-task-input');
        if (taskInput && !taskInput.placeholder) {
            taskInput.placeholder = 'Например: найди корень уравнения x^2 - 4 = 0';
        }
    }

    setDefaultValues() {
        const precisionInputs = document.querySelectorAll('input[type="number"]');
        precisionInputs.forEach(input => {
            if (input.id.includes('precision') && !input.value) {
                input.value = '0.0001';
            }
        });
    }

    showError(message) {
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

const app = new NumericalExplorer();
export default app;
