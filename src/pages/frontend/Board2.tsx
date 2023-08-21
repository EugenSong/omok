import React from "react";
import styles from "@/styles/Home.module.css";
import { useState, useEffect, useRef } from "react";
import Cell from "../components/Cell";
import Message from "../components/Label";
import mushroom from "../../../public/mushroom.png";
import slime from "../../../public/slime.png";
import Image from "next/image";

// Board skeleton
const Board2 = () => {
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

  const [text, setText] = useState("Player 1's Turn!"); // label state
  // player turn state to have label sync up with passing turn in the backend
  const [playerTurn, setPlayerTurn] = useState<number>(1);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  // const [game, setGame] = useState(null); // state for curr game in localstorage
  const [game, setGameWithCallback] = useStateWithCallback(null); // this new game state wrapper replaced one above
  const [user, setUser] = useState(null); // state for curr user in localstorage

  // useEffect to track local storage "user" / existing "game" @ startup --> set as curr user and update board
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser); // JSON.parse() turns JSON object into Javascript object
      console.log("loggedInUser found - setting user as foundUser ", foundUser);
      setUser(foundUser);
    }
  }, []);

  // second useEffect to observe user for changes
  useEffect(() => {
    // game is already in DB and cached -> pull up the game
    const currentGameString = localStorage.getItem("game");
    const currentGame = JSON.parse(currentGameString as string); // Parsing the string to JSON to use values
    // JSON.parse(currentGameString as string) << TypeScript will recognize it as an any type.

    const currentUserString = localStorage.getItem("user");
    const currentUser = JSON.parse(currentUserString as string);
    console.log(
      "currentGame is the following before conditionals: ",
      currentGame
    );

    // case 1 - user but no local stored game (user is logged on but no existing game)
    if (currentUser && !currentGame) {
      console.log(
        "There IS a User but NO currentGame...waiting for User to perform an action."
      );
      return;
      // searchForGames() will go belong in a button for user to search for game or to initialize a new game and join it as p1
      // make join game button pop up ? or stay appeared

      // case 2 - user and locally stored game (user is logged on and is playing a game)
    } else if (currentUser && currentGame) {
      // track local storage "game" @ startup --> set as existing game and populate board with curr game

      console.log(
        "currentUser is the following in user && currentGame ",
        currentUser
      );
      console.log(
        "currentUser.email is the following in user && currentGame ",
        currentUser.email
      );
      console.log(
        "currentGame is the following in user && currentGame ",
        currentGame
      );
      console.log(
        "currentGame.board_uid is the following in user && currentGame ",
        currentGame.board_uid
      );

      const lookUpGame = async () => {
        // look for existing game in db
        const response = await fetch("/api/search-for-game-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: currentUser.email, // curr client user
            gameid: currentGame.board_uid, // game doc id
          }),
        });

        // Check if the response is ok (status code in the range 200-299)
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Parse the response body as JSON
        const data = await response.json();
        console.log("data in lookUpGame is: ", data.game);
        setGameWithCallback(data.game); 
      };

      lookUpGame();
    }
  }, [user]);

  const searchForGames = async () => {
    // Make a GET request to the API endpoint
    const response = await fetch("/api/find-all-games");
    // Check if the response is ok (status code in the range 200-299)
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // Parse the response body as JSON
    const data = await response.json();
    // no games exist in the database

    const loggedInUser = localStorage.getItem("user");

    if (!data.data.length) {
      try {
        // to have information about the logged-in user on the server-side, you'll have to send that information as part of the request >>> `body` param

        if (loggedInUser) {
          // Make a POST request to the API endpoint
          const response = await fetch("/api/create-first-new-game", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: loggedInUser }),
          });

          // Check if the response is ok (status code in the range 200-299)
          if (!response.ok) {
            throw new Error("Network response was not ok in searchForGames()");
          }

          // Parse the response body as JSON
          const data = await response.json();

          // Do something with the data
          console.log(
            "data in searchForGames() when 0 len and loggedInUser is ",
            data
          );

          // data.game is an object here
          console.log("data.game (has both msg and gameData) is: ", data.game);
          setGameWithCallback(data.game); // data.game is made using spread operator so I can just use data.game to store entire gameData
        } else {
          console.log(
            "there is no loggedInUser when searchForGames() is run...returning - doing nothing"
          );
          return;
        }
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      }
    } else {
      // there exists games in games db
      try {
        console.log("lookForOpenGame running");
        console.log("data is ", data); // object that holds array of games
        console.log("data.data is ", data.data); // actual array of games

        // iterate through all games to search for one that has a player in player1 field
        let index = 0;
        for (let game of data.data) {
          console.log("game.isOngoing is ", game.isOngoing);
          console.log("!game.isOngoing is ", !game.isOngoing);
          // if game is not ongoing OR there are already 2 players, skip game
          if (!game.isOngoing || (game.player1 && game.player2)) {
            index++;
            console.log(
              "!game.isOngoing passed OR (game.player1 && game.player2 passed.) This game is no longer played OR is currently occupied by 2 other players and will be skipped."
            );
            continue;
          }

          // // testing purposes ... delete later
          // if (game.player1) {
          //   console.log("game.player1 passed");
          //   console.log(
          //     `Game ${index} has a player in player1 field: ${game.player1}`
          //     // normal, common case --> insert curr player/client into player2 field
          //   );
          //   // returns the proper game uid for an open game
          //   console.log("the game_uid for this is ", game.board_uid);

          //   // retrieves the document id of game
          //   console.log("the document id of this game is", game.id);

          //   console.log("current user is", (user as any).email);
          // }

          // if player1 slot is filled and player2 isnt --> assign curr to player2 field
          else if (
            game.player1 &&
            game.player1 !== (user as any).email &&
            !game.player2
          ) {
            console.log(
              "game.player1 && !game.player2 passed... storing curr user into p2"
            );

            // set curr player / client as player2
            const response = await fetch("/api/add-curr-player-p2", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                documentId: game.id, // game doc id
                player2: (user as any).email, // curr client user
              }),
            });

            // Check if the response is ok (status code in the range 200-299)
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            // Parse the response body as JSON
            const data = await response.json();

            // Do something with the data
            console.log(
              "data in searchForGames() when len>0 and loggedInUser is ",
              data
            );

            // data.game is an object here
            console.log(
              "data.game (has both msg and gameData) is: ",
              data.game
            );
            setGameWithCallback(data.game); // retrieve entire gameData out of data since spread operator

            // Break search through games list to end search of games b/c found 1 to load
            break;
          } else {
            // create a new game and join player1 field ***** + update 'game' state to fresh game b/c all existing games are invalid
            console.log(
              "There are no open games...creating a new one and waiting for player to join..."
            );

            const response = await fetch("/api/create-first-new-game", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ user: loggedInUser }),
            });

            // Check if the response is ok (status code in the range 200-299)
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            // Parse the response body as JSON
            const data = await response.json();

            // Do something with the data
            console.log(
              "data in searchForGames() when 0 len and loggedInUser is ",
              data
            );

            // data.game is an object here
            console.log(
              "data.game (has both msg and gameData) is: ",
              data.game
            );
            setGameWithCallback(data.game); // data.game is made using spread operator so I can just use data.game to store entire gameData
          }
          index++; // remove references to index later on ... currently no use
        }
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      }
    }
  };

  // TASK **** observe and update client's omok board when 'game' state change *** finish this part too
  // asyncronously fetch board and update client-side board - works ...
  useEffect(() => {
    if (game !== null) {
      console.log("game in useEffect when game changes is...", game);

      // *** STRINGIFY GAME AND STORE IN LOCAL STORAGE in this useEffect so I don't have to repeat
      const game_string = JSON.stringify(game);
      console.log("game_string is: ", game_string);
      console.log("typeof game_string is: ", typeof game_string);
      localStorage.setItem("game", game_string);

      // TASK: **** update client_omok_board to the value of game.board *****

      console.log("game is in useEffect() :", game);

      console.log("game as any.board is: ", (game as any).board);
      const conv_number_board = convertToObject2DArray((game as any).board);

      // map over the response data and replace the numbers with the corresponding asset URLs
      const client_board_with_assets = conv_number_board.map((row: any[]) =>
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
      const client_board_with_strings = client_board_with_assets.map(
        (row: any) => row.map((asset: any) => asset.src)
      );

      // fill state board using fetched, converted data
      setClientBoard(client_board_with_strings);
    }
  }, [game]);

  const convertToObject2DArray = (obj: Record<string, any>): number[][] => {
    return Object.keys(obj).map((key) => obj[key]);
  };

  // DO NOT NEED loadBoardFromFirebaseBackend() b/c useEffect does the same / observes 'game' state... control game state from now on

  // // asyncronously fetch board and update client-side board - works ...
  // const loadBoardFromFirebaseBackend = async () => {
  // }

  // async check win after each turn
  const checkWinInBackend = async () => {
    console.log("[checkWinInBackend] entered.");

    // game is already in DB and cached -> pull up the game
    const currentGameString = localStorage.getItem("game");
    const currentGame = JSON.parse(currentGameString as string); // Parsing the string to JSON to use values

    console.log('currentGame in checkWin is: ', currentGame); 

    const response = await fetch("/api/check-win-in-backend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerTurn: currentGame.playerTurn,
        board: currentGame.board,
        id: currentGame.id,
      }),
    });

    // Check if the response is ok (status code in the range 200-299)
    if (!response.ok) {
      throw new Error("Network response was not ok in checkWinInBackend()");
    }

    const response_data = await response.json();
    console.log(
      "[checkWinInBackend] - The response data is the following: ",
      response_data
    );

    const winner = response_data.winner;

    // winner found
    if (response_data.isWon === 0) {
      console.log("Player ", winner, "has won.");
      console.log(response_data.message);
      setText(`Player ${winner} has won!`);
      setGameEnded(true);
      // resetBoard();
    }

    // tie game
    else if (response_data.isWon === 2) {
      console.log("Tie game. No winner.");
      console.log(response_data.message);
      setText("Tie Game!! No winner!");
      setGameEnded(true);
      // resetBoard();
    }

    // no winner --> change player turn label
    else if (response_data.isWon === 1) {
      const nextTurn = response_data.nextPlayerTurn;
      setText(`Player ${nextTurn}'s turn!`);
    }
    return;
  };

  // setState() wrapper function ... this is how useState is actually implemented in the background
  function useStateWithCallback<T>(
    initialValue: T
  ): [T, (newValue: T, callback?: (newState: T) => void) => void] {
    const [state, setState] = useState<T>(initialValue);
    const callbackRef = useRef<null | ((newState: T) => void)>(null);

    const setWithCallback = (newValue: T, callback?: (newState: T) => void) => {
      if (callback) {
        callbackRef.current = callback;
      }
      setState(newValue);
    };

    useEffect(() => {
      if (callbackRef.current) {
        callbackRef.current(state);
        callbackRef.current = null; // Clear out the callback after invoking it
      }
    }, [state]);

    return [state, setWithCallback];
  }

  // async place piece - works ... took out playerPiece:number param since it exists in backend
  const placePieceIntoBackend = async (rowIndex: number, colIndex: number) => {
    try {
      console.log("rowIndex in placePieceIntoBackend is: ", rowIndex);
      console.log("colIndex in placePieceIntoBackend is: ", colIndex);

      // game is already in DB and cached -> pull up the game
      const currentGameString = localStorage.getItem("game");
      const currentGame = JSON.parse(currentGameString as string); // Parsing the string to JSON to use values

      console.log("currentGame in placePieceIntoBackend is: ", currentGame);

      const response = await fetch("/api/place-piece", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          x: rowIndex,
          y: colIndex,
          playerTurn: currentGame.playerTurn,
          board: currentGame.board,
          id: currentGame.id,
        }),
      });

      const response_data = await response.json();

      // space is already taken
      if (
        response_data.alreadyTaken === 1 &&
        response_data.isDoubleThree === 0
      ) {
        const msg = response_data.message;
        console.log(msg);
        return;
      }

      // double three
      else if (
        response_data.alreadyTaken === 0 &&
        response_data.isDoubleThree === 1
      ) {
        const msg = response_data.message;
        console.log(msg);
        console.log("Invalid move! - double 3. Go again.");
        return;

        // valid spot
      } else if (
        response_data.alreadyTaken === 0 &&
        response_data.isDoubleThree === 0
      ) {
        const msg = response_data.message;
        console.log(msg);

        const updatedBoard = response_data.game;

        console.log("updatedBoard (response_data.game) in placePieceIntoBackend is :", updatedBoard);

        // >>> CURRENT PROBLEM <<< : The result is that the logic dependent on the new state can be unpredictable.
        // SOLUTION: setGame() with a Callback function attached --> allows the checkWinInBackend() to run AFTER the re-render of setGame()
        setGameWithCallback(updatedBoard, async () => {
          console.log('setGameWithCallback called in placePiece()with updatedBoard: ', updatedBoard); 
          await checkWinInBackend();
        });
      }

      /* // BETTER, WORKING USING .THEN AND CALLBACK FUNCTION than above
      response.json().then((result) => {
        setClientBoard(result.board);
        console.log("result.board is ", client_omok_board);
      });
      */
    } catch (error) {
      console.log("[placePieceInBackend ERROR] - Error is: ", error);
    }

    return;
  };

  // ** RESET BOARD functionality does not make sense to have... either playing a game or doing nothing or waiting
  // // resets omok board and player turn in backend and resets board in frontend
  // const resetBoard = async () => {
  // };

  // handle each player's piece in Grid
  const handleClick = async (rowIndex: number, colIndex: number) => {
    // game is already in DB and cached -> pull up the game
    const currentGameString = localStorage.getItem("game");
    const currentGame = JSON.parse(currentGameString as string); // Parsing the string to JSON to use values

    // how to parse json values
    console.log("currentGame is this in handleClick: ", currentGame);

    console.log("currentGame.game.isOngoing is: ", currentGame.isOngoing);

    console.log(
      "currentGame.game.player1 in handle click is: ",
      currentGame.player1
    );

    console.log(
      "currentGame.game.player2 in handle click is: ",
      currentGame.player2
    );

    if (currentGame.isOngoing && currentGame.player1 && currentGame.player2)
      await placePieceIntoBackend(rowIndex, colIndex);
    // moved loadBoard() and checkWin() inside of placePiece() to return from original call when spot is already taken
    //  await loadBoardFromBackend();
    //  await checkWinInBackend();
    // loadBoard --> now handled using setGame
    // checkWin() --> callback part of setGame
    else {
      console.log(
        "Error processing handleClick - no currentGame.game.isOngoing && currentGame.game.player1 && currentGame.game.player2"
      );
    }

    return;
  };

  // // updates board every 2 seconds -> emulate real-time effect
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadBoardFromFirebaseBackend();
  //   }, 2000);

  //   // Clean up interval on unmount
  //   return () => {
  //     console.log("Grid is unmounting...");
  //     clearInterval(interval);
  //   };
  // }, []); // Empty array indicates that this effect does not depend on any values and will not re-run

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
            {/* <button className={styles.resetbutton} onClick={() => resetBoard()}>
              Reset
            </button> */}
            <button
              className={styles.resetbutton}
              onClick={() => searchForGames()}
            >
              Search For A Game
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

export default Board2;

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
