import React from 'react';
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from 'react';
import Cell from '../components/Cell';
import Message from '../components/Label';
import checkWin from './winningLogic';


// Grid skeleton
const Grid = () => {

    const BOARD_LEN = 19 // 19x19

    // *** CLIENT-SIDE omok board state
    // useState() aside: useState functions are async [do not block execution of code - doesn't wait for func to finish before moving onto next line of code] 
    const [client_omok_board, setClientBoard] = useState<number[][]>(Array(BOARD_LEN).fill(0).map(() => Array(BOARD_LEN).fill(0))); 

    // label state
    const [text, setText] = useState('Initial label');

    // asyncronously fetch board and update client-side board - works ...
    const loadBoardFromBackend = async () => {

      // use utility and awesome fetch api to get data 
      const response = await fetch('http://localhost:8000/board');

      // conv to json - don't forget await since promise
      const response_data = await response.json();
      
      // fill state board using fetched data 
      setClientBoard(response_data);
      
    };

    // useState to keep track of whether the game has ended or not
    const [gameEnded, setGameEnded] = useState(false); 

    // useEffect hook to run code after client_omok_board state has changed -> run checkWin() after state change
    // can also use a callback function
    useEffect(() => {

      if (checkWin(client_omok_board, 1)) {
        if (!gameEnded) {
        alert("Player 1 Wins!");
        setGameEnded(true); // asynchronous
        resetBoard();
        }
        //setText("Player 1 Wins!");
        //resetBoard(); // resets backend board
        //loadBoardFromBackend();
    
      } else if (checkWin(client_omok_board, 2)) {
        alert("Player 2 Wins!");
        setGameEnded(true); // asynchronous
        resetBoard();
        //setText("Player 2 Wins!");
        //resetBoard();
        //loadBoardFromBackend();

      } else if (
        client_omok_board.every((row) => row.every((cell) => cell !== 0))
      ) {
        //setText("Tie Game!");
        alert('Tie game!');
        //resetBoard();
        //loadBoardFromBackend();
    }
    }, [client_omok_board]);

    

    /*
    // need to have a useEffect() to console.log(omok-board) b/c loadBoardFromBackend() is async call so the state might be updated by the time I call console.log(omok-board) right after it to see the changes
    useEffect(() => {
      console.log(client_omok_board);
    }, [client_omok_board]);

    */

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

      /* DON'T NEED TO USE RESPONSE - ignore 
    //    const result = await response.json();
    // BETTER, WORKING USING .THEN AND CALLBACK FUNCTION than above
      response.json().then((result) => {
        setClientBoard(result.board);
        console.log("result.board is ", client_omok_board);
      });
      */
      await loadBoardFromBackend();

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
      await loadBoardFromBackend();
    } catch (error) {
      console.log("[Error] during resetBoard() PUT request");
    }
    };

   // create player turn state --> later on need to figure out a way to not start w/ player 1
   const [playerTurn, setPlayerTurn] = useState<number>(1);

  // handle each player's piece in Grid
  const handleClick = async (rowIndex: number, colIndex: number) => {
    await placePieceIntoBackend(rowIndex, colIndex);
    // the below if-else occurs BEFORE this `await placePieceIntoBackend` b/c this async func is non-blocking. However, any code that is dependent on the completion of placePieceIntoBackend should be placed within the then block or executed after the await keyword.
    // LOOK into `then` blocks -> crucial to get code running that depends on async func, placePieceIntoBackend()

    // switch player turns in the frontend - use as label
    if (playerTurn === 1) setPlayerTurn(2);
    else if (playerTurn === 2) setPlayerTurn(1);
  
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
      <Message message= {text} />
      <table className={styles.grid}>
        <tbody>{rows}</tbody>
      </table>

      {/* remove later...client cannot reset board - just there for testing purposes */}
      <div>
      <button onClick={() => resetBoard()}>Clear board</button>
      </div>

    </div>
  );
};

export default Grid;