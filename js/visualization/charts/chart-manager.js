class ChartManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            function: 'rgba(59, 130, 246, 1)',
            root: 'rgba(239, 68, 68, 1)',
            tangent: 'rgba(245, 158, 11, 0.7)',
            iteration: 'rgba(16, 185, 129, 1)',
            interval: 'rgba(139, 92, 246, 0.7)'
        };
    }

    createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        this.destroyChart(canvasId);

        const ctx = canvas.getContext('2d');
        const defaultConfig = {
            type: 'line',
            data: { datasets: [] },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                scales: {
                    x: { type: 'linear', grid: { color: 'rgba(229, 231, 235, 0.5)' } },
                    y: { grid: { color: 'rgba(229, 231, 235, 0.5)' } }
                }
            }
        };

        const mergedConfig = this.mergeConfigs(defaultConfig, config);
        const chart = new Chart(ctx, mergedConfig);
        this.charts.set(canvasId, chart);
        return chart;
    }

    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;
        if (newData.datasets) chart.data.datasets = newData.datasets;
        if (newData.labels) chart.data.labels = newData.labels;
        chart.update();
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    generatePoints(func, xMin, xMax, points = 200) {
        const result = [];
        const step = (xMax - xMin) / points;
        
        for (let i = 0; i <= points; i++) {
            const x = xMin + i * step;
            try {
                const y = func(x);
                if (isFinite(y)) result.push({ x, y });
            } catch (e) {}
        }
        return result;
    }

    calculateBounds(points, root = null) {
        if (!points.length) return { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
        
        let xMin = Math.min(...points.map(p => p.x));
        let xMax = Math.max(...points.map(p => p.x));
        let yMin = Math.min(...points.map(p => p.y));
        let yMax = Math.max(...points.map(p => p.y));
        
        const xPadding = (xMax - xMin) * 0.1;
        const yPadding = (yMax - yMin) * 0.1;
        
        xMin -= xPadding;
        xMax += xPadding;
        yMin -= yPadding;
        yMax += yPadding;
        
        if (root !== null) {
            xMin = Math.min(xMin, root - Math.abs(root) * 0.2);
            xMax = Math.max(xMax, root + Math.abs(root) * 0.2);
        }
        
        return { xMin, xMax, yMin, yMax };
    }

    mergeConfigs(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfigs(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    createDataset(points, label, color) {
        return {
            label,
            data: points.map(p => ({ x: p.x, y: p.y })),
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
        };
    }

    createPoint(x, y, label, color = this.colors.root) {
        return {
            label,
            data: [{ x, y }],
            backgroundColor: color,
            borderColor: color,
            pointRadius: 6,
            showLine: false
        };
    }

    createLine(x1, y1, x2, y2, label, color, dash = false) {
        return {
            label,
            data: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
            borderColor: color,
            borderWidth: 2,
            borderDash: dash ? [5, 5] : [],
            pointRadius: 0,
            fill: false
        };
    }
}

export default ChartManager;
