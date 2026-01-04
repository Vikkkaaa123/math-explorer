import ChartManager from './chart-manager.js';

class ChartBuilder {
    constructor(mathParser) {
        this.parser = mathParser;
        this.chartManager = new ChartManager();
        
        this.colors = {
            function: 'rgba(59, 130, 246, 1)',      // синий
            process: 'rgba(245, 158, 11, 0.8)',    // оранжевый
            processLight: 'rgba(245, 158, 11, 0.3)', // светлый оранжевый
            solution: 'rgba(239, 68, 68, 1)',      // красный
            axis: 'rgba(0, 0, 0, 0.8)',            // черный
            grid: 'rgba(0, 0, 0, 0.1)',
            gray: 'rgba(100, 100, 100, 0.7)'       // серый
        };
    }

drawEquationChart(funcStr, root, iterations, methodType) {
    try {
        const func = this.parser.parseFunction(funcStr);
        const datasets = [];
        
        // ось Ох
        datasets.push({
            data: [
                { x: -1000000, y: 0 },
                { x: 1000000, y: 0 }
            ],
            borderColor: '#000000',
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            label: '' 
        });
        
        // ось Оу  
        datasets.push({
            data: [
                { x: 0, y: -1000000 },
                { x: 0, y: 1000000 }
            ],
            borderColor: '#000000',
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            label: '' 
        });
            
            // график функции
            const points = this.chartManager.generatePoints(func, -10000, 10000, 10000);
            datasets.push({
                label: `f(x) = ${funcStr}`,
                data: points,
                borderColor: this.colors.function,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                showLine: true,
                tension: 0.1
            });
            
            // визуализация метода
            switch(methodType) {
                case 'newton':
                    this.drawNewton(datasets, func, root, iterations);
                    break;
                case 'secant':
                    this.drawSecant(datasets, func, root, iterations);
                    break;
                case 'bisection':
                    this.drawBisection(datasets, func, root, iterations);
                    break;
                case 'iteration':
                    this.drawIteration(datasets, func, root, iterations);
                    break;
            }
            
            // решение - КРАСНЫЙ
            if (root !== null) {
                datasets.push({
                    label: 'Решение',
                    data: [{ x: root, y: 0 }],
                    backgroundColor: this.colors.solution,
                    borderColor: this.colors.solution,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    showLine: false
                });
            }
            
            // создаем график
            this.chartManager.createChart('equation-chart', datasets, root, this.colors);
            return true;
            
        } catch (error) {
            console.error('Ошибка рисования:', error);
            return false;
        }
    }

// Метод Ньютона
  drawNewton(datasets, func, root, iterations) {
    if (!Array.isArray(iterations) || iterations.length === 0) return;
    
    const tangentPoints = [];
    const iterationPoints = [];
    
    iterations.forEach((iter, i) => {
        if (!iter.x || !iter.fx || iter.derivative === undefined || iter.derivative === null) return;
        
        const derivative = iter.derivative;
        if (Math.abs(derivative) < 1e-15) return;
        
        const k = derivative;
        const b = iter.fx - k * iter.x;
        
        const allX = iterations.map(it => it.x).filter(x => x !== null);
        const xRange = allX.length > 1 ? Math.max(...allX) - Math.min(...allX) : 5;
        const tangentLength = Math.max(0.5, xRange * 0.5);
        
        if (i > 0) {
            tangentPoints.push({ x: NaN, y: NaN });
        }
        
        tangentPoints.push(
            { x: iter.x - tangentLength, y: k * (iter.x - tangentLength) + b },
            { x: iter.x + tangentLength, y: k * (iter.x + tangentLength) + b }
        );
        
        iterationPoints.push({ x: iter.x, y: iter.fx });
    });
    
    if (tangentPoints.length > 0) {
        datasets.push({
            label: 'Касательные',
            data: tangentPoints,
            borderColor: this.colors.processLight,
            borderWidth: 1.5,
            borderDash: [],
            pointRadius: 0,
            showLine: true,
            spanGaps: false
        });
    }
    
    if (iterationPoints.length > 0) {
        datasets.push({
            label: 'Точки итераций',
            data: iterationPoints,
            backgroundColor: this.colors.process,
            borderColor: this.colors.process,
            pointRadius: 4,
            pointHoverRadius: 6,
            showLine: false
        });
    }
}





    // Метод секущих
    drawSecant(datasets, func, root, iterations) {
    if (!iterations || iterations.length < 2) return;
    
    let minX = root;
    let maxX = root;
    
    iterations.forEach(iter => {
        if (iter.x) {
            minX = Math.min(minX, iter.x);
            maxX = Math.max(maxX, iter.x);
        }
    });
    
    const range = Math.max(5, (maxX - minX) * 1.5);
    const displayMin = root - range;
    const displayMax = root + range;
    
    const secantSegments = [];
    const iterationPoints = [];
    

    for (let i = 0; i < iterations.length - 1; i++) {
        const iter1 = iterations[i];
        const iter2 = iterations[i + 1];
        
        if (!iter1 || !iter2 || !iter1.x || !iter2.x) continue;
        
        try {
            const dx = iter2.x - iter1.x;
            if (Math.abs(dx) < 1e-10) continue;
            
            const k = (iter2.fx - iter1.fx) / dx;
            const b = iter1.fx - k * iter1.x;

            if (i > 0) {
                secantSegments.push({ x: NaN, y: NaN });
            }

            secantSegments.push(
                { x: displayMin, y: k * displayMin + b },
                { x: displayMax, y: k * displayMax + b }
            );

            if (!iterationPoints.some(p => Math.abs(p.x - iter1.x) < 1e-10)) {
                iterationPoints.push({ x: iter1.x, y: iter1.fx });
            }
            if (!iterationPoints.some(p => Math.abs(p.x - iter2.x) < 1e-10)) {
                iterationPoints.push({ x: iter2.x, y: iter2.fx });
            }
            
        } catch (e) {
            console.warn('Ошибка построения секущей:', e);
        }
    }

    if (secantSegments.length > 0) {
        datasets.push({
            label: 'Секущие',
            data: secantSegments,
            borderColor: this.colors.processLight,
            borderWidth: 1.5,
            borderDash: [],
            pointRadius: 0,
            showLine: true,
            spanGaps: false
        });
    }

    if (iterationPoints.length > 0) {
        datasets.push({
            label: 'Точки итераций',
            data: iterationPoints,
            backgroundColor: this.colors.process,
            borderColor: this.colors.process,
            pointRadius: 4,
            pointHoverRadius: 6,
            showLine: false
        });
    }
}





