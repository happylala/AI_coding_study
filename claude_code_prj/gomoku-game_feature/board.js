/**
 * 棋盘类
 * 负责棋盘的渲染和UI操作
 */
export class Board {
    /**
     * 构造函数
     * @param {number} size - 棋盘大小（默认15x15）
     */
    constructor(size = 15) {
        this.size = size;
        // 获取棋盘DOM元素
        this.boardElement = document.getElementById('board');
    }

    /**
     * 渲染棋盘
     * 创建所有格子元素
     */
    render() {
        // 清空棋盘
        this.boardElement.innerHTML = '';

        // 创建所有格子
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                // 创建格子元素
                const cell = document.createElement('div');
                cell.className = 'cell';
                // 存储格子的行列信息
                cell.dataset.row = row;
                cell.dataset.col = col;
                // 添加到棋盘
                this.boardElement.appendChild(cell);
            }
        }
    }

    /**
     * 在指定位置放置棋子
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {boolean} isBlack - 是否为黑棋
     */
    placeStone(row, col, isBlack) {
        // 计算格子在DOM中的索引
        const index = row * this.size + col;
        const cell = this.boardElement.children[index];

        // 添加棋子样式
        cell.classList.add(isBlack ? 'black' : 'white');
        cell.classList.add('occupied');
    }

    /**
     * 清空棋盘
     * 移除所有棋子
     */
    clear() {
        // 获取所有格子
        const cells = this.boardElement.querySelectorAll('.cell');
        // 移除所有棋子样式
        cells.forEach(cell => {
            cell.classList.remove('black', 'white', 'occupied');
        });
    }
}
