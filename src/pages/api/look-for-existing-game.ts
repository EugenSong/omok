import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

type Data = {
  message?: string;
  error?: {
    message: string;
    code?: number;
  };
  game?: GameData; // Include a field for the game object
};

interface GameData {
  id?: string;
  board?: Map<number, number[]>;
  board_uid?: string;
  isOngoing?: boolean;
  player1?: string;
  player2?: string;
  playerTurn?: 1;
  // ...any other fields from the document...
}

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

const searchForExistingGame = async (currentUserEmail: any) => {
  try {
    const gamesRef = db.collection("games");

    // Query for games where player1 is the user
    const player1Snapshot = await gamesRef
      .where("isOngoing", "==", true)
      .where("player1", "==", currentUserEmail)
      .get();

    // Query for games where player2 is the user
    const player2Snapshot = await gamesRef
      .where("isOngoing", "==", true)
      .where("player2", "==", currentUserEmail)
      .get();

    // Merge the results of the two queries
    const allDocs = [...player1Snapshot.docs, ...player2Snapshot.docs];

    // Process the merged results (assuming you only want the first matching game)
    for (let doc of allDocs) {
      return { ...doc.data(), id: doc.id }; // Return the found game and its id
    }

    // If no game found, return null or something similar
    return null;
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

      // turn json string into an js object using JSON.parse to access fields
      let body = req.body;

      let email = body.user;

      console.log("req.body [user] is", body);
      console.log("currentUserEmail in the handler is ", email);
      const game = await searchForExistingGame(email);
      if (game) {
        console.log("Game found: ", game);
        res.status(200).json({
          message: "An Existing Game exists. Joining the game...",
          game: game,
        });
      } else {
        console.log("No game found");
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    // Optionally handle other HTTP methods, or send a response that the method is not allowed
    res.status(405).json({ error: { message: "Method not allowed" } });
  }
}
