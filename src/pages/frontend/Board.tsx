import React from "react";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import Cell from "../components/Cell";
import Message from "../components/Label";
import mushroom from "../../../public/mushroom.png";
import slime from "../../../public/slime.png";
import Image from "next/image";

// Grid skeleton
const Grid = () => {
  const BOARD_LEN = 19; // 19x19

  // define the URLs for each player's piece
  const player1Piece = mushroom;
  const player2Piece = slime;

  // useState() aside: useState functions are async [do not block execution of code - doesn't wait for func to finish before moving onto next line of code]
  const [client_omok_board, setClientBoard] = useState<string[][]>(
    Array(BOARD_LEN)
      .fill("")
      .map(() => Array(BOARD_LEN).fill(""))
  );

  // label state
  const [text, setText] = useState("Player 1's Turn!");

  // player turn state to have label sync up with passing turn in the backend
  const [playerTurn, setPlayerTurn] = useState<number>(1);

  const [gameEnded, setGameEnded] = useState<boolean>(false);

  // asyncronously fetch board and update client-side board - works ...
  const loadBoardFromBackend = async () => {
    // use utility and awesome fetch api to get data
    const response = await fetch("http://localhost:8000/board");

    // conv to json - don't forget await since promise
    const response_data = await response.json();

    // *************************** WORKING HERE ************************************

    // map over the response data and replace the numbers with the corresponding asset URLs
    const client_board_with_assets = response_data.map((row: any[]) =>
      row.map((cellValue) => {
        if (cellValue === 1) {
          return player1Piece;
        } else if (cellValue === 2) {
          return player2Piece;
        } else {
          return " "; // empty cell
        }
      })
    );

    // Convert the 2-d array of objects board to an array of strings (URLS to set state)
    const client_board_with_strings = client_board_with_assets.map((row: any) =>
      row.map((asset: any) => asset.src)
    );

    // fill state board using fetched, converted data
    setClientBoard(client_board_with_strings);

    return;
  };

  // async check win after each turn
  const checkWinInBackend = async () => {
    const response = await fetch("http://localhost:8000/board/checkwin");

    console.log("[checkWinInBackend] entered.");

    const response_data = await response.json();
    console.log(
      "[checkWinInBackend] - The response data is the following: ",
      response_data
    );

    // winner found
    if (response_data.isWon === 0) {
      console.log("Player ", response_data.winner, "has won.");
      console.log(response_data.message);
      //gameEnded = true;
      const winner = response_data.winner;
      setText(`Player ${winner} has won!`);
      setGameEnded(true);
      // resetBoard();
    }

    // tie game
    else if (response_data.isWon === 2) {
      console.log("Tie game. No winner.");
      console.log(response_data.message);

      setText("Tie Game!! No winner!");
      resetBoard();
    }

    // no winner --> change player turn label
    else if (response_data.isWon === 1) {
      const nextTurn = response_data.nextplayer;
      setText(`Player ${nextTurn}'s turn!`);
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

      /* DON'T NEED TO USE RESPONSE - ignore */
      const response_data = await response.json();

      // space is already taken
      if (response_data.alreadyTaken === 1) return;

      // double three
      if (response_data.isDoubleThree === 1) {
        console.log("Invalid move! - double 3. Go again.");
        return;
      }
      await loadBoardFromBackend();
      await checkWinInBackend();

      /* // BETTER, WORKING USING .THEN AND CALLBACK FUNCTION than above
      response.json().then((result) => {
        setClientBoard(result.board);
        console.log("result.board is ", client_omok_board);
      });
      */
    } catch (error) {
      console.log("Error is: ", error);
    }

    return;
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

      playerTurn === 1
        ? (setText("Player 2's Turn!"), setPlayerTurn(2))
        : (setText("Player 1's Turn!"), setPlayerTurn(1));
      setGameEnded(false);
    } catch (error) {
      console.log("[Error] during resetBoard() PUT request");
    }

    return;
  };

  // handle each player's piece in Grid
  const handleClick = async (rowIndex: number, colIndex: number) => {
    if (gameEnded === false) await placePieceIntoBackend(rowIndex, colIndex);

    // moved loadBoard() and checkWin() inside of placePiece() to return from original call when spot is already taken
    //  await loadBoardFromBackend();
    //  await checkWinInBackend();

    return;
  };

  // updates board every 2 seconds -> emulate real-time effect
  useEffect(() => {
    const interval = setInterval(() => {
      loadBoardFromBackend();
    }, 2000);

    // Clean up interval on unmount
    return () => {
      console.log("Grid is unmounting...");
      clearInterval(interval);
    };
  }, []); // Empty array indicates that this effect does not depend on any values and will not re-run

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.player1label}>
          <div className={styles.leftlabel}>Player 1</div>
          <div>
            <Image src={mushroom} alt="Mushroom Image" />
          </div>
        </div>

        <div className={styles.labelandtable}>
          <div className={styles.messagelabel}>
            <Message message={text} />
          </div>
          <div>
            <button className={styles.resetbutton} onClick={() => resetBoard()}>
              Reset
            </button>
          </div>
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
        </div>

        <div className={styles.player2label}>
          <div className={styles.rightlabel}>Player 2</div>
          <div>
            <Image src={slime} alt="Slime Image" />
          </div>
        </div>
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
