import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

type GameData = {
  id: string;
  board_uid: string;
  board: Record<string, any>;
  isOngoing: boolean;
  player1: any;
  player2: string;
};

type Data = {
  message?: string;
  game?: GameData; // Add this line
  error?: {
    message: string;
    code?: number;
  };
};

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

const generateUUID = () => {
  return uuidv4(); // ⇨ ex) '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
};

// func to create a board object to store in firebase (firebase does not support nested arrays)
// stores a map of arrays (aka object of arrays)
const createBoardObject = (board: number[][]) => {
  return board.reduce((acc: Record<string, any>, curr, idx) => {
    acc[`${idx}`] = curr;
    return acc;
  }, {} as Record<string, any>);
};

const create2DArray = (rows: number, cols: number, defaultValue: number) => {
  return Array.from({ length: rows }).map(() =>
    Array.from({ length: cols }).fill(defaultValue)
  ) as number[][];
};

const createGame = async (user: any) => {
  try {
    const emptyboard = create2DArray(19, 19, 0);
    const boardObject = createBoardObject(emptyboard);

    // assign game unique id
    const uuid = generateUUID();

    // add a single game (document) in 'games' collection ... so far just adds the first game with no player / move
    const newGameRef = db.collection("games").doc();

    // create a user object out of user json
    let userObject = JSON.parse(user);

    const gameData = {
      board_uid: uuid,
      board: boardObject,
      isOngoing: true,
      player1: userObject.email, // If you need to save the user information with the game
      player2: "",
      playerTurn: 1,
    };

    // creates a game entry in Firebase
    await newGameRef.set(gameData);

    console.log("Document written with ID: ", newGameRef.id);
    // console.log("board-object is: ", newGameRef);

    // Return the game data, along with the newly generated document ID.
    return { ...gameData, id: newGameRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      // turn json string into an js object using JSON.parse to access fields
      let userData = JSON.parse(req.body.user);
      console.log("req.body [user] is", userData);
      console.log("currentUserEmail in the handler is ", userData.email);

      // Extract the user from the request body
      const { user } = req.body;
      const game = await createGame(user);
      res.status(200).json({ message: "A new Game was created.", game: game });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });

      // Optionally handle other HTTP methods, or send a response that the method is not allowed
      res.status(405).json({ error: { message: "Method not allowed" } });
    }
  }
}
