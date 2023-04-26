import { countReset } from "console";


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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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

const checkWin = (board, player) => {
    const numRows = board.length;
    const numCols = board[0].length;

    // // Make six or more pieces in a row invalid && check (horizontal) win
    for (let row = 0; row < numRows; row++) {
        let counter = 0;
        for (let col = 0; col < numCols; col++) {
            while (board[row][col] === player) {
                col++;
                counter++;

                // needs to be col <= numCols b/c col++ - check when col / numCols === 19 !!
                if (counter === 5 && board[row][col] === player && col <= numCols) {
                    counter = 0;
                    continue;
                } else if (counter === 5 && board[row][col] !== player && col <= numCols) {
                    return true;
                }
            }
            counter = 0;
        }
    }

    // Make six or more pieces in a row invalid && check (vertical) win
    for (let col = 0; col < numCols; col++) {
        let counter = 0;
        for (let row = 0; row < numRows; row++) {
            while (board[row][col] === player) {
                row++;
                counter++;

                if (counter === 5 && board[row][col] === player && row <= numRows) {
                    counter = 0;
                    continue;
                } else if (counter === 5 && board[row][col] !== player && row <= numRows) {
                    return true;
                }
            }
            counter = 0;
        }
    }

    // // Make six or more pieces in a row invalid && check (vertical) win
    // for (let col = 0; col < numCols; col++) {
    //     let count = 0;
    //     for (let row = 0; row < numRows; row++) {
    //         if (board[row][col] === player) {
    //             count++;
    //             if (count === 5 && board[row + 1][col] === player) {
    //                 count = 0;
    //                 continue;
    //             }
    //             else if (count === 5 && board[row + 1][col] !== player) {
    //                 return true;
    //             }
    //         }
    //         else {
    //             count = 0;
    //         }
    //     }
    // }

    // // Check for six or more pieces in a row (diagonal, top left -> bottom right) 
    // for (let row = 0; row < numRows; row++) {
    //     let count = 0;
    //     for (let col = 0; col < numCols; col++) {

    //         const c = col;
    //         const r = row;

    //         while (board[row][col] === player) {
    //             row++;
    //             col++;
    //             count++;

    //             if (row < numRows && col < numCols) {

    //                 if (count === 5 && board[row][col] === player) {
    //                     count = 0;
    //                     break;
    //                 }
    //                 else if (count === 5 && board[row][col] !== player) {
    //                     return true;
    //                 }
    //             }
    //         }


    //     }

    // }

    // // Check for six or more pieces in a row (diagonal, bottom-left --> top-right) 
    // for (let row = 0; row < numRows; row++) {
    //     let count = 0;
    //     for (let col = 0; col < numCols; col++) {
    //         if (board[row][col] === player) {
    //             count++;

    //             if (row - 1 >= 0 && col + 1 < numCols) {
    //                 if (count === 5 && board[row - 1][col + 1] === player) {
    //                     count = 0;
    //                     continue;
    //                 }
    //                 else if (count === 5 && board[row - 1][col + 1] !== player) {
    //                     return true;
    //                 }
    //             }
    //         }
    //         else {
    //             count = 0;
    //         }
    //     }
    // }



    // // Check for six or more pieces in a row (diagonal, top-right to bottom-left)
    // for (let row = 0; row <= numRows - 6; row++) {
    //     let count = 0;
    //     for (let col = 5; col < numCols; col++) {
    //         count = 0;
    //         for (let i = 0; i < 6; i++) {
    //             if (board[row + i][col - i] === player) {
    //                 count++;
    //                 if (count >= 6) {
    //                     count = 0;
    //                     return false;
    //                 }
    //             }

    //         }
    //     }
    // }

    // // Check for five in a row (diagonal, top-left to bottom-right)
    // for (let row = 0; row <= numRows - 5; row++) {
    //     for (let col = 0; col <= numCols - 5; col++) {
    //         if (
    //             board[row][col] === player &&
    //             board[row + 1][col + 1] === player &&
    //             board[row + 2][col + 2] === player &&
    //             board[row + 3][col + 3] === player &&
    //             board[row + 4][col + 4] === player
    //         ) {
    //             return true;
    //         }
    //     }
    // }

    // // Check for five in a row (diagonal, top-right to bottom-left)
    // for (let row = 0; row <= numRows - 5; row++) {
    //     for (let col = 4; col < numCols; col++) {
    //         if (
    //             board[row][col] === player &&
    //             board[row + 1][col - 1] === player &&
    //             board[row + 2][col - 2] === player &&
    //             board[row + 3][col - 3] === player &&
    //             board[row + 4][col - 4] === player
    //         ) {
    //             return true;
    //         }
    //     }
    // }

    // No five-in-a-row or six or more pieces in a row found
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