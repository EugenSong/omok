import React from "react";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import Cell from "../components/Cell";
import Message from "../components/Label";

// Grid skeleton
const Grid = () => {
  const BOARD_LEN = 19; // 19x19

  // useState() aside: useState functions are async [do not block execution of code - doesn't wait for func to finish before moving onto next line of code]
  const [client_omok_board, setClientBoard] = useState<number[][]>(
    Array(BOARD_LEN)
      .fill(0)
      .map(() => Array(BOARD_LEN).fill(0))
  );

  // label state
  const [text, setText] = useState("Initial label");

  // create player turn state --> later on need to figure out a way to not start w/ player 1
  const [playerTurn, setPlayerTurn] = useState<number>(1);

  let gameEnded = false;

  // asyncronously fetch board and update client-side board - works ...
  const loadBoardFromBackend = async () => {
    // use utility and awesome fetch api to get data
    const response = await fetch("http://localhost:8000/board");

    // conv to json - don't forget await since promise
    const response_data = await response.json();

    // fill state board using fetched data
    setClientBoard(response_data);
  };

  // async check win after each turn
  const checkWinInBackend = async () => {
    const response = await fetch("http://localhost:8000/board/checkwin");

    console.log("response is ", response);

    console.log("fetch happened in checkWin");

    const response_data = await response.json();

    console.log("The response data is the following: ", response_data);

    // winner found
    if (response_data.isWon === 0) {
      console.log("Player ", response_data.winner, "has won.");
      console.log(response_data.message);
      //gameEnded = true;
      resetBoard();
    }

    // tie game
    else if (response_data.isWon === 2) {
      console.log("Tie game. No winner.");
      console.log(response_data.message);
      resetBoard();
    }
    return;
  };

  // async place piece - works ... took out playerPiece:number param since it exists in backend
  const placePieceIntoBackend = async (rowIndex: number, colIndex: number) => {
    try {
      console.log("rowIndex in placePieceIntoBackend is: ", rowIndex);
      console.log("colIndex in placePieceIntoBackend is: ", colIndex);

      const response = await fetch("http://localhost:8000/piece", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ x: rowIndex, y: colIndex }),
      });

      console.log("made it past fetch @ /piece");

      /* DON'T NEED TO USE RESPONSE - ignore */
      const response_data = await response.json();

      // space is already taken
      if (response_data.alreadyTaken === 1) return;

      console.log("right before loadBoardFromBackend()");

      await loadBoardFromBackend();

      console.log("made it past loadBoard()");
      await checkWinInBackend();

      console.log("made it past checkWininbackend()");

      /* // BETTER, WORKING USING .THEN AND CALLBACK FUNCTION than above
      response.json().then((result) => {
        setClientBoard(result.board);
        console.log("result.board is ", client_omok_board);
      });
      */
    } catch (error) {
      console.log("Error is: ", error);
    }
  };

  // resets omok board and player turn in backend and resets board in frontend
  const resetBoard = async () => {
    try {
      const response = await fetch("http://localhost:8000/board/reset", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      await loadBoardFromBackend();
    } catch (error) {
      console.log("[Error] during resetBoard() PUT request");
    }
  };

  // handle each player's piece in Grid
  const handleClick = async (rowIndex: number, colIndex: number) => {
    await placePieceIntoBackend(rowIndex, colIndex);

    // moved loadBoard() and checkWin() inside of placePiece() to return from original call when spot is already taken
    //  await loadBoardFromBackend();
    //  await checkWinInBackend();
  };

  return (
    <div>
      <Message message={text} />
      <table className={styles.grid}>
        <tbody>
          {client_omok_board.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cellValue, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  value={cellValue}
                  onClick={() => handleClick(rowIndex, colIndex)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => resetBoard()}>Clear board</button>
      </div>
    </div>
  );
};

export default Grid;

/*  ***** Aside on useEffect() hook *******
    // need to have a useEffect() to console.log(omok-board) b/c loadBoardFromBackend() is async call so the state might be updated by the time I call console.log(omok-board) right after it to see the changes
    useEffect(() => {
      console.log(client_omok_board);
    }, [client_omok_board]);

  
    ***** Aside on async functions and when synchronous executions run in respect to them
await placePieceIntoBackend(rowIndex, colIndex);
    // the below if-else occurs BEFORE this `await placePieceIntoBackend` b/c this async func is non-blocking. However, any code that is dependent on the completion of placePieceIntoBackend should be placed within the then block or executed after the await keyword.
    // LOOK into `then` blocks -> crucial to get code running that depends on async func, placePieceIntoBackend()

    if {}
    else {}

    */
