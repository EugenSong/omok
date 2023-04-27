
const BOARD_LEN = 19;
const board = Array(BOARD_LEN).fill(0).map(() => Array(BOARD_LEN).fill(0));
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
    if (xPos >= 0 && xPos < BOARD_LEN && yPos >= 0 && yPos < BOARD_LEN && board[xPos][yPos] === 0) {
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


// Check (horizontal) 5-in-a-row win && make six or more pieces in a row invalid &&
const checkHorizontal = (board, player) => {

    const numRows = BOARD_LEN;
    const numCols = BOARD_LEN;


    for (let row = 0; row < numRows; row++) {
        let counter = 0;
        for (let col = 0; col < numCols; col++) {

            // ensure col only goes up to max col (index 14) 
            if (col + 4 < numCols) {
                while (board[row][col] === player) {
                    col++;
                    counter++;

                    console.log('col at check horizontal after ++ is: ', col);

                    // needs to be col <= numCols b/c col++ - check when col / numCols === 19 !!
                    if (counter === 5 && board[row][col] === player) {
                        console.log('counter === 5 but next piece is also player')

                        // handles 10 pieces in a row --> move col pointer until end or other player piece
                        while (1) {

                            if (col > 18) break;

                            else if (board[row][col] === player) {
                                col++;
                            }
                            else {
                                break;
                            }
                        }

                        // if end --> exit player loop
                        if (col > 18) break;

                        counter = 0;
                    } else if (counter === 5 && board[row][col] !== player) {
                        console.log('row is in horizontal checkWin(): ', row);
                        console.log('col is in horizontal checkWin(): ', col);
                        console.log('found winner in check horizontal!!');
                        return true;
                    }
                };
                counter = 0;
            };

        };
    }
    return false;
}

// Check vertical win && Make 6+ pieces in row invalid 
const checkVertical = (board, player) => {
    const numRows = BOARD_LEN
    const numCols = BOARD_LEN

    for (let col = 0; col < numCols; col++) {
        let counter = 0;
        for (let row = 0; row < numRows; row++) {

            // ensure row (5 win con) only goes up to maximum row (index 14)
            if (row + 4 < numRows) {
                while (board[row][col] === player) {
                    row++;
                    counter++;

                    //  case: 5 in a row where vertical win exists from the bottom 
                    if (counter === 5 && row === 19 && board[13][col] !== player) {
                        return true;
                    }

                    // check if 6+ wins --> move pointer 
                    if (counter === 5 && board[row][col] === player) {
                        while (1) {
                            if (row > 18) break;
                            else if (board[row][col] === player) {
                                row++;
                            } else {
                                break;
                            }
                        }
                        if (row > 18) break;
                        counter = 0;
                    } else if (counter === 5 && board[row][col] !== player) {
                        return true;
                    }
                };
                counter = 0;
            };
        }
    }
    return false;
}

// Check Downstairs Diag (top left -> bottom right) & make 6+ pieces row invalid
const checkDownDiag = (board, player) => {
    const numRows = BOARD_LEN
    const numCols = BOARD_LEN

    for (let row = 0; row < numRows - 4; row++) {
        let count = 0;
        // since down diags can only maximally start @ index 14 
        for (let col = 0; col < numCols - 4; col++) {

            while (board[row][col] === player) {
                row++;
                col++;
                count++;

                // win w/ max start row index for down diag 
                if (count === 5 && row === 19 && board[13][col] !== player) {
                    return true;
                }

                // win w/ max start col index for down diag
                if (count === 5 && col === 19 && board[row][13] !== player) {
                    return true;
                }

                // check if 6+ wins --> move pointer 
                if (count === 5 && board[row][col] === player) {

                    // loop to move pointer up to the maximum dest index
                    while (1) {
                        if (row >= 18 || col >= 18) break;
                        else if (board[row][col] === player) {
                            row++;
                            col++;
                        } else {
                            break;
                        }
                    }
                    if (row >= 18 || col >= 18) break;
                    count = 0; // found diff piece -> reset
                }
                else if (count === 5 && board[row][col] !== player) {
                    return true;
                }
            }
            count = 0;
        }
    }
    return false;
}


// Check Upstairs Diag (bottom-left -> top right) & make 6+ pieces row invalid
const checkUpDiag = (board, player) => {
    const numRows = BOARD_LEN
    const numCols = BOARD_LEN

    for (let row = 0; row < numRows - 4; row++) {
        let count = 0;
        // since down diags can only maximally start @ index 14 
        for (let col = 0; col < numCols - 4; col++) {

            while (board[row][col] === player) {
                row++;
                col++;
                count++;

                // win w/ max start row index for down diag 
                if (count === 5 && row === 19 && board[13][col] !== player) {
                    return true;
                }

                // win w/ max start col index for down diag
                if (count === 5 && col === 19 && board[row][13] !== player) {
                    return true;
                }

                // check if 6+ wins --> move pointer 
                if (count === 5 && board[row][col] === player) {

                    // loop to move pointer up to the maximum dest index
                    while (1) {
                        if (row >= 18 || col >= 18) break;
                        else if (board[row][col] === player) {
                            row++;
                            col++;
                        } else {
                            break;
                        }
                    }
                    if (row >= 18 || col >= 18) break;
                    count = 0; // found diff piece -> reset
                }
                else if (count === 5 && board[row][col] !== player) {
                    return true;
                }
            }
            count = 0;
        }
    }
    return false;
}


// umbrella checkwin func - wraps all directional checks
const checkWin = (board, player) => {

    if (checkHorizontal(board, player)) return true;
    console.log("made it past check horizonotal");
    if (checkVertical(board, player)) return true;
    if (checkDownDiag(board, player)) return true;
    if (checkUpDiag(board, player)) return true;

    // No five-in-a-row win or there exists invalid # of pieces in a row for a win (6+)
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