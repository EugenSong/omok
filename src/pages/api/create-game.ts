import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import gameService from "../backend/game-service.js";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

type Data = {
  message: string;
};

// Initialize Firebase
admin.initializeApp({
  //@ts-ignore
  credential: admin.credential.cert(serviceAccount),
});
// Initialize Cloud Firestore and get a reference to the service
const db = admin.firestore();

const generateUUID = () => {
  return uuidv4(); // ⇨ ex) '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
};

// func to create a board object to store in firebase (firebase does not support nested arrays)
const createBoardObject = (board: number[][], BOARD_LEN: number) => {
  const object: Record<string, number> = {};

  // quick and simple  algo to construct object from 2-d array
  // loop both arrays -> create key -> store original value into new object's hashmap
  for (let i = 0; i < BOARD_LEN; i++) {
    for (let j = 0; j < BOARD_LEN; j++) {
      const key = `${i}-${j}`;
      object[key] = board[i][j];
    }
  }
  return object;
};

const boardObject = createBoardObject(gameService.board, gameService.BOARD_LEN);

const createGame = async () => {
  try {
    // assign game unique id
    const uuid = generateUUID();

    // add a single game (document) in 'games' collection ... so far just adds the first game with no player / move
    const newGameRef = db.collection("games").doc();

    await newGameRef.set({
      board_uid: uuid,
      board: boardObject,
      isOngoing: true,
    });

    console.log("Document written with ID: ", newGameRef.id);
    console.log("board-object is: ", newGameRef);
    return;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    await createGame();
    res.status(200).json({ message: "John Doe" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}
