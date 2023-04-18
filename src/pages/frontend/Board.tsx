import React from 'react';
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from 'react';
import Cell from '../components/Cell';
import Message from '../components/Label';
import checkWin from './winningLogic';


// Grid skeleton
const Grid = () => {

    const BOARD_LEN = 19 // 19x19

    // client-side omok board 
    const [client_omok_board, setClientBoard] = useState<number[][]>(Array(BOARD_LEN).fill(0).map(() => Array(BOARD_LEN).fill(0))); 

    // asyncronously fetch board - works ... use each time I grab the updated board 
    const loadBoardFromBackend = async () => {

      // use utility and awesome fetch api to get data 
      const response = await fetch('http://localhost:8000/board');

      // conv to json - don't forget await since promise
      const response_data = await response.json();

      // fill state board using fetched data 
      setClientBoard(response_data);
    };

    // async place piece - works ... took out playerPiece:number param since it exists in backend
    const placePieceIntoBackend = async (rowIndex: number, colIndex: number) => {
      try {
      const response = await fetch('http://localhost:8000/piece', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({x: rowIndex, y: colIndex}),
      });

        const result = await response.json();
      // console.log("Success: Response is ", result); 
      // console.log("result.board is ", result.board);

        // have to directly set result.board - do not create a var for it
        setClientBoard(result.board);
        console.log(client_omok_board);

      } catch (error) {
        console.log("Error is: ", error); 
      }
    };

    // reset board in the backend 
    const resetBoard = async () => {
    try {
      const response = await fetch('http://localhost:8000/board/reset', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();
      setClientBoard(result.board);
      console.log(client_omok_board);


    } catch (error) {
      console.log("[Error] during resetBoard() PUT request");
    }
    };

   // create player turn state 
   const [playerTurn, setPlayerTurn] = useState<number>(1);

  // handle each player's piece in Grid
  const handleClick = async (rowIndex: number, colIndex: number) => {
    placePieceIntoBackend(rowIndex, colIndex);

    // switch player turns in the frontend - use as label
    if (playerTurn === 1) setPlayerTurn(2);
    else if (playerTurn === 2) setPlayerTurn(1);
    
   
      // after piece placed in the backend, check if a win after updating frontend board
      if (checkWin(client_omok_board, 1)) {
        alert('Player 1 wins!');
        setClientBoard(  // resets frontend board
          Array(BOARD_LEN)
            .fill(0)
            .map(() => Array(BOARD_LEN).fill(0))
        );
        resetBoard(); // resets backend board
        setPlayerTurn(1);

      } else if (checkWin(client_omok_board, 2)) {
        alert('Player 2 wins!');
        setClientBoard(
          Array(BOARD_LEN)
            .fill(0)
            .map(() => Array(BOARD_LEN).fill(0))
        );
        resetBoard();
        setPlayerTurn(1);

      } else if (
        client_omok_board.every((row) => row.every((cell) => cell !== 0))
      ) {
        alert('Tie game!');
        setClientBoard(
          Array(BOARD_LEN)
            .fill(0)
            .map(() => Array(BOARD_LEN).fill(0))
        );
        resetBoard();
        setPlayerTurn(1);
      }
     
  };
  

  const renderRow = (rowIndex: number) => {
    const cells = [];
    for (let colIndex = 0; colIndex < BOARD_LEN; colIndex++) {
      cells.push(
        <Cell
          key={`${rowIndex}-${colIndex}`}
          rowIndex={rowIndex}
          colIndex={colIndex}
          value={client_omok_board[rowIndex][colIndex]}
          onClick={() => handleClick(rowIndex, colIndex)} // handleClick() should include placePiece() in body
        />
      );
    }
    return <tr key={rowIndex}>{cells}</tr>;
  };

  // fill each outer array with html row
  const rows = []; 
  for (let rowIndex = 0; rowIndex < BOARD_LEN; rowIndex++) {
    rows.push(renderRow(rowIndex));
  };

  return (
    <div>
      <Message message="This is label message"/>
      <table className={styles.grid}>
        <tbody>{rows}</tbody>
      </table>

      {/* remove later...client cannot reset board - just there for testing purposes */}
      <button onClick={() => resetBoard()}>Clear board</button>

      {/* Remove later... testing purposes */}
      <div>
      <button onClick={() => placePieceIntoBackend(0, 4)}>Post piece to board api</button>
      </div>

      <div>
      <button onClick={() => loadBoardFromBackend()}>Load backend board</button>
      </div>
    </div>
  );
};

export default Grid;