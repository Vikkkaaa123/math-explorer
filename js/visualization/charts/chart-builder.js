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







drawIntegrationChart(funcStr, a, b, methodType, iterations = []) {
    try {
        
        const canvas = document.getElementById('integration-chart');
        if (!canvas) {
            console.error('Canvas integration-chart не найден!');
            return false;
        }
        
        const func = this.parser.parseFunction(funcStr);
        const datasets = [];
        
        // ОСЬ X 
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
        
        // ОСЬ Y
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
        
        //рисуем площадь под оригинальной функцией (бледно-голубой)
        const areaUnderFunc = this._generateAreaUnderFunction(func, a, b, 100);
        if (areaUnderFunc.length > 0) {
            datasets.push({
                label: 'Площадь под функцией',
                data: areaUnderFunc,
                borderColor: 'rgba(59, 130, 246, 0.3)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
                showLine: true
            });
        }
        
        //график самой функции (синяя линия)
        const funcPoints = this._generateFunctionPoints(func, -100, 100, 200);
        datasets.push({
            label: `f(x) = ${funcStr}`,
            data: funcPoints,
            borderColor: this.colors.function,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            showLine: true,
            tension: 0.1
        });
        
        //мметода интегрирования 
        let methodData = [];
        switch(methodType.toLowerCase()) {
            case 'simpson':
                methodData = this._generateSimpsonVisualization(func, a, b, iterations);
                break;
            case 'trapezoidal':
                methodData = this._generateTrapezoidalVisualization(func, a, b, iterations);
                break;
            case 'rectangles':
                methodData = this._generateRectanglesVisualization(func, a, b, iterations);
                break;
            case 'monte-carlo':
                methodData = this._generateMonteCarloVisualization(func, a, b, iterations);
                break;
            default:
                console.log('Метод не поддерживает визуализацию:', methodType);
        }
        
        if (methodData && methodData.length > 0) {
    methodData.forEach(data => {
        datasets.push(data);
    });
}
        
        //вертикальные линии границ
        datasets.push({
            label: 'Границы интегрирования',
            data: [
                { x: a, y: 0 },
                { x: a, y: func(a) || 0 }
            ],
            borderColor: this.colors.gray,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            showLine: true
        });
        
        datasets.push({
            data: [
                { x: b, y: 0 },
                { x: b, y: func(b) || 0 }
            ],
            borderColor: this.colors.gray,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            showLine: true,
            label: ''
        });
        
        //создаем график
        this.chartManager.createChart('integration-chart', datasets, null, {
            axis: '#000000',
            grid: this.colors.grid
        });
        
        return true;
        
    } catch (error) {
        console.error('Ошибка рисования интеграла:', error);
        return false;
    }
}




_generateAreaUnderFunction(func, a, b, points = 100) {
    const result = [];
    const step = (b - a) / points;
    
    // Начинаем на оси X
    result.push({ x: a, y: 0 });
    
    // Идем по функции от a до b
    for (let i = 0; i <= points; i++) {
        const x = a + i * step;
        try {
            const y = func(x);
            if (isFinite(y)) {
                result.push({ x, y });
            } else {
                result.push({ x, y: 0 });
            }
        } catch (e) {
            result.push({ x, y: 0 });
        }
    }
    
    // Возвращаемся на ось X
    result.push({ x: b, y: 0 });
    
    return result;
}



