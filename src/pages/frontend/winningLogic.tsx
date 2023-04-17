

// check player win after each placed piece
const checkWin = (board: string[][], player: string): boolean => {
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
  

export default checkWin