function Player(name, sign, score) {
    function increaseScore() {
        this.score++;
    }
    return {name, sign, score, increaseScore}
}
const playerX = Player('playerX', 'x', 0);
const playerO = Player('playerO', 'o', 0);



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

    let currentTurn = playerX.sign;

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
        // e.target.style.pointerEvents = 'none';
    }

    function updateCurrentTurn() {
        currentTurn = (currentTurn === playerX.sign) ? playerO.sign : playerX.sign;
    }

    function getCurrentTurn() {
        return currentTurn;
    }

    function increaseScore() {
        const winner = currentTurn === 'x' ? playerX : playerO;
        winner.increaseScore();
        currentTurn = winner.sign;
    }

    function restartGame() {
        for (let i = 0; i < board.length; i++) {
            board[i] = null;
        }
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
        });
    });

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
        xScore.innerText = playerX.score;
        oScore.innerText = playerO.score;
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