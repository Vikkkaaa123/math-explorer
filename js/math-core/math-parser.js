class MathParser {
    constructor() {
        this.parser = null;
        this.ready = false;
        
        this.supportedFunctions = [
            'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
            'asin', 'acos', 'atan', 'acot',
            'sinh', 'cosh', 'tanh', 'coth',
            'log', 'log10', 'ln', 'exp', 'sqrt',
            'abs', 'ceil', 'floor', 'round', 'sign'
        ];
        
        this.supportedConstants = {
            'pi': Math.PI,
            'e': Math.E,
            'inf': Infinity
        };
    }

    initialize() {
        if (this.ready) return;

        if (typeof math === 'undefined') {
            throw new Error('Библиотека math.js не загружена');
        }
        
        this.parser = math;
        this.addCustomFunctions();
        this.ready = true;
    }

    addCustomFunctions() {
        this.parser.import({
            cot: x => 1 / Math.tan(x),
            sec: x => 1 / Math.cos(x),
            csc: x => 1 / Math.sin(x),
            acot: x => Math.PI / 2 - Math.atan(x),
            coth: x => 1 / Math.tanh(x),
            log: (x, base = 10) => Math.log(x) / Math.log(base),
            ln: x => Math.log(x)
        }, { override: true });
    }

    cleanExpression(expression) {
        console.log('Исходное выражение:', expression);
        
        let clean = expression
            .trim()
            .toLowerCase()
            
            // Убираем ВСЕ пробелы
            .replace(/\s+/g, '')
            
            // ВАЖНО: сначала заменяем функции на защищенные метки
            .replace(/sin/g, '§SIN§')
            .replace(/cos/g, '§COS§')
            .replace(/tan/g, '§TAN§')
            .replace(/cot/g, '§COT§')
            .replace(/sec/g, '§SEC§')
            .replace(/csc/g, '§CSC§')
            .replace(/asin/g, '§ASIN§')
            .replace(/acos/g, '§ACOS§')
            .replace(/atan/g, '§ATAN§')
            .replace(/acot/g, '§ACOT§')
            .replace(/sinh/g, '§SINH§')
            .replace(/cosh/g, '§COSH§')
            .replace(/tanh/g, '§TANH§')
            .replace(/coth/g, '§COTH§')
            .replace(/log/g, '§LOG§')
            .replace(/ln/g, '§LN§')
            .replace(/exp/g, '§EXP§')
            .replace(/sqrt/g, '§SQRT§')
            .replace(/abs/g, '§ABS§')
            
            // Теперь заменяем ЛЮБУЮ оставшуюся букву на 'x'
            .replace(/[a-zа-яё]/g, 'x')
            
            // Возвращаем функции обратно
            .replace(/§SIN§/g, 'sin')
            .replace(/§COS§/g, 'cos')
            .replace(/§TAN§/g, 'tan')
            .replace(/§COT§/g, 'cot')
            .replace(/§SEC§/g, 'sec')
            .replace(/§CSC§/g, 'csc')
            .replace(/§ASIN§/g, 'asin')
            .replace(/§ACOS§/g, 'acos')
            .replace(/§ATAN§/g, 'atan')
            .replace(/§ACOT§/g, 'acot')
            .replace(/§SINH§/g, 'sinh')
            .replace(/§COSH§/g, 'cosh')
            .replace(/§TANH§/g, 'tanh')
            .replace(/§COTH§/g, 'coth')
            .replace(/§LOG§/g, 'log')
            .replace(/§LN§/g, 'ln')
            .replace(/§EXP§/g, 'exp')
            .replace(/§SQRT§/g, 'sqrt')
            .replace(/§ABS§/g, 'abs')
            
            // Степень
            .replace(/\^/g, '**')
            
            // Автоматическое умножение
            .replace(/(\d)(x)/g, '$1*$2')     // 3x → 3*x
            .replace(/(\d)(\()/g, '$1*$2')    // 2( → 2*(
            .replace(/(\))(x)/g, '$1*$2')     // )x → )*x
            .replace(/(\))(\()/g, '$1*$2')    // )( → )*(
            .replace(/(x)(\()/g, '$1*$2');    // x( → x*(

        console.log('Унифицированное выражение:', clean);
        
        this.checkBrackets(clean);
        
        return clean;
    }

    parseFunction(expression) {
        if (!this.ready) {
            throw new Error('Парсер не готов');
        }

        if (!expression || typeof expression !== 'string') {
            throw new Error('Введите функцию');
        }

        try {
            const cleanExpression = this.cleanExpression(expression);
            console.log('Выражение для math.js:', cleanExpression);
            
            const compiled = this.parser.compile(cleanExpression);
            
            const parsedFunction = (x, variables = {}) => {
                const scope = { x, ...variables, ...this.supportedConstants };
                return compiled.evaluate(scope);
            };
            
            return parsedFunction;
            
        } catch (error) {
            console.error('Ошибка парсера:', error);
            throw new Error(this.getSimpleError(error, expression));
        }
    }

    checkBrackets(expression) {
        let count = 0;
        
        for (let char of expression) {
            if (char === '(') count++;
            if (char === ')') count--;
            if (count < 0) throw new Error('Ошибка в скобках');
        }
        
        if (count !== 0) throw new Error('Ошибка в скобках');
    }

    checkSymbols(expression) {
        // Разрешаем буквы, цифры, операторы и скобки
        const allowed = /^[0-9a-z+\-*/\^().,]+$/;
        const badChars = expression.split('').filter(char => !allowed.test(char));
        
        if (badChars.length > 0) {
            throw new Error(`Недопустимые символы: ${badChars.join(', ')}`);
        }
    }

    getSimpleError(error, expression) {
        const message = error.message.toLowerCase();
        
        if (message.includes('undefined function')) {
            const name = message.match(/undefined function (\w+)/)?.[1];
            return `Неизвестная функция "${name}"`;
        }
        
        if (message.includes('undefined symbol')) {
            const symbol = message.match(/undefined symbol (\w+)/)?.[1];
            return `Неизвестный символ "${symbol}"`;
        }
        
        return 'Ошибка в выражении';
    }
}

export default MathParser;
