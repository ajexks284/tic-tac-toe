function Player(name, sign, score) {
    function increaseScore() {
        this.score++;
    }
    return {name, sign, score, increaseScore}
}
const myPlayer = Player('myPlayer', 'x', 0);
const myComputer = Player('myComputer', 'o', 0);



const Gameboard = (function() {
    const board = [null, null, null, null, null, null, null, null, null];
    const WINNING_COMBINATIONS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    let currentTurn = myPlayer.sign;

    function checkForWin() {
        return WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => {
                return board[index] === currentTurn;
            })
        })
    }

    function detStrikeThroughClass() {
        return 's' + WINNING_COMBINATIONS.indexOf(WINNING_COMBINATIONS.find(combination => {
            return combination.every(index => {
                return board[index] === currentTurn;
            })
        }))
    }

    function checkForDraw() {
        const isAnyCellNull = board.some(cell => cell === null);
        return isAnyCellNull === false && !checkForWin();
    }

    function addMarkInArray(e) {
        const position = [...UI.cells].indexOf(e.target);
        board[position] = currentTurn;
        UI.renderBoard();
    }

    function updateCurrentTurn() {
        currentTurn = (currentTurn === myPlayer.sign) ? myComputer.sign : myPlayer.sign;
    }

    function getCurrentTurn() {
        return currentTurn;
    }

    function increaseScore() {
        const winner = currentTurn === 'x' ? myPlayer : myComputer;
        winner.increaseScore();
    }

    function restartGame() {
        for (let i = 0; i < board.length; i++) {
            board[i] = null;
        }
        currentTurn = myPlayer.sign;
    }

    return {
        board,
        addMarkInArray,
        updateCurrentTurn,
        getCurrentTurn,
        checkForWin,
        checkForDraw,
        detStrikeThroughClass,
        increaseScore,
        restartGame,
    }
})();

const UI = (function() {
    const cells = document.querySelectorAll('.cell');

    function renderBoard() {
        [...cells].forEach(cell => {
            if (Gameboard.board[[...cells].indexOf(cell)] !== null) {
                cell.classList.add(Gameboard.board[[...cells].indexOf(cell)]);
                cell.style.pointerEvents = 'none';
            } else {
                cell.classList.remove('x');
                cell.classList.remove('o');
            }
        })
    }

    [...cells].forEach(cell => {
        cell.addEventListener('click', (e) => {
            Gameboard.addMarkInArray(e);

            if (Gameboard.checkForWin()) {
                displayWinner();
                setStrikeThrough();
                increaseScoreOnScreen();
                return;
            };

            if (Gameboard.checkForDraw()) {
                displayDraw();
                return;
            }

            updateCurrentTurnOnScreen();

            makeAIMove();
        });
    });

    function makeAIMove() {
        let aiMove = [...AI.findBestMove(AI.board())];

        let i;
        switch (aiMove.join(' ')) {
            case '0 0':
                i = 0;
                break;
            case '0 1':
                i = 1;
                break;
            case '0 2':
                i = 2;
                break;
            case '1 0':
                i = 3;
                break;
            case '1 1':
                i = 4;
                break;
            case '1 2':
                i = 5;
                break;
            case '2 0':
                i = 6;
                break;
            case '2 1':
                i = 7;
                break;
            case '2 2':
                i = 8;
                break;
        }
        Gameboard.board[i] = Gameboard.getCurrentTurn();

        renderBoard();

        if (Gameboard.checkForWin()) {
            displayWinner();
            setStrikeThrough();
            increaseScoreOnScreen();
            return;
        };

        if (Gameboard.checkForDraw()) {
            displayDraw();
            return;
        }

        updateCurrentTurnOnScreen();
    }

    const messageDiv = document.querySelector('.message-div');

    function updateCurrentTurnOnScreen() {
        Gameboard.updateCurrentTurn();
        messageDiv.innerText = Gameboard.getCurrentTurn().toUpperCase() + '\'s turn';
    }

    function displayWinner() {
        messageDiv.innerText = `${Gameboard.getCurrentTurn().toUpperCase()} has won!`;
        [...cells].forEach(cell => {
            cell.style.pointerEvents = 'none';
        })
        restartButton.style.pointerEvents = 'all';
    }

    function displayDraw() {
        messageDiv.innerText = 'It\'s a draw!';
        restartButton.style.pointerEvents = 'all';
    }

    const gameBoard = document.querySelector('.game-board');

    function setStrikeThrough() {
        let strikeThroughClass = Gameboard.detStrikeThroughClass();
        gameBoard.classList.add(strikeThroughClass);
    }

    const xScore = document.getElementById('xScore');
    const oScore = document.getElementById('oScore');

    function increaseScoreOnScreen() {
        Gameboard.increaseScore();
        xScore.innerText = myPlayer.score;
        oScore.innerText = myComputer.score;
    }

    const matchRound = document.querySelector('.round');

    function restartGameOnScreen() {
        Gameboard.restartGame();
        renderBoard();
        [...cells].forEach(cell => {
            cell.style.pointerEvents = 'all';
        });
        gameBoard.classList = 'game-board';
        messageDiv.innerText = Gameboard.getCurrentTurn().toUpperCase() + '\'s turn';
        matchRound.innerText = parseInt(matchRound.innerText) + 1;
        restartButton.style.pointerEvents = 'none';
    }

    const restartButton = document.querySelector('.restart-btn');
    restartButton.addEventListener('click', restartGameOnScreen);

    return {
        cells,
        renderBoard,
    }
})();



