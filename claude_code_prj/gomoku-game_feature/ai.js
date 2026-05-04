/**
 * AI类
 * 实现五子棋AI算法（极小极大算法 + Alpha-Beta剪枝）
 */
export class AI {
    /**
     * 构造函数
     * @param {number} size - 棋盘大小
     * @param {number} difficulty - 难度等级（1-3，对应搜索深度）
     */
    constructor(size = 15, difficulty = 2) {
        this.size = size;
        // 根据难度设置搜索深度：简单=1，中等=2，困难=3
        this.maxDepth = difficulty;
    }

    /**
     * 获取AI的最佳落子位置
     * @param {Array} board - 当前棋盘状态
     * @param {boolean} isBlack - AI是否为黑方
     * @returns {Object} 最佳位置 {row, col}
     */
    getBestMove(board, isBlack) {
        const player = isBlack ? 1 : 2;
        const opponent = isBlack ? 2 : 1;

        // 获取所有可能的落子位置（只考虑已有棋子周围的位置）
        const candidates = this.getCandidateMoves(board);

        if (candidates.length === 0) {
            // 如果棋盘为空，下在中心位置
            const center = Math.floor(this.size / 2);
            return { row: center, col: center };
        }

        let bestScore = -Infinity;
        let bestMove = candidates[0];

        // 遍历所有候选位置，找到最佳落子点
        for (const move of candidates) {
            // 尝试在该位置落子
            board[move.row][move.col] = player;

            // 使用极小极大算法评估该位置
            const score = this.minimax(
                board,
                this.maxDepth - 1,
                false,
                -Infinity,
                Infinity,
                player,
                opponent
            );

            // 撤销落子
            board[move.row][move.col] = 0;

            // 更新最佳位置
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * 极小极大算法（带Alpha-Beta剪枝）
     * @param {Array} board - 棋盘状态
     * @param {number} depth - 搜索深度
     * @param {boolean} isMaximizing - 是否为最大化玩家
     * @param {number} alpha - Alpha值
     * @param {number} beta - Beta值
     * @param {number} player - AI玩家标识
     * @param {number} opponent - 对手玩家标识
     * @returns {number} 评估分数
     */
    minimax(board, depth, isMaximizing, alpha, beta, player, opponent) {
        // 检查游戏是否结束或达到搜索深度
        const winner = this.checkWinner(board);
        if (winner === player) return 10000;
        if (winner === opponent) return -10000;
        if (depth === 0) return this.evaluateBoard(board, player, opponent);

        const candidates = this.getCandidateMoves(board);
        if (candidates.length === 0) return 0;

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of candidates) {
                board[move.row][move.col] = player;
                const score = this.minimax(
                    board,
                    depth - 1,
                    false,
                    alpha,
                    beta,
                    player,
                    opponent
                );
                board[move.row][move.col] = 0;

                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Beta剪枝
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of candidates) {
                board[move.row][move.col] = opponent;
                const score = this.minimax(
                    board,
                    depth - 1,
                    true,
                    alpha,
                    beta,
                    player,
                    opponent
                );
                board[move.row][move.col] = 0;

                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha剪枝
            }
            return minScore;
        }
    }

    /**
     * 评估棋盘局势
     * @param {Array} board - 棋盘状态
     * @param {number} player - AI玩家标识
     * @param {number} opponent - 对手玩家标识
     * @returns {number} 评估分数
     */
    evaluateBoard(board, player, opponent) {
        let score = 0;

        // 评估所有方向的棋型
        const directions = [
            { dr: 0, dc: 1 },   // 水平
            { dr: 1, dc: 0 },   // 垂直
            { dr: 1, dc: 1 },   // 主对角线
            { dr: 1, dc: -1 }   // 副对角线
        ];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (board[row][col] === 0) continue;

                for (const { dr, dc } of directions) {
                    const pattern = this.getPattern(board, row, col, dr, dc);
                    score += this.evaluatePattern(pattern, player);
                }
            }
        }

        return score;
    }

    /**
     * 获取指定位置和方向的棋型
     * @param {Array} board - 棋盘状态
     * @param {number} row - 起始行
     * @param {number} col - 起始列
     * @param {number} dr - 行方向增量
     * @param {number} dc - 列方向增量
     * @returns {Array} 棋型数组
     */
    getPattern(board, row, col, dr, dc) {
        const pattern = [];
        for (let i = 0; i < 5; i++) {
            const r = row + i * dr;
            const c = col + i * dc;
            if (r < 0 || r >= this.size || c < 0 || c >= this.size) {
                pattern.push(-1); // 边界
            } else {
                pattern.push(board[r][c]);
            }
        }
        return pattern;
    }

    /**
     * 评估棋型分数
     * @param {Array} pattern - 棋型数组
     * @param {number} player - AI玩家标识
     * @returns {number} 棋型分数
     */
    evaluatePattern(pattern, player) {
        const opponent = player === 1 ? 2 : 1;
        let playerCount = 0;
        let opponentCount = 0;
        let emptyCount = 0;

        for (const cell of pattern) {
            if (cell === player) playerCount++;
            else if (cell === opponent) opponentCount++;
            else if (cell === 0) emptyCount++;
        }

        // 如果同时有双方的棋子，该棋型无效
        if (playerCount > 0 && opponentCount > 0) return 0;

        // 根据连子数量评分
        if (playerCount === 4 && emptyCount === 1) return 1000;  // 活四
        if (playerCount === 3 && emptyCount === 2) return 100;   // 活三
        if (playerCount === 3 && emptyCount === 1) return 50;    // 冲三
        if (playerCount === 2 && emptyCount === 3) return 10;    // 活二
        if (playerCount === 2 && emptyCount === 2) return 5;     // 眠二

        // 防守评分（对手的威胁）
        if (opponentCount === 4 && emptyCount === 1) return -800;  // 对手活四
        if (opponentCount === 3 && emptyCount === 2) return -80;   // 对手活三
        if (opponentCount === 3 && emptyCount === 1) return -40;   // 对手冲三

        return 0;
    }

    /**
     * 检查是否有玩家获胜
     * @param {Array} board - 棋盘状态
     * @returns {number} 获胜方（0表示无人获胜）
     */
    checkWinner(board) {
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const player = board[row][col];
                if (player === 0) continue;

                for (const { dr, dc } of directions) {
                    let count = 1;
                    for (let i = 1; i < 5; i++) {
                        const r = row + i * dr;
                        const c = col + i * dc;
                        if (
                            r < 0 || r >= this.size ||
                            c < 0 || c >= this.size ||
                            board[r][c] !== player
                        ) {
                            break;
                        }
                        count++;
                    }
                    if (count >= 5) return player;
                }
            }
        }

        return 0;
    }

    /**
     * 获取候选落子位置（已有棋子周围2格内的空位）
     * @param {Array} board - 棋盘状态
     * @returns {Array} 候选位置数组
     */
    getCandidateMoves(board) {
        const candidates = new Set();
        const range = 2; // 搜索范围

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (board[row][col] !== 0) {
                    // 在已有棋子周围寻找空位
                    for (let dr = -range; dr <= range; dr++) {
                        for (let dc = -range; dc <= range; dc++) {
                            const r = row + dr;
                            const c = col + dc;
                            if (
                                r >= 0 && r < this.size &&
                                c >= 0 && c < this.size &&
                                board[r][c] === 0
                            ) {
                                candidates.add(`${r},${c}`);
                            }
                        }
                    }
                }
            }
        }

        // 转换为对象数组
        return Array.from(candidates).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return { row, col };
        });
    }
}
