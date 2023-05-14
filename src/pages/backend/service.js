const BOARD_LEN = 19;
const board = Array(BOARD_LEN)
  .fill(0)
  .map(() => Array(BOARD_LEN).fill(0));
let playerTurn = 1;
let startPlayer = 1;

const getPlayerTurn = () => {
  return playerTurn;
};

const updatePlayerTurn = (player) => {
  playerTurn = player;
};

// check in here for double 3's
const updateBoard = (playerPiece, xPos, yPos) => {
  // check first for double three placement before placing into board
  // if (doubleThree)

  // place piece on "empty" spot
  if (
    xPos >= 0 &&
    xPos < BOARD_LEN &&
    yPos >= 0 &&
    yPos < BOARD_LEN &&
    board[xPos][yPos] === 0
  ) {
    board[xPos][yPos] = playerPiece;
    return 1;
  }
  // spot is already taken by a player
  else if (
    xPos >= 0 &&
    xPos < board.length &&
    yPos >= 0 &&
    yPos < board[0].length &&
    (board[xPos][yPos] === 1 || board[xPos][yPos] === 2)
  )
    return 2;

  return 0;
};

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
};

const resetBoard = () => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      board[i][j] = 0;
    }
  }

  // updatePlayerTurn(1);

  // ternary to pass starting side to other player
  startPlayer === 1
    ? (updatePlayerTurn(2), (startPlayer = 2))
    : (updatePlayerTurn(1), (startPlayer = 1));

  return;
};

// Check (horizontal) 5-in-a-row win && make six or more pieces in a row invalid &&
const checkHorizontal = (board, player) => {
  const numRows = BOARD_LEN;
  const numCols = BOARD_LEN;

  console.log(" **** checkHorizontal entered ***** ");

  for (let row = 0; row < numRows; row++) {
    let counter = 0;
    for (let col = 0; col < numCols; col++) {
      // ensure col only goes up to max col (index 14)
      if (col + 4 < numCols) {
        while (board[row][col] === player) {
          col++;
          counter++;

          // needs to be col <= numCols b/c col++ - check when col / numCols === 19 !!
          if (counter === 5 && board[row][col] === player) {
            console.log("counter === 5 but next piece is also player");

            // handles 10 pieces in a row --> move col pointer until end or other player piece
            while (1) {
              if (col > 18) break;
              else if (board[row][col] === player) {
                col++;
              } else {
                break;
              }
            }

            // if end --> exit player loop
            if (col > 18) break;

            counter = 0;
          } else if (counter === 5 && board[row][col] !== player) {
            console.log("row is in horizontal checkWin(): ", row);
            console.log("col is in horizontal checkWin(): ", col);
            console.log("found winner in check horizontal!!");
            return true;
          }
        }
        counter = 0;
      }
    }
  }
  return false;
};

// Check vertical win && Make 6+ pieces in row invalid
const checkVertical = (board, player) => {
  const numRows = BOARD_LEN;
  const numCols = BOARD_LEN;

  console.log(" **** checkVertical entered ***** ");

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
        }
        counter = 0;
      }
    }
  }
  return false;
};

