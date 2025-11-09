import app from './main.js';

class EventManager {
    constructor() {
        this.handlers = new Map();
    }

    initialize(appInstance) {
        this.app = appInstance;
        this.setupTabHandlers();
        this.setupBasicHandlers();
    }

    setupTabHandlers() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            this.addHandler(button, 'click', (e) => {
                e.preventDefault();
                const tabName = e.currentTarget.dataset.tab;
                this.app.switchToTab(tabName);
            });
        });
    }

    setupBasicHandlers() {
        // Пока просто заглушки для кнопок
        const calculateBtns = document.querySelectorAll('.calculate-btn');
        const compareBtns = document.querySelectorAll('.compare-btn');
        
        calculateBtns.forEach(btn => {
            this.addHandler(btn, 'click', () => {
                this.app.showError('Функционал в разработке');
            });
        });

        compareBtns.forEach(btn => {
            this.addHandler(btn, 'click', () => {
                this.app.showError('Сравнение методов в разработке');
            });
        });
    }
}

export default EventManager;
