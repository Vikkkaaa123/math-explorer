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
    let clean = expression
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
    
    const funcRegex = /(log|ln|sin|cos|tan|exp|sqrt|abs|asin|acos|atan|acot|sinh|cosh|tanh|coth|cot|sec|csc)\([^)]*\)/g;
    
    const protectedParts = [];
    let index = 0;
    
    clean = clean.replace(funcRegex, (match) => {
        const placeholder = `§FUNC${index}§`;
        protectedParts[index] = match;
        index++;
        return placeholder;
    });
    
    clean = clean.replace(/pi/g, '§PI§')
                .replace(/\be\b(?!\w)/g, '§E§')
                .replace(/\b\d+([a-zа-яё])/g, '$1*$2')
                .replace(/([a-zа-яё])\^(\d+)/g, 'pow($1, $2)')
                .replace(/([a-zа-яё])\*\*(\d+)/g, 'pow($1, $2)')
                .replace(/(\))\^(\d+)/g, 'pow($1, $2)')
                .replace(/(\))\*\*(\d+)/g, 'pow($1, $2)')
                .replace(/(\()\^(\d+)/g, 'pow($1, $2)')
                .replace(/(\()\*\*(\d+)/g, 'pow($1, $2)')
                .replace(/[a-zа-яё]/g, 'x')
                .replace(/pow/g, '§POW§');
    
    clean = clean.replace(/(\d)(x)/g, '$1*$2')
                .replace(/(\d)(\()/g, '$1*$2')
                .replace(/(\))(x)/g, '$1*$2')
                .replace(/(\))(\()/g, '$1*$2')
                .replace(/(x)(\()/g, '$1*$2');
    
    for (let i = 0; i < protectedParts.length; i++) {
        const funcCall = protectedParts[i];
        const funcName = funcCall.substring(0, funcCall.indexOf('('));
        const args = funcCall.substring(funcCall.indexOf('(') + 1, funcCall.length - 1);
        
        let cleanedArgs = args
            .replace(/(\d)([a-zа-яё])/g, '$1*$2')
            .replace(/[a-zа-яё]/g, 'x')
            .replace(/(\d)(x)/g, '$1*$2');
        
        clean = clean.replace(`§FUNC${i}§`, `${funcName}(${cleanedArgs})`);
    }
    
    clean = clean.replace(/§POW§/g, 'pow')
                .replace(/§PI§/g, 'pi')
                .replace(/§E§/g, 'e');
    
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
