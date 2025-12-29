class JacobiMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(matrix, vector, initialGuess = null, precision = 1e-6, maxIterations = 1000) {
        try {
            const n = matrix.length;
            
            if (n !== vector.length) {
                return {
                    solution: null,
                    iterations: [],
                    converged: false,
                    message: 'Несовместимые размеры матрицы и вектора'
                };
            }

            // Проверка диагонального преобладания
            if (!this._hasDiagonalDominance(matrix)) {
                return {
                    solution: null,
                    iterations: [],
                    converged: false,
                    message: 'Матрица не имеет диагонального преобладания'
                };
            }

            let x = initialGuess || new Array(n).fill(0);
            let xNew = new Array(n).fill(0);
            const iterations = [];

            for (let k = 0; k < maxIterations; k++) {
                // Сохраняем предыдущее приближение
                const xPrev = [...x];

                // Формула метода Якоби: x_i^(k+1) = (b_i - Σ_{j≠i} a_ij * x_j^k) / a_ii
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < n; j++) {
                        if (j !== i) {
                            sum += matrix[i][j] * xPrev[j];
                        }
                    }
                    xNew[i] = (vector[i] - sum) / matrix[i][i];
                }

                // Вычисляем невязку
                const residual = this._calculateResidual(matrix, vector, xNew);
                const error = this._vectorNorm(this._vectorSubtract(xNew, xPrev));

                iterations.push({
                    iteration: k + 1,
                    x: [...xNew],
                    residual: residual,
                    error: error
                });

                // Критерий остановки
                if (error < precision) {
                    return {
                        solution: xNew,
                        iterations: iterations,
                        converged: true,
                        message: `Метод сошелся за ${k + 1} итераций`
                    };
                }

                x = [...xNew];
            }

            return {
                solution: xNew,
                iterations: iterations,
                converged: false,
                message: `Достигнут предел ${maxIterations} итераций`
            };

        } catch (error) {
            return {
                solution: null,
                iterations: [],
                converged: false,
                message: 'Ошибка: ' + error.message
            };
        }
    }

    _hasDiagonalDominance(matrix) {
        const n = matrix.length;
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    sum += Math.abs(matrix[i][j]);
                }
            }
            if (Math.abs(matrix[i][i]) <= sum) {
                return false;
            }
        }
        return true;
    }

    _calculateResidual(matrix, vector, solution) {
        const n = matrix.length;
        const residual = new Array(n).fill(0);
        
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                sum += matrix[i][j] * solution[j];
            }
            residual[i] = vector[i] - sum;
        }
        
        return this._vectorNorm(residual);
    }

    _vectorNorm(vector) {
        return Math.max(...vector.map(Math.abs));
    }

    _vectorSubtract(v1, v2) {
        return v1.map((val, i) => val - v2[i]);
    }
}

export default JacobiMethod;
