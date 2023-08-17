import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };
import gameService from "../backend/game-service";

// Initialize Firebase
if (!admin.apps.length) {
  // need this to ensure multiple Firebase instances are not running
  admin.initializeApp({
    //@ts-ignore
    credential: admin.credential.cert(serviceAccount),
  });
}

// Initialize Cloud Firestore and get a reference to the service
const db = admin.firestore();

type Data = {
  message?: string;
  game?: GameData; // Add this line
  alreadyTaken?: number;
  isDoubleThree?: number;
  error?: {
    message: string;
    code?: number;
  };
  board?: number[][];
};

type GameData = {
  id: string;
  board_uid: string;
  board: Record<string, any>;
  isOngoing: boolean;
  player1: any;
  player2: string;
};

// Your validation function. You can adapt the existing validate() function for this.
const validate = (req: NextApiRequest): boolean => {
  // Check for the validity of the request. Return true if valid, else return false.
  // For now, as an example, I'm checking if x and y exist in the body.
  return (
    req.body &&
    typeof req.body.x === "number" &&
    typeof req.body.y === "number" &&
    typeof req.body.playerTurn === "number" &&
    typeof req.body.id === "string"
  );
};

const convertToObjectArray = (obj: Record<string, any>): number[][] => {
  return Object.keys(obj).map((key) => obj[key]);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    if (!validate(req)) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const xPos = req.body.x;
    const yPos = req.body.y;
    const playerTurn = req.body.playerTurn;
    const board = req.body.board;
    const id = req.body.id;

    // turn firebase board into 2-d board
    const convertedBoard = convertToObjectArray(board);
    console.log("convertedBoard in place-piece is: ", convertedBoard);

    let [updatedBoard, result] = gameService.updateBoard(
      playerTurn,
      xPos,
      yPos,
      convertedBoard
    );

    switch (result) {
      // forced block (4 -in a row) OR valid spot
      case 1:
        console.log("[POST] - the piece place is valid");
        return res.status(200).json({
          board: updatedBoard,
          message: "[POST] - the piece place is valid",
          alreadyTaken: 0,
          isDoubleThree: 0,
        });

      // do nothing
      case 2:
        console.log("[POST] - piece already exists. Do nothing.");
        return res.json({
          board: updatedBoard,
          message: "POST piece already exists. Do nothing.",
          alreadyTaken: 1,
          isDoubleThree: 0,
        });

        // double three
      case 3:
        console.log("[POST] - double three. Go again.");
        return res.json({
          board: updatedBoard,
          message: "Invalid move - double 3. Go again.",
          alreadyTaken: 0,
          isDoubleThree: 1,
        });

      default:
        console.log("Failure updating board - Invalid move!");
        return res
          .status(400)
          .json({
            board: updatedBoard,
            message: "error in updateBoard() of POST",
          });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