    // Метод половинного деления
    drawBisection(datasets, func, root, iterations) {
    if (!iterations || iterations.length === 0) return;
    
    const iterationPoints = [];
    const verticalLines = [];

    iterations.forEach((iter, i) => {
        if (!iter.x || !iter.fx) return;
        

        if (i > 0) {
            verticalLines.push({ x: NaN, y: NaN });
        }
        

        verticalLines.push(
            { x: iter.x, y: 0 },
            { x: iter.x, y: iter.fx }
        );
        

        iterationPoints.push({ x: iter.x, y: iter.fx });
    });
    
    if (verticalLines.length > 0) {
        datasets.push({
            label: 'Вертикальные проекции',
            data: verticalLines,
            borderColor: this.colors.processLight,
            borderWidth: 1,
            borderDash: [3, 3],
            pointRadius: 0,
            showLine: true,
            spanGaps: false 
        });
    }
    

    if (iterationPoints.length > 0) {
        datasets.push({
            label: 'Точки итераций',
            data: iterationPoints,
            backgroundColor: this.colors.process,
            borderColor: this.colors.process,
            pointRadius: 4,
            pointHoverRadius: 6,
            showLine: false
        });
    }
}



   

    drawIteration(datasets, func, root, iterations) {
        if (!iterations || iterations.length === 0) return;
        
        const lambda = iterations[0]?.lambda || 0.1;
        
        // функция фи (новая)
        const phi = (x) => {
            try {
                const fx = func(x);
                return x - lambda * fx;
            } catch (e) {
                return x;
            }
        };
        
        // диагональ y = x 
        datasets.push({
            label: 'y = x',
            data: [
                { x: -1000, y: -1000 },
                { x: 1000, y: 1000 }
            ],
            borderColor: this.colors.gray,
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            showLine: true
        });
        
        // функция фи
        try {
            const phiPoints = [];
            const step = 0.5;
            for (let x = -1000; x <= 1000; x += step) {
                const y = phi(x);
                if (isFinite(y) && Math.abs(y) < 1000) {
                    phiPoints.push({ x, y });
                }
            }
            
            datasets.push({
                label: `φ(x) = x - ${lambda}·f(x)`,
                data: phiPoints,
                borderColor: this.colors.process,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                showLine: true
            });
        } catch (e) {
            console.warn('Не удалось нарисовать φ(x):', e);
        }
        
        // ломаная
        const brokenLine = [];
        
        for (let i = 0; i < iterations.length; i++) {
            const iter = iterations[i];
            if (!iter.x) continue;
            
            const x_n = iter.x;
            const phi_x_n = phi(x_n);
            
            brokenLine.push({ x: x_n, y: x_n });
            
            // вертикальный отрезок
            if (phi_x_n !== x_n) {
                const steps = 5;
                for (let s = 1; s <= steps; s++) {
                    const t = s / steps;
                    const y = x_n * (1 - t) + phi_x_n * t;
                    brokenLine.push({ x: x_n, y: y });
                }
            }
            
            // горизонтальный отрезок к следующей точке
            if (i < iterations.length - 1) {
                const next_x = iterations[i + 1].x;
                if (next_x !== x_n) {
                    const steps = 5;
                    for (let s = 1; s <= steps; s++) {
                        const t = s / steps;
                        const x = x_n * (1 - t) + next_x * t;
                        brokenLine.push({ x: x, y: phi_x_n });
                    }
                }
            }
        }
        
        if (brokenLine.length > 0) {
            datasets.push({
                label: 'Ломаная итераций',
                data: brokenLine,
                borderColor: this.colors.processLight,
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                showLine: true
            });
        }
        
        const allPoints = [];
        const maxPoints = Math.min(5, iterations.length);
        
        for (let i = 0; i < maxPoints; i++) {
            const iter = iterations[i];
            if (!iter.x) continue;

            allPoints.push({ 
                x: iter.x, 
                y: iter.x,
                label: i === 0 ? 'Точки Aᵢ/Bᵢ' : ''
            });

            const phi_x = phi(iter.x);
            allPoints.push({ 
                x: iter.x, 
                y: phi_x,
                label: ''
            });
        }
        
        if (allPoints.length > 0) {
            datasets.push({
                label: 'Точки Aᵢ/Bᵢ',
                data: allPoints.map(p => ({ x: p.x, y: p.y })),
                backgroundColor: this.colors.process,
                borderColor: this.colors.process,
                pointRadius: 4,
                pointHoverRadius: 6,
                showLine: false
            });
        }
        
        // решение
        if (root !== null) {
            datasets.push({
                label: 'Решение',
                data: [{ x: root, y: root }],
                backgroundColor: this.colors.solution,
                borderColor: this.colors.solution,
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false
            });
        }
        
        return true;
    }


    
    
   _derivative(func, x, h = 0.001) {
        return (func(x + h) - func(x - h)) / (2 * h);
    }
}

export default ChartBuilder;