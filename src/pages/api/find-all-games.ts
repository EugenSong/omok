import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../../backend/key.json" assert { type: "json" };

interface Game {
  board: Map<number, number[]>;
  board_uid: string;
  isOngoing: boolean;
  player1: string;
  player2: string;
  playerTurn: 1;
  // ...any other fields from the document...
}

interface GameWithID extends Game {
  id: string;
}

// Define the shape of your document --> data can take Array
type ApiResponse = {
  data?: Array<{ [key: string]: any }>;
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const gamesRef = db.collection("games");
      const snapshot = await gamesRef.get();

      // Initialize an array to hold the games
      let games: GameWithID[] = [];

      // Loop through each document in the snapshot
      snapshot.forEach((doc) => {
        // Add the document data and the document ID to the games array
        games.push({
          id: doc.id,
          ...(doc.data() as Game),
        });
      });

      // Respond with the games
      res.status(200).json({ data: games });
    } catch (e) {
      console.error(e);
      // Send an error response
      res.status(500).json({
        error: {
          message: "An error occurred while fetching data.",
          code: 500, // Optional error code
        },
      });
    }
  } else {
    // Optionally handle other HTTP methods, or send a response that the method is not allowed
    res.status(405).json({ error: { message: "Method not allowed" } });
  }
}
