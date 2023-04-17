import React from 'react';
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from 'react';
import Cell from '../components/Cell';
import Message from '../components/Label';
import checkWin from './winningLogic';


interface GridProps {
  numRows: number;
  numCols: number;
}


// Grid html skeleton
const Grid = ({ numRows, numCols }: GridProps) => {

const [api_board, setApiBoard] = useState([]); 

// asyncronously fetch data - Works!!! 
const loadBoard = async () => {

  // use utility and awesome fetch api to get data 
  const response = await fetch('http://localhost:8000/board');

  // conv to json - don't forget await since promise
  const response_data = await response.json();

  // fill state board using fetched data 
  setApiBoard(response_data);
}

const placePiece = async (playerPiece: number, rowIndex: number, colIndex: number) => {
  try {
  const response = await fetch('http://localhost:8000/piece', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({player: playerPiece, x: rowIndex, y: colIndex}),
  });

    const result = await response.json();
    console.log("Success: Response is ", result); 
   //   setApiBoard(updatedBoard);
  } catch (error) {
    console.log("Error is: ", error); 
  }
  
  };



/*

// annoying way to console log
useEffect(() => {
  console.log("api board", api_board);
  loadBoard();
}, [api_board]);

*/

  // create a board state to pass as parameter later into
  const [board, setBoard] = useState<string[][]>(
    Array(numRows)
      .fill(null)
      .map(() => Array(numCols).fill(''))
  );

  // create player turn state 
  const [p1Turn, setP1Turn] = useState<boolean>(true);

  let player = '';

  // reset board
  const resetBoard = () => {

    setBoard(
      Array(numRows)
        .fill(null)
        .map(() => Array(numCols).fill(''))
    );
  }

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
      <Message message="This is label message"/>
      <table className={styles.grid}>
        <tbody>{rows}</tbody>
      </table>

      {/* remove later...client cannot reset board - just there for testing purposes */}
      <button onClick={() => resetBoard()}>Clear board</button>

      <div>
      <button onClick={() => placePiece(2, 0, 5)}>Post piece to board api</button>
      </div>
    </div>
  );
};

export default Grid;