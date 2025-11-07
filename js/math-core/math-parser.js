class MathParser {
    constructor() {
        this.parser = null;
        this.isInitialized = false;
        
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

    async initialize() {
        if (this.isInitialized) return;

        if (typeof math === 'undefined') {
            throw new Error('Библиотека math.js не загружена');
        }
        
        this.parser = math;
        this.extendParser();
        this.isInitialized = true;
    }

    extendParser() {
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
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован');
        }

        if (!expression || typeof expression !== 'string') {
            throw new Error('Выражение должно быть непустой строкой');
        }

        try {
            const processedExpr = this.preprocessExpression(expression);
            const compiledExpr = this.parser.compile(processedExpr);
            
            const parsedFunction = (x, variables = {}) => {
                const scope = { x, ...variables, ...this.supportedConstants };
                return compiledExpr.evaluate(scope);
            };
            
            parsedFunction.expression = expression;
            return parsedFunction;
            
        } catch (error) {
            throw new Error(`Неверное математическое выражение: ${this.getUserFriendlyError(error, expression)}`);
        }
    }

    preprocessExpression(expression) {
        let processed = expression
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\^/g, '**')
            .replace(/ln\(/g, 'log(')
            .replace(/arc(sin|cos|tan)/g, 'a$1')
            .replace(/\.{2,}/g, '.');

        this.validateBrackets(processed);
        this.validateCharacters(processed);
        
        return processed;
    }

    validateBrackets(expression) {
        let balance = 0;
        
        for (let char of expression) {
            if (char === '(') balance++;
            if (char === ')') balance--;
            if (balance < 0) throw new Error('Несбалансированные скобки');
        }
        
        if (balance !== 0) throw new Error('Несбалансированные скобки');
    }

    validateCharacters(expression) {
        const validChars = /^[0-9a-z+\-*/\^().,]+$/;
        const invalidChars = expression.split('').filter(char => !validChars.test(char));
        
        if (invalidChars.length > 0) {
            throw new Error(`Недопустимые символы: ${invalidChars.join(', ')}`);
        }
    }

    getUserFriendlyError(error, originalExpression) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('undefined function')) {
            const functionName = errorMsg.match(/undefined function (\w+)/)?.[1];
            return `Неизвестная функция "${functionName}"`;
        }
        
        if (errorMsg.includes('undefined symbol')) {
            const symbol = errorMsg.match(/undefined symbol (\w+)/)?.[1];
            return `Неизвестный символ "${symbol}"`;
        }
        
        return 'Синтаксическая ошибка';
    }

    derivative(func, x, h = 1e-5) {
        return (func(x + h) - func(x - h)) / (2 * h);
    }

    generatePlotPoints(func, a, b, points = 200) {
        const xValues = [];
        const yValues = [];
        const step = (b - a) / points;
        
        for (let i = 0; i <= points; i++) {
            const x = a + i * step;
            
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

const mathParser = new MathParser();
export { MathParser, mathParser };
