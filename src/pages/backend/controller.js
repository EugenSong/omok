import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import gameService from "./service.js";

// dotenv.config({ path: "src/pages/backend/.env" });

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json()); // Add this line to parse JSON data in the request body

app.use(cors({ origin: "*" })); // configure CORS to allow all origins, methods, and headers

// handle OPTIONS request that occurs orior to POST - due to CORS protocol
app.options("/piece", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// route method to get and return the new updated board
app.get("/board", (req, res) => {
  const board = gameService.copyBoard();
  res.setHeader("Content-Type", "application/json"); // good practice to manually set header since res.send() doesn't
  res.send(JSON.stringify(board)); // still gets sent as JSON w/o .setHeader()
  console.log("[GET] - fetched the backend board.");
  return;
});

// route method to check win after each piece is placed onto board
app.get("/board/checkwin", (req, res) => {
  const board = gameService.copyBoard();

  //console.log('current board from checkWin is: ', board);

  const turn = gameService.getPlayerTurn();

  //console.log('playerTurn in checkWin is: ', turn);

  let response = {}; // populate a response variable and send all at once

  // 1: player win ; 2: player tie ; 0: no win/tie
  if (gameService.checkForWinner(board, turn) === 1) {
    response = { winner: turn, message: "Player has won", isWon: 0 };
    console.log("[GET] - found winner.");
  } else if (gameService.checkForWinner(board, turn) === 2) {
    response = { winner: 0, message: "No winner. Game is a tie!", isWon: 2 };
    console.log("[GET] - tie, no winner.");
  } else {
    // if no win/tie, send next player's turn to frontend
    gameService.updatePlayerTurn(turn === 1 ? 2 : 1); // switch player turns
    response = { nextplayer: gameService.getPlayerTurn(), isWon: 1 };
    console.log("[GET] - no winner / no tie - continuing game.");
  }

  res.setHeader("Content-Type", "application/json");
  res.send(response);
  return;
});

// function to validate request-body-params
function validate(req, res) {
  if (req.body.x === null || typeof req.body.x !== "number") {
    res.sendStatus(400).json({
      Error: "Invalid request - req.body.x",
    });
    return 0;
  } else if (req.body.y === null || typeof req.body.y !== "number") {
    res.sendStatus(400).json({
      Error: "Invalid request - req.body.y",
    });
    return 0;
  }
  return 1;
}

app.options("/piece", cors()); // Set up pre-flight OPTIONS request handling

// route method to only update board with piece
app.post("/piece", (req, res) => {
  // console.log('req.body:', req.body); // add this line to debug

  if (validate(req, res)) {
    // check for null req body

    const xPos = req.body.x;
    const yPos = req.body.y;
    const playerTurn = gameService.getPlayerTurn();

    // update board with player piece
    if (gameService.updateBoard(playerTurn, xPos, yPos) === 1) {
      //console.log("POST - updateBoard worked in controller");

      // console.log(board);
      const board = gameService.copyBoard();
      res.status(200).json({ board });
    }
    // there's already a piece there - always send a response back for a request to avoid leaving it hanging
    else if (gameService.updateBoard(playerTurn, xPos, yPos) === 2) {
      res.send({
        message: "POST piece already exists. Do nothing.",
        alreadyTaken: 1,
      });
      console.log('[POST] - piece already exists. Do nothing.");');
      return;
    } else if (gameService.updateBoard(playerTurn, xPos, yPos) === 3) {
      res.send({
        message: "Invalid move - double 3. Go again.",
        isDoubleThree: 1,
      });
      console.log("[POST] - double three. Go again.");
      return;
    } else {
      console.log("Failure updating board - Invalid move!");
      res.status(400).json({ error: "error in updateBoard() of POST" });
    }
  } else {
    res.status(400).json({ error: "Invalid request parameters" });
  }
});

// route method to reset board - also resets player turn / gameEnded in service
app.put("/board/reset", (req, res) => {
  gameService.resetBoard();
  const board = gameService.copyBoard();
  console.log("[PUT] - board reset.");
  res.json({ board }); // alternative way to send as JSON using res.json() instead of res.send()
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
