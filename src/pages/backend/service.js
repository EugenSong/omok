

const board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

let playerTurn = 1;
let gameEnded = false;

const getGameEnded = () => {
    return gameEnded;
}

const setGameEnded = (done) => {
    gameEnded = done;
}

const getPlayerTurn = () => {
    return playerTurn;
}

const updatePlayerTurn = (player) => {
    playerTurn = player;
}

const updateBoard = (playerPiece, xPos, yPos) => {

    // place piece on "empty" spot
    if (xPos >= 0 && xPos < board.length && yPos >= 0 && yPos < board[0].length && board[xPos][yPos] === 0) {
        board[xPos][yPos] = playerPiece;
        return 1;
    }
    // spot is already taken by a player
    else if ((xPos >= 0 && xPos < board.length && yPos >= 0 && yPos < board[0].length) && (board[xPos][yPos] === 1 || board[xPos][yPos] === 2)) return 2;

    return 0;
}

const copyBoard = () => {
    const printedBoard = [];

    // use for...of syntax b/c we want each value of iterable (array)
    for (const row of board) {

        /* 
        - use [...row] (spread operator) to create copy of row b/c arrs are ref types in js ...benefit: de-couple the array references
        - use .push instead of .append in js
        */
        printedBoard.push([...row]);
    }
    return printedBoard;
}


const resetBoard = () => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = 0;
        }
    }
    updatePlayerTurn(1);
    setGameEnded(false);
}

// check player win after each placed piece
const checkWin = (board, player) => {
    // console.log("board in checkWin() is the following: ", board);

    const numRows = board.length;
    const numCols = board[0].length;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (col <= numCols - 5) {
                // Check horizontal line
                if (
                    board[row][col] === player &&
                    board[row][col + 1] === player &&
                    board[row][col + 2] === player &&
                    board[row][col + 3] === player &&
                    board[row][col + 4] === player
                ) {
                    return true;
                }
            }
            if (row <= numRows - 5) {
                // Check vertical line
                if (
                    board[row][col] === player &&
                    board[row + 1][col] === player &&
                    board[row + 2][col] === player &&
                    board[row + 3][col] === player &&
                    board[row + 4][col] === player
                ) {
                    return true;
                }
                if (col <= numCols - 5) {
                    // Check diagonal line (top-left to bottom-right)
                    if (
                        board[row][col] === player &&
                        board[row + 1][col + 1] === player &&
                        board[row + 2][col + 2] === player &&
                        board[row + 3][col + 3] === player &&
                        board[row + 4][col + 4] === player
                    ) {
                        return true;
                    }
                }
                if (col >= 4) {
                    // Check diagonal line (top-right to bottom-left)
                    if (
                        board[row][col] === player &&
                        board[row + 1][col - 1] === player &&
                        board[row + 2][col - 2] === player &&
                        board[row + 3][col - 3] === player &&
                        board[row + 4][col - 4] === player
                    ) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

const checkForWinner = (board, piece) => {

    // win
    if (checkWin(board, piece)) {
        setGameEnded(true);
        return 1;
    }
    // tie
    else if (board.every((row) => row.every((cell) => cell !== 0))) {
        setGameEnded(true);
        return 2;
    }

    // continue playing
    return 0;
}

export {
    updateBoard,
    copyBoard,
    resetBoard,
    getPlayerTurn,
    updatePlayerTurn,
    getGameEnded,
    setGameEnded,
    checkForWinner
}

const gameService = {
    updateBoard,
    copyBoard,
    resetBoard,
    getPlayerTurn,
    updatePlayerTurn,
    getGameEnded,
    setGameEnded,
    checkForWinner,
};

export default gameService;