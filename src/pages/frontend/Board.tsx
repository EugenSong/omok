import React from 'react';
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from 'react';

import Cell from '../components/Cell';


interface GridProps {
  numRows: number;
  numCols: number;
}

interface LabelProps {
  message: string;

}

// check if player win after each placed piece
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




const Label = ( { message }: LabelProps) => {
  return (
    <p>{message}</p>
  )
}

// Grid html skeleton
const Grid = ({ numRows, numCols }: GridProps) => {

const [api_board, setApiBoard] = useState([]); 

useEffect(() => {
  console.log(api_board);
}, [api_board]);

const loadBoard = async () => {

  // use utility and awesome fetch() to receive data 
  const response = await fetch('http://localhost:8000/board');

  // conv to json - don't forget await since promise
  const response_data = await response.json();

  // fill state board using fetched data 
  setApiBoard(response_data);

}

loadBoard();


  // create a board state to pass as parameter later into
  const [board, setBoard] = useState<string[][]>(
    Array(numRows)
      .fill(null)
      .map(() => Array(numCols).fill(''))
  );

  // create player turn state 
  const [p1Turn, setP1Turn] = useState<boolean>(true);

  let player = '';

  // handle each player's piece in Grid
  const handleClick = (rowIndex: number, colIndex: number) => {
    if (board[rowIndex][colIndex] === '') {

      // create temp copy board
      const newBoard = [...board];
      newBoard[rowIndex][colIndex] = p1Turn ? 'X' : 'O';

      // set real board === temp board
      setBoard(newBoard);
      setP1Turn(!p1Turn);

      if (p1Turn) {
        player = 'X'
      } else {
        player = 'O'
      }

      // after each placement, check if a win
      if (checkWin(newBoard, 'X')) {
        alert('Player X wins!');
        setBoard(
          Array(numRows)
            .fill(null)
            .map(() => Array(numCols).fill(''))
        );
        setP1Turn(true);
      } else if (checkWin(newBoard, 'O')) {
        alert('Player O wins!');
        setBoard(
          Array(numRows)
            .fill(null)
            .map(() => Array(numCols).fill(''))
        );
        setP1Turn(true);
      } else if (
        newBoard.every((row) => row.every((cell) => cell !== ''))
      ) {
        alert('Tie game!');
        setBoard(
          Array(numRows)
            .fill(null)
            .map(() => Array(numCols).fill(''))
        );
        setP1Turn(true);
      }
    }
  };

  const renderRow = (rowIndex: number) => {
    const cells = [];
    for (let colIndex = 0; colIndex < numCols; colIndex++) {
      cells.push(
        <Cell
          key={`${rowIndex}-${colIndex}`}
          rowIndex={rowIndex}
          colIndex={colIndex}
          value={board[rowIndex][colIndex]}
          onClick={() => handleClick(rowIndex, colIndex)}
        />
      );
    }
    return <tr key={rowIndex}>{cells}</tr>;
  };

  // fill each outer array with html row
  const rows = [];
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    rows.push(renderRow(rowIndex));
  }

  return (
    <div>
      <Label message="This is label message"/>
      <table className={styles.grid}>
        <tbody>{rows}</tbody>
      </table>

      {/* how to set parameters and create a clear button */}
      <button onClick={() => setBoard(
          Array(numRows)
            .fill(null)
            .map(() => Array(numCols).fill(''))
        )}>Clear board</button>
    </div>
  );
};

export default Grid;