/**
 * 游戏逻辑类
 * 负责游戏规则判断和状态管理
 */
export class GameLogic {
    /**
     * 构造函数
     * @param {number} size - 棋盘大小
     */
    constructor(size = 15) {
        this.size = size;
        // 初始化棋盘状态数组（0表示空，1表示黑棋，2表示白棋）
        this.board = Array(size).fill(null).map(() => Array(size).fill(0));
    }

    /**
     * 在指定位置放置棋子
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {boolean} isBlack - 是否为黑棋
     */
    placeStone(row, col, isBlack) {
        this.board[row][col] = isBlack ? 1 : 2;
    }

    /**
     * 检查指定位置是否获胜
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {boolean} isBlack - 是否为黑棋
     * @returns {boolean} 是否获胜
     */
    checkWin(row, col, isBlack) {
        const player = isBlack ? 1 : 2;

        // 四个方向：水平、垂直、主对角线、副对角线
        const directions = [
            { dr: 0, dc: 1 },   // 水平
            { dr: 1, dc: 0 },   // 垂直
            { dr: 1, dc: 1 },   // 主对角线
            { dr: 1, dc: -1 }   // 副对角线
        ];

        // 检查每个方向
        for (const { dr, dc } of directions) {
            if (this.checkDirection(row, col, dr, dc, player)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查指定方向是否有五子连珠
     * @param {number} row - 起始行
     * @param {number} col - 起始列
     * @param {number} dr - 行方向增量
     * @param {number} dc - 列方向增量
     * @param {number} player - 玩家标识（1或2）
     * @returns {boolean} 是否有五子连珠
     */
    checkDirection(row, col, dr, dc, player) {
        let count = 1; // 当前位置算一个

        // 向正方向检查
        count += this.countStones(row, col, dr, dc, player);
        // 向反方向检查
        count += this.countStones(row, col, -dr, -dc, player);

        // 如果连续棋子数量>=5，则获胜
        return count >= 5;
    }

    /**
     * 从指定位置沿指定方向计算连续的同色棋子数量
     * @param {number} row - 起始行
     * @param {number} col - 起始列
     * @param {number} dr - 行方向增量
     * @param {number} dc - 列方向增量
     * @param {number} player - 玩家标识
     * @returns {number} 连续棋子数量
     */
    countStones(row, col, dr, dc, player) {
        let count = 0;
        let r = row + dr;
        let c = col + dc;

        // 沿指定方向遍历，直到遇到边界或不同颜色的棋子
        while (
            r >= 0 && r < this.size &&
            c >= 0 && c < this.size &&
            this.board[r][c] === player
        ) {
            count++;
            r += dr;
            c += dc;
        }

        return count;
    }

    /**
     * 检查棋盘是否已满
     * @returns {boolean} 棋盘是否已满
     */
    isBoardFull() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 清空棋盘状态
     */
    clear() {
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    }
}