_generateSimpsonVisualization(func, a, b, iterations) {
    if (!iterations || iterations.length === 0) {
        return [];
    }
    
    const lastIter = iterations[iterations.length - 1]; 
    const n = lastIter.n || lastIter.segments || 4;
    const adjustedN = n % 2 === 0 ? n : n + 1;
    const h = (b - a) / adjustedN;
    const datasets = [];
    const allParabolaPoints = [];  //массив для ЛИНИЙ парабол
    const filledAreaPoints = [];  //массив для закрашенной области под параболами
    filledAreaPoints.push({ x: a, y: 0 });  // Начинаем область на оси X
    
    for (let i = 0; i < adjustedN; i += 2) {
        const x0 = a + i * h;
        const x1 = x0 + h;
        const x2 = x0 + 2 * h;

        
        if (x2 > b + 0.001) continue;
        
        try {
            const y0 = func(x0);
            const y1 = func(x1);
            const y2 = func(x2);

            //разрыв между параболами
            if (allParabolaPoints.length > 0) {
                allParabolaPoints.push({ x: NaN, y: NaN });
                filledAreaPoints.push({ x: NaN, y: NaN });
            }
            
            //начинаем новый сегмент области
            filledAreaPoints.push({ x: x0, y: 0 });
            filledAreaPoints.push({ x: x0, y: y0 });
            
            const points = 10;
            for (let j = 0; j <= points; j++) {
                const t = j / points;
                const x = x0 + 2 * h * t;
                
                //интерполяция
                const L0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2));
                const L1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2));
                const L2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
                
                const y = y0 * L0 + y1 * L1 + y2 * L2;
                
                allParabolaPoints.push({ x, y });
                filledAreaPoints.push({ x, y });
            }
            
            //завершаем сегмент области
            filledAreaPoints.push({ x: x2, y: y2 });
            filledAreaPoints.push({ x: x2, y: 0 });
            
        } catch (error) {
            console.warn(`Ошибка в параболе ${i/2}:`, error);
        }
    }
    
    
    //рисуем закрашенную область
    if (filledAreaPoints.length > 0) {
        datasets.push({
            label: '',
            data: filledAreaPoints,
            borderColor: 'rgba(255, 152, 0, 0.3)',
            backgroundColor: 'rgba(255, 152, 0, 0.15)', 
            borderWidth: 1,
            pointRadius: 0,
            fill: true,
            showLine: true,
            tension: 0
        });
    }
    
    //рисуем линии парабол
    if (allParabolaPoints.length > 0) {
        datasets.push({
            label: `Метод Симпсона`,
            data: allParabolaPoints,
            borderColor: 'rgba(255, 152, 0, 0.9)', 
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointRadius: 0,
            fill: false,
            showLine: true,
            tension: 0,
        });
    }
    
    const nodePoints = [];
    for (let i = 0; i <= adjustedN; i += 2) {
        const x = a + i * h;
        try {
            const y = func(x);
            if (isFinite(y)) {
                nodePoints.push({ x, y });
            }
        } catch (e) {}
    }
    
    if (nodePoints.length > 0) {
        datasets.push({
            label: '',
            data: nodePoints,
            backgroundColor: '#FF9800',
            borderColor: '#FF9800',
            pointRadius: 1,
            pointHoverRadius: 2,
            showLine: false
        });
    }
    
    return datasets;
}






_generateTrapezoidalVisualization(func, a, b, iterations) {
    let n = 3;
    if (iterations && iterations.length > 0) {
        //берем n из первой итерации
        const firstIter = iterations[0];
        n = firstIter.n || firstIter.segments || 3;
    }
    
    const h = (b - a) / n;
    const datasets = [];
    
    for (let i = 0; i < n; i++) {
        const x1 = a + i * h;
        const x2 = x1 + h;
        
        try {
            const y1 = func(x1);
            const y2 = func(x2);
            
            if (!isFinite(y1) || !isFinite(y2)) continue;
            
            const trapezoidPoints = [
                { x: x1, y: 0 },
                { x: x1, y: y1 },
                { x: x2, y: y2 },
                { x: x2, y: 0 }
            ];
            
            datasets.push({
                label: i === 0 ? `Трапеции (n=${n})` : '',
                data: trapezoidPoints,
                borderColor: 'rgba(255, 152, 0, 0.3)',
                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
                showLine: true,
                tension: 0
            });
            
        } catch (error) {
            continue;
        }
    }
    
    return datasets;
}



_generateRectanglesVisualization(func, a, b, iterations) {
    let n = 4; // Значение по умолчанию
    if (iterations && iterations.length > 0) {
        // Используем n из первой итерации
        const firstIter = iterations[0];
        n = firstIter.n || firstIter.segments || 4;
    }
    
    const h = (b - a) / n;
    const datasets = [];
    
    //создаем отдельный набор данных для каждого прямоугольника
    for (let i = 0; i < n; i++) {
        const x1 = a + i * h;
        const x2 = x1 + h;
        const x_mid = (x1 + x2) / 2; //середина отрезка
        
        try {
            const y_mid = func(x_mid);
            
            if (!isFinite(y_mid)) continue;
            
            //создаем точки для прямоугольника
            const rectanglePoints = [
                { x: x1, y: 0 },        //нижняя левая
                { x: x1, y: y_mid },    //верхняя левая
                { x: x2, y: y_mid },    //верхняя правая
                { x: x2, y: 0 }         //нижняя правая
            ];
            
            //создаем отдельный прямоугольник
            datasets.push({
                label: i === 0 ? `Средние прямоугольники (n=${n})` : '',
                data: rectanglePoints,
                borderColor: 'rgba(255, 152, 0, 0.3)',
                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
                showLine: true,
                tension: 0
            });
            
        } catch (error) {
            continue;
        }
    }
    
    //точки в серединах отрезков
    const midPoints = [];
    for (let i = 0; i < n; i++) {
        const x1 = a + i * h;
        const x2 = x1 + h;
        const x_mid = (x1 + x2) / 2;
        
        try {
            const y_mid = func(x_mid);
            if (isFinite(y_mid)) {
                midPoints.push({ x: x_mid, y: y_mid });
            }
        } catch (e) {}
    }
    
    if (midPoints.length > 0) {
        datasets.push({
            label: '',
            data: midPoints,
            backgroundColor: '#FF9800',
            borderColor: '#FF9800',
            pointRadius: 3,
            pointHoverRadius: 5,
            showLine: false,
            pointStyle: 'circle'
        });
    }
    
    return datasets;
}



