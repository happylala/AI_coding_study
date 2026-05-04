// 从board.js导入棋盘类
import { Board } from './board.js';
// 从gameLogic.js导入游戏逻辑类
import { GameLogic } from './gameLogic.js';
// 从ai.js导入AI类
import { AI } from './ai.js';

/**
 * 游戏主控制类
 * 负责协调UI和游戏逻辑
 */
class Game {
    constructor() {
        // 初始化棋盘大小
        this.boardSize = 15;
        // 创建棋盘实例
        this.board = new Board(this.boardSize);
        // 创建游戏逻辑实例
        this.gameLogic = new GameLogic(this.boardSize);
        // 当前玩家：true为黑方，false为白方
        this.currentPlayer = true;
        // 游戏是否结束
        this.gameOver = false;
        // 游戏模式：'pvp'为双人对战，'pve'为人机对战
        this.gameMode = 'pvp';
        // AI实例
        this.ai = null;
        // AI难度（1-3）
        this.aiDifficulty = 2;

        // 初始化游戏
        this.init();
    }

    /**
     * 初始化游戏
     * 渲染棋盘并绑定事件
     */
    init() {
        this.board.render();
        this.bindEvents();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 获取棋盘容器
        const boardElement = document.getElementById('board');
        // 监听棋盘点击事件
        boardElement.addEventListener('click', (e) => this.handleCellClick(e));

        // 获取重新开始按钮
        const restartBtn = document.getElementById('restartBtn');
        // 监听重新开始按钮点击事件
        restartBtn.addEventListener('click', () => this.restart());

        // 监听游戏模式选择
        const gameModeSelect = document.getElementById('gameMode');
        gameModeSelect.addEventListener('change', (e) => this.changeGameMode(e.target.value));

        // 监听AI难度选择
        const aiDifficultySelect = document.getElementById('aiDifficulty');
        aiDifficultySelect.addEventListener('change', (e) => {
            this.aiDifficulty = parseInt(e.target.value);
            if (this.ai) {
                this.ai = new AI(this.boardSize, this.aiDifficulty);
            }
        });
    }

    /**
     * 处理棋盘格子点击事件
     * @param {Event} e - 点击事件对象
     */
    handleCellClick(e) {
        // 如果游戏已结束，不处理点击
        if (this.gameOver) return;

        // 在人机模式下，如果当前是AI回合，不处理玩家点击
        if (this.gameMode === 'pve' && !this.currentPlayer) return;

        // 获取被点击的格子元素
        const cell = e.target;
        // 如果点击的不是格子，返回
        if (!cell.classList.contains('cell')) return;
        // 如果格子已被占用，返回
        if (cell.classList.contains('occupied')) return;

        // 获取格子的行列索引
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // 执行落子
        this.makeMove(row, col);
    }

    /**
     * 执行落子操作
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     */
    makeMove(row, col) {
        // 在游戏逻辑中放置棋子
        this.gameLogic.placeStone(row, col, this.currentPlayer);
        // 在UI上显示棋子
        this.board.placeStone(row, col, this.currentPlayer);

        // 检查是否获胜
        if (this.gameLogic.checkWin(row, col, this.currentPlayer)) {
            this.endGame(this.currentPlayer);
            return;
        }

        // 检查是否平局（棋盘已满）
        if (this.gameLogic.isBoardFull()) {
            this.endGame(null);
            return;
        }

        // 切换玩家
        this.currentPlayer = !this.currentPlayer;
        this.updatePlayerDisplay();

        // 如果是人机模式且轮到AI，让AI下棋
        if (this.gameMode === 'pve' && !this.currentPlayer) {
            // 延迟一下，让玩家看到自己的落子
            setTimeout(() => this.aiMove(), 500);
        }
    }

    /**
     * AI自动下棋
     */
    aiMove() {
        if (this.gameOver) return;

        // 获取AI的最佳落子位置
        const move = this.ai.getBestMove(this.gameLogic.board, this.currentPlayer);

        // 执行落子
        this.makeMove(move.row, move.col);
    }

    /**
     * 切换游戏模式
     * @param {string} mode - 游戏模式（'pvp'或'pve'）
     */
    changeGameMode(mode) {
        this.gameMode = mode;

        // 显示或隐藏AI难度选择
        const aiDifficultyContainer = document.getElementById('aiDifficultyContainer');
        if (mode === 'pve') {
            aiDifficultyContainer.style.display = 'block';
            // 创建AI实例
            this.ai = new AI(this.boardSize, this.aiDifficulty);
        } else {
            aiDifficultyContainer.style.display = 'none';
            this.ai = null;
        }

        // 重新开始游戏
        this.restart();
    }

    /**
     * 更新当前玩家显示
     */
    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('currentPlayer');
        playerDisplay.textContent = this.currentPlayer ? '黑方' : '白方';
    }

    /**
     * 结束游戏
     * @param {boolean|null} winner - 获胜方，null表示平局
     */
    endGame(winner) {
        this.gameOver = true;
        const resultElement = document.getElementById('gameResult');

        if (winner === null) {
            resultElement.textContent = '平局！';
        } else {
            const winnerText = winner ? '黑方' : '白方';
            resultElement.textContent = `${winnerText}获胜！`;
        }

        resultElement.classList.remove('hidden');
        resultElement.classList.add('winner');
    }

    /**
     * 重新开始游戏
     */
    restart() {
        // 重置游戏状态
        this.currentPlayer = true;
        this.gameOver = false;

        // 重置棋盘
        this.board.clear();
        this.gameLogic.clear();

        // 隐藏结果提示
        const resultElement = document.getElementById('gameResult');
        resultElement.classList.add('hidden');
        resultElement.classList.remove('winner');

        // 更新玩家显示
        this.updatePlayerDisplay();
    }
}

// 当DOM加载完成后，创建游戏实例
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
