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

    try {
      const playerTurn = req.body.playerTurn;
      const board = req.body.board;
      const id = req.body.id;

      const docRef = db.collection("games").doc(id);

      // turn firebase board into 2-d board
      const convertedBoard = convertToObjectArray(board);
      console.log("convertedBoard in place-piece is: ", convertedBoard);

      const result = gameService.checkForWinner(
        convertedBoard,
        playerTurn
      );

      // Fetch the updated document
      const updatedDoc = await docRef.get();

      // Check if the document exists
      if (!updatedDoc.exists) {
        throw new Error("Document not found after updating!");
      }
      // Convert the document data into GameData format
      const gameData: GameData = {
        id: updatedDoc.id,
        ...(updatedDoc.data() as any),
      };

      switch (result) {
        // win
        case 1:
          console.log(`Player ${playerTurn} has won`);

          // set isOngoing to false
          // create and set winner variable? prob not.. just declare winner at point of win 

          await docRef.update({
            playerTurn: playerTurn === 1 ? 2 : 1,
          });

          return res.status(200).json({
            game: gameData,
            message: `Player ${playerTurn} has won`,
            winner: playerTurn,
            isWon: 0,
          });

        // tie - do nothing
        case 2:
          console.log('Tie, no winner...start a new game');

          return res.status(200).json({
            game: gameData,
            message: 'Tie, no winner...start a new game',
            winner: playerTurn,
            isWon: 0,
          });

        // double three
        case 3:
          console.log("[POST] - double three. Go again.");
          return res.json({
            game: gameData,
            message: "Invalid move - double 3. Go again.",
            alreadyTaken: 0,
            isDoubleThree: 1,
          });

        default:
          console.log("Failure updating board - Invalid move!");
          return res.status(400).json({
            game: gameData,
            message: "error in updateBoard() of POST",
          });
      }
    } catch (error) {
      console.error("There was an error updating the document: ", error);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
