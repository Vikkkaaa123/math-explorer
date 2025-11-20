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

    parseFunction(expression) {
        if (!this.ready) {
            throw new Error('Парсер не готов');
        }

        if (!expression || typeof expression !== 'string') {
            throw new Error('Введите функцию');
        }

        try {
            const cleanExpression = this.cleanExpression(expression);
            const compiled = this.parser.compile(cleanExpression);
            
            const parsedFunction = (x, variables = {}) => {
                const scope = { x, ...variables, ...this.supportedConstants };
                return compiled.evaluate(scope);
            };
            
            return parsedFunction;
            
        } catch (error) {
            throw new Error(this.getSimpleError(error, expression));
        }
    }

   cleanExpression(expression) {
    let clean = expression
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')  // Убираем все пробелы
        .replace(/\^/g, '**') // Степень: ^ → **
        
        // Автоматическое умножение:
        .replace(/(\d)([a-z])/g, '$1*$2')           // 3x → 3*x
        .replace(/(\d)(\()/g, '$1*$2')              // 2( → 2*(
        .replace(/([a-z])(\d)/g, '$1*$2')           // x2 → x*2  
        .replace(/([a-z])([a-z])/g, '$1*$2')        // xy → x*y
        .replace(/(\))([a-z])/g, '$1*$2')           // )x → )*x
        .replace(/(\))(\()/g, '$1*$2')              // )( → )*(
        .replace(/([a-z])(\()/g, '$1*$2')           // x( → x*(
        
        // Функции и константы:
        .replace(/ln\(/g, 'log(')                   // ln → log
        .replace(/arc(sin|cos|tan)/g, 'a$1')        // arcsin → asin
        .replace(/pi/g, 'pi')                       // π оставляем как есть
        .replace(/e(?![a-z])/g, 'e');               // e (но не ex, esin и т.д.

    // Проверяем скобки и символы
    this.checkBrackets(clean);
    this.checkSymbols(clean);
    return clean;
}

checkSymbols(expression) {
    // Разрешаем буквы, цифры, операторы и скобки
    const allowed = /^[0-9a-z+\-*/\^().,]+$/;
    const badChars = expression.split('').filter(char => !allowed.test(char));
    
    if (badChars.length > 0) {
        throw new Error(`Недопустимые символы: ${badChars.join(', ')}`);
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

    getPlotPoints(func, start, end, points = 200) {
        const xValues = [];
        const yValues = [];
        const step = (end - start) / points;
        
        for (let i = 0; i <= points; i++) {
            const x = start + i * step;
            
            try {
                const y = func(x);
                xValues.push(x);
                yValues.push(isFinite(y) ? y : null);
            } catch (error) {
                xValues.push(x);
                yValues.push(null);
            }
        }
        
        return { x: xValues, y: yValues };
    }
}

export default MathParser;
