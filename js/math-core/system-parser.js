class SystemParser {
    parseEquations(equations) {
        const n = equations.length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));
        const vector = Array(n).fill(0);
        const variables = this.detectVariables(equations, n);
        
        for (let i = 0; i < n; i++) {
            const parsed = this.parseSingleEquation(equations[i], variables, i);
            matrix[i] = parsed.coeffs;
            vector[i] = parsed.constant;
        }
        
        return { matrix, vector, variables };
    }
    
    detectVariables(equations, n) {
        // Собираем все уникальные переменные из всех уравнений
        const vars = new Set();
        
        equations.forEach(eq => {
            // Ищем паттерны: x, y, z, x1, x2, var1, var2
            const matches = eq.match(/[a-z][a-z0-9]*/gi);
            if (matches) {
                matches.forEach(v => {
                    if (!v.match(/^(sin|cos|tan|log|ln|exp|sqrt|abs)$/i)) {
                        vars.add(v);
                    }
                });
            }
        });
        
        // Если не нашли переменные, создаем x1, x2, ...
        if (vars.size === 0) {
            for (let i = 1; i <= n; i++) {
                vars.add(`x${i}`);
            }
        }
        
        return Array.from(vars);
    }
    
    parseSingleEquation(eq, variables, eqIndex) {
        // Нормализуем уравнение
        eq = eq.trim().replace(/\s+/g, '');
        
        // Разделяем на левую и правую части
        const parts = eq.split('=');
        if (parts.length !== 2) {
            throw new Error(`Уравнение ${eqIndex+1}: отсутствует знак =`);
        }
        
        const left = parts[0];
        const right = this.parseExpression(parts[1]);
        
        // Парсим левую часть
        const coeffs = Array(variables.length).fill(0);
        let leftValue = this.parseExpression(left);
        
        // Вычитаем коэффициенты переменных
        variables.forEach((varName, idx) => {
            const regex = new RegExp(`([+-]?\\d*\\.?\\d*)${varName}\\b`);
            const match = left.match(regex);
            
            if (match) {
                let coeff = match[1];
                if (coeff === '' || coeff === '+') coeff = '1';
                if (coeff === '-') coeff = '-1';
                coeffs[idx] = parseFloat(coeff);
                
                // Убираем этот член из строки для парсинга остатка
                left = left.replace(regex, '');
            }
        });
        
        // Парсим оставшуюся часть левой стороны (константы)
        const leftConst = this.parseExpression(left);
        
        // Вычисляем правую часть уравнения
        const constant = right - leftConst;
        
        return { coeffs, constant };
    }
    
    parseExpression(expr) {
        if (!expr || expr === '') return 0;
        
        // Простой парсинг суммы/разности чисел
        let total = 0;
        const terms = expr.match(/[+-]?\d*\.?\d+/g) || [];
        
        terms.forEach(term => {
            total += parseFloat(term);
        });
        
        return total;
    }
}

export default SystemParser;
