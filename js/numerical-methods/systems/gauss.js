class GaussMethod {
    constructor(mathParser) {
        this.parser = mathParser;
    }

    solve(matrix, vector, precision = 1e-10) {
        try {
            const n = matrix.length;
            
            // Проверка входных данных
            if (n !== vector.length || n === 0) {
                return {
                    solution: null,
                    iterations: [],
                    converged: false,
                    message: 'Несовместимые размеры матрицы и вектора'
                };
            }

            // Создаем расширенную матрицу
            const augmented = this._createAugmentedMatrix(matrix, vector);
            const iterations = [];

            // Прямой ход метода Гаусса
            for (let i = 0; i < n; i++) {
                // Поиск главного элемента
                let maxRow = i;
                for (let j = i + 1; j < n; j++) {
                    if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
                        maxRow = j;
                    }
                }

                // Перестановка строк
                if (maxRow !== i) {
                    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
                }

                // Проверка на вырожденность
                if (Math.abs(augmented[i][i]) < precision) {
                    return {
                        solution: null,
                        iterations: iterations,
                        converged: false,
                        message: 'Матрица вырождена или почти вырождена'
                    };
                }

                // Обнуление элементов под главной диагональю
                for (let j = i + 1; j < n; j++) {
                    const factor = augmented[j][i] / augmented[i][i];
                    for (let k = i; k <= n; k++) {
                        augmented[j][k] -= factor * augmented[i][k];
                    }
                }

                iterations.push({
                    step: i + 1,
                    matrix: this._copyMatrix(augmented),
                    pivot: i
                });
            }

            // Обратный ход
            const solution = new Array(n);
            for (let i = n - 1; i >= 0; i--) {
                solution[i] = augmented[i][n];
                for (let j = i + 1; j < n; j++) {
                    solution[i] -= augmented[i][j] * solution[j];
                }
                solution[i] /= augmented[i][i];
            }

            return {
                solution: solution,
                iterations: iterations,
                converged: true,
                message: `Система решена за ${n} шагов`
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

    _createAugmentedMatrix(matrix, vector) {
        const n = matrix.length;
        const augmented = [];
        
        for (let i = 0; i < n; i++) {
            augmented.push([...matrix[i], vector[i]]);
        }
        
        return augmented;
    }

    _copyMatrix(matrix) {
        return matrix.map(row => [...row]);
    }
}

export default GaussMethod;