// Check Downstairs Diag (top left -> bottom right) & make 6+ pieces row invalid
const checkDownDiag = (board, player) => {
  const numRows = BOARD_LEN;
  const numCols = BOARD_LEN;

  console.log(" **** checkDownDiag entered ***** ");

  // start row/col from index 1 so I can address the square before the first with -6 down there
  for (let row = 0; row < numRows - 4; row++) {
    // since down diags can only maximally start @ index 14
    for (let col = 0; col < numCols - 4; col++) {
      // handle for row / col index 0
      if (row === 0) {
        // handles row 0, cols 0-13
        if (col < 14) {
          if (
            board[row][col] === player &&
            board[row + 1][col + 1] === player &&
            board[row + 2][col + 2] === player &&
            board[row + 3][col + 3] === player &&
            board[row + 4][col + 4] === player &&
            board[row + 5][col + 5] !== player
          ) {
            return true;
          }
        }

        // handles row 0 , col 14
        else if (col === 14) {
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

        continue;
      } else if (col === 0) {
        // handles rows 0-13 , col 0
        if (row < 14) {
          if (
            board[row][col] === player &&
            board[row + 1][col + 1] === player &&
            board[row + 2][col + 2] === player &&
            board[row + 3][col + 3] === player &&
            board[row + 4][col + 4] === player &&
            board[row + 5][col + 5] !== player
          ) {
            return true;
          }
        }

        // handles row 14, col 0
        else if (row === 14) {
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

        continue;
      }

      // starts anywhere index but 0 [1-14]
      else {
        if (row === 14 || col === 14) {
          if (
            board[row][col] === player &&
            board[row + 1][col + 1] === player &&
            board[row + 2][col + 2] === player &&
            board[row + 3][col + 3] === player &&
            board[row + 4][col + 4] === player &&
            board[row - 1][col - 1] !== player
          ) {
            return true;
          }
          continue;
        }

        // check for down diag that starts at left wall

        if (
          board[row][col] === player &&
          board[row + 1][col + 1] === player &&
          board[row + 2][col + 2] === player &&
          board[row + 3][col + 3] === player &&
          board[row + 4][col + 4] === player &&
          board[row + 5][col + 5] !== player &&
          board[row - 1][col - 1] !== player
        ) {
          return true;
        }
        continue;
      }
    }
  }
  return false;
};

// Check Upstairs Diag (bottom-left -> top right) & make 6+ pieces row invalid
const checkUpDiag = (board, player) => {
  console.log(" **** checkUpDiag entered ***** ");
  const numRows = BOARD_LEN;
  const numCols = BOARD_LEN;

  // start row/col from index 1 so I can address the square before the first with -6 down there
  for (let row = 0; row < numRows - 4; row++) {
    // start cols from right side... 2nd column from wall up to col index 4
    for (let col = numCols - 1; col > 3; col--) {
      // handle row 0
      if (row === 0) {
        // handle row 0, cols 5-14
        if (col > 4) {
          if (
            board[row][col] === player &&
            board[row + 1][col - 1] === player &&
            board[row + 2][col - 2] === player &&
            board[row + 3][col - 3] === player &&
            board[row + 4][col - 4] === player &&
            board[row + 5][col - 5] !== player
          ) {
            return true;
          }
        } else if (col === 4) {
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

        continue;
      } else if (col === numCols - 1) {
        if (row < 14) {
          if (
            board[row][col] === player &&
            board[row + 1][col - 1] === player &&
            board[row + 2][col - 2] === player &&
            board[row + 3][col - 3] === player &&
            board[row + 4][col - 4] === player &&
            board[row + 5][col - 5] !== player
          ) {
            return true;
          }
        } else if (row === 14) {
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

        continue;
      } else {
        if (row === 14 || col === 4) {
          if (
            board[row][col] === player &&
            board[row + 1][col - 1] === player &&
            board[row + 2][col - 2] === player &&
            board[row + 3][col - 3] === player &&
            board[row + 4][col - 4] === player &&
            board[row - 1][col + 1] !== player
          ) {
            return true;
          }
          continue;

          // check for upDiag that ends right at the right wall
        }
        if (
          board[row][col] === player &&
          board[row + 1][col - 1] === player &&
          board[row + 2][col - 2] === player &&
          board[row + 3][col - 3] === player &&
          board[row + 4][col - 4] === player &&
          board[row + 5][col - 5] !== player &&
          board[row - 1][col + 1] !== player
        ) {
          return true;
        }
        continue;
      }
    }
  }
  return false;
};

// umbrella checkwin func - wraps all directional checks
const checkWin = (board, player) => {
  if (checkHorizontal(board, player)) return true;
  if (checkVertical(board, player)) return true;
  if (checkDownDiag(board, player)) return true;
  if (checkUpDiag(board, player)) return true;

  // No five-in-a-row win or there exists invalid # of pieces in a row for a win (6+)
  return false;
};

const checkForWinner = (board, piece) => {
  // win
  if (checkWin(board, piece)) {
    return 1;
  }
  // tie
  else if (board.every((row) => row.every((cell) => cell !== 0))) {
    return 2;
  }

  // continue playing
  return 0;
};

const checkForDoubleThree = (board, piece) => {
  return;
};

const directions = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]; // [ right, down, up-right diag, down-left diag]

// function to check that each space is valid and empty
const isValidAndEmpty = (x, y, playerPiece) => {
  if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
    return false;
  }
  return board[x][y] === playerPiece || board[x][y] === 0;
};

// function to check how many pieces in a row from a given position
const countPieces = (x, y, dx, dy, playerPiece) => {
  let count = 0;
  while (isValidAndEmpty(x, y, playerPiece)) {
    if (board[x][y] === playerPiece) {
      count++;
    }
    x += dx;
    y += dy;
  }
  return count;
};

// function to check if a move creates a 'double three' situation
const isDoubleThree = (x, y, playerPiece) => {
  let threesCount = 0;
  for (let [dx, dy] of directions) {
    // important part! -> check both sides of spot (curr direction and opposite direction)
    let count1 = countPieces(x - dx, y - dy, -dx, -dy, playerPiece);
    let count2 = countPieces(x + dx, y + dy, dx, dy, playerPiece);

    // if total count is 3 -> then there is at least a line of three
    if (count1 + count2 === 3) {
      threesCount++;
    }
  }
  return threesCount >= 2;
};

export {
  updateBoard,
  copyBoard,
  resetBoard,
  getPlayerTurn,
  updatePlayerTurn,
  checkForWinner,
};

const gameService = {
  updateBoard,
  copyBoard,
  resetBoard,
  getPlayerTurn,
  updatePlayerTurn,
  checkForWinner,
};

export default gameService;
