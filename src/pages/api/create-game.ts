import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import gameService from "../backend/game-service.js";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

type Data = {
  message?: string;
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

const createGame = async (user: any) => {
  try {
    // assign game unique id
    const uuid = generateUUID();

    // add a single game (document) in 'games' collection ... so far just adds the first game with no player / move
    const newGameRef = db.collection("games").doc();

    await newGameRef.set({
      board_uid: uuid,
      board: boardObject,
      isOngoing: true,
      user: user, // If you need to save the user information with the game
    });

    console.log("Document written with ID: ", newGameRef.id);
    console.log("board-object is: ", newGameRef);
    return;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const searchForOpenGame = async () => {
  try {
    const gamesRef = db.collection("games");
    const snapshot = await gamesRef.get();
    console.log("Firestore snapshot:", snapshot); // Log the Firestore snapshot

    for (let doc of snapshot.docs) {
      let game = doc.data();

      let userData = JSON.parse(game.user);

      console.log("Game is ", game);
      console.log("game.user.email is ", userData.email);

      if (!userData.isOngoing || userData.email === "maplestory@gmail.com") {
        console.log("returning from searchForOpenGame");
        return game; // Return the found game
      }
    }
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      // first search for existing game with notOngoing (FIX LATER for OPP COND) or for already existing email in game
      const game = await searchForOpenGame();
      if (game) {
        console.log("Game found: ", game);
        res.status(200).json({ message: "A Game already exists." });
      } else {
        console.log("No game found");
        // Extract the user from the request body
        const { user } = req.body;
        await createGame(user);
        res.status(200).json({ message: "A new Game was created." });
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    // Optionally handle other HTTP methods, or send a response that the method is not allowed
    res.status(405).json({ error: { message: "Method not allowed" } });
  }
}
