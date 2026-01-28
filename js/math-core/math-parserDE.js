import MathParser from './math-parser.js';

class MathParserDE extends MathParser {
    constructor() {
        super();
    }

    cleanExpressionForDE(expression) {
        let clean = expression
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            //тригонометрические функции
            .replace(/tg/g, 'tan')
            .replace(/ctg/g, 'cot')
            .replace(/arctg/g, 'atan')
            .replace(/arcctg/g, 'acot')
            .replace(/arcsin/g, 'asin')
            .replace(/arccos/g, 'acos')
            //русские буквы особая обработка
            .replace(/[а-я]/g, function(match) {
                // Русская "у" → английская "y"
                if (match === 'у' || match === 'У'.toLowerCase()) return 'y';
                // Русская "х" → английская "x"  
                if (match === 'х' || match === 'Х'.toLowerCase()) return 'x';
                // Остальное → "x"
                return 'x';
            })
            // Убираем y' слева если есть после замены русских букв
            .replace(/^y['`]\s*=/, '')  // "y' = " → ""
            .replace(/^dy\/dx\s*=/, '') // "dy/dx = " → ""
            .replace(/^y\s*=/, '');     // "y = " → ""
        
        console.log('После русских букв и y\':', clean);
        
        //защищаем функции
        const functions = [
            'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
            'asin', 'acos', 'atan', 'acot',
            'sinh', 'cosh', 'tanh', 'coth',
            'log', 'log10', 'ln', 'exp', 'sqrt', 'abs'
        ];
        
        //временная замена функций
        functions.forEach((func, i) => {
            clean = clean.replace(new RegExp(func, 'g'), `__${i}__`);
        });
        
        //обработка степеней (только для x и y)
        clean = clean.replace(/([xy])²/g, 'pow($1,2)');
        clean = clean.replace(/([xy])³/g, 'pow($1,3)');
        clean = clean.replace(/([xy])\^(\d+)/g, 'pow($1,$2)');
        
        //восстанавливаем функции
        functions.forEach((func, i) => {
            clean = clean.replace(new RegExp(`__${i}__`, 'g'), func);
        });
        
        //умножение
        clean = clean
            .replace(/(\d)([xy])/g, '$1*$2')
            .replace(/([xy])(\d)/g, '$1*$2')
            .replace(/([xy])([xy])/g, '$1*$2')
            .replace(/(\d)(\()/g, '$1*$2')
            .replace(/(\))([xy])/g, '$1*$2')
            .replace(/([xy])(\()/g, '$1*$2')
            .replace(/(\d)([a-z]+)/g, '$1*$2');
        
        console.log('Финальное выражение:', clean);
        return clean;
    }

    parseFunctionDE(expression) {
        if (!this.ready) {
            throw new Error('Парсер не готов');
        }

        try {
            const cleanExpression = this.cleanExpressionForDE(expression);
            console.log('Выражение для math.js:', cleanExpression);
            
            const compiled = math.compile(cleanExpression);
            
            const parsedFunction = (x, y) => {
                const scope = { 
                    x: x, 
                    y: y,
                    pi: Math.PI,
                    e: Math.E,
                    ...this.supportedConstants
                };
                return compiled.evaluate(scope);
            };
            
            return parsedFunction;
            
        } catch (error) {
            console.error('Ошибка парсера DE:', error);
            throw new Error(this.getSimpleError(error, expression));
        }
    }
}

export default MathParserDE;