// AI 
const AI = (function () {
    // Formats the board as a 3x3 array
    function board() {
        return [[Gameboard.board[0], Gameboard.board[1], Gameboard.board[2]],
                [Gameboard.board[3], Gameboard.board[4], Gameboard.board[5]],
                [Gameboard.board[6], Gameboard.board[7], Gameboard.board[8]]];
    }

    const player = myComputer.sign; // player is AI
    const opponent = myPlayer.sign; // AI's opponent is us

    function isMovesLeft(board) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) return true;
            }
        }
        return false;
    }

    function evaluate(board) {
        // Checking Rows
        for (let i = 0; i < 3; i++) {
            if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
                if (board[i][0] === player) return 10;
                else if (board[i][0] === opponent) return -10;
            }
        }

        // Checking Columns
        for (let i = 0; i < 3; i++) {
            if (board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
                if (board[0][i] === player) return 10;
                else if (board[0][i] === opponent) return -10;
            }
        }

        // Checking Diagonals
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            if (board[0][0] === player) return 10;
            else if (board[0][0] === opponent) return -10;
        }

        if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            if (board[0][2] === player) return 10;
            else if (board[0][2] === opponent) return -10;
        }

        // If none is true, return 0 (no winners)
        return 0;
    }

    function minimax(board, depth, isMax) {
        score = evaluate(board);

        if (score === 10) return score;
        if (score === -10) return score;
        if (isMovesLeft(board) === false) return 0;

        if (isMax) {
            let best = -1000;

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = player;
                        best = Math.max(best, minimax(board, depth + 1, !isMax));
                        board[i][j] = null;
                    }
                }
            }

            return best;
        } else {
            let best = 1000;

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] == null) {
                        board[i][j] = opponent;
                        best = Math.min(best, minimax(board, depth + 1, !isMax));
                        board[i][j] = null;
                    }
                }
            }
            
            return best;
        }
    }

    function findBestMove(board) {
        let bestVal = -1000;
        let bestMove = [-1, -1];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] == null) {
                    board[i][j] = player;

                    let moveVal = minimax(board, 0 , false);

                    board[i][j] = null;

                    if (moveVal > bestVal) {
                        bestMove = [i, j];
                        bestVal = moveVal;
                    }
                }
            }
        }

        return bestMove;
    }

    return {
        board,
        findBestMove,
    }
})();