_generateMonteCarloVisualization(func, a, b, iterations) {
    if (!iterations || iterations.length === 0) {
        return [];
    } 
    //берем n из последней итерации
    const n = iterations[iterations.length - 1].n || 1000;
    
    //ограничиваем количество
    const pointsToShow = Math.min(n, 1000);
    
    //определяем область для точек
    const x_range = b - a;
    
    //ищем min и max функции на интервале
    let y_min = Infinity;
    let y_max = -Infinity;
    for (let i = 0; i <= 20; i++) {
        const x = a + (i / 20) * x_range;
        try {
            const y = func(x);
            if (isFinite(y)) {
                y_min = Math.min(y_min, y);
                y_max = Math.max(y_max, y);
            }
        } catch (e) {}
    }

    y_min = Math.min(y_min, 0);
    y_max = Math.max(y_max, 0);
    
    //расширяем диапазон
    const y_padding = (y_max - y_min) * 0.2;
    y_min -= y_padding;
    y_max += y_padding;
    
    const y_range = y_max - y_min;
    
    //генерируем точки
    const red_points = [];
    const orange_points = [];
    
    for (let i = 0; i < pointsToShow; i++) {
        const x = a + Math.random() * x_range;
        const y = y_min + Math.random() * y_range;
        
        try {
            const f_x = func(x);
            if (!isFinite(f_x)) continue;
            
            //точка под графиком если находится между осью X (y=0) и функцией
            if (f_x >= 0) {
                //для положительной функции точка под графиком
                if (y >= 0 && y <= f_x) {
                    red_points.push({ x, y });
                } else {
                    orange_points.push({ x, y });
                }
            } else {
                //для отрицательной функции точка под графиком
                if (y <= 0 && y >= f_x) {
                    red_points.push({ x, y });
                } else {
                    orange_points.push({ x, y });
                }
            }
        } catch (e) {}
    }
    
    const datasets = [];
    
    //оранжевые точки (вне области)
    if (orange_points.length > 0) {
        datasets.push({
            label: `Точки вне области (${orange_points.length})`,
            data: orange_points,
            backgroundColor: 'rgb(255, 152, 0)',
            borderColor: 'rgb(255, 152, 0)',
            pointRadius: 1,
            pointHoverRadius: 2,
            showLine: false
        });
    }
    
    //кКрасные точки (под графиком)
    if (red_points.length > 0) {
        datasets.push({
            label: `Точки под графиком (${red_points.length})`,
            data: red_points,
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(255, 0, 0)',
            pointRadius: 1,
            pointHoverRadius: 2,
            showLine: false
        });
    }
    
    return datasets;
}






    // Вспомогательные методы:

    _generateFunctionPoints(func, a, b, points = 200) {
        const result = [];
        const step = (b - a) / points;
        
        for (let i = 0; i <= points; i++) {
            const x = a + i * step;
            try {
                const y = func(x);
                if (isFinite(y)) {
                    result.push({ x, y });
                }
            } catch (e) {}
        }
        return result;
    }


    _getMinY(func, a, b, points = 100) {
        let minY = 0;
        const step = (b - a) / points;
        
        for (let i = 0; i <= points; i++) {
            const x = a + i * step;
            try {
                const y = func(x);
                if (isFinite(y)) {
                    minY = Math.min(minY, y);
                }
            } catch (e) {}
        }
        return minY;
    }

    _getMaxY(func, a, b, points = 100) {
        let maxY = 0;
        const step = (b - a) / points;
        
        for (let i = 0; i <= points; i++) {
            const x = a + i * step;
            try {
                const y = func(x);
                if (isFinite(y)) {
                    maxY = Math.max(maxY, y);
                }
            } catch (e) {}
        }
        return maxY;
    }

    

    _derivative(func, x, h = 0.001) {
        return (func(x + h) - func(x - h)) / (2 * h);
    }
}

export default ChartBuilder;
