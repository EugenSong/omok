import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../../backend/key.json" assert { type: "json" };

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

const searchForExistingGame = async (user: string, gameid: string) => {
  try {
    const gamesRef = db.collection("games");

    // Query for games where player1 is the user
    const player1Snapshot = await gamesRef
      .where("isOngoing", "==", true)
      .where("player1", "==", user)
      .where("board_uid", "==", gameid)
      .get();

    // Query for games where player2 is the user
    const player2Snapshot = await gamesRef
      .where("isOngoing", "==", true)
      .where("player2", "==", user)
      .where("board_uid", "==", gameid)
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
      // don't need to use JSON.parse since nextjs responses are by default parsed as strings
      const body = req.body;

      // now use body.user and body.gameid
      let user = body.user;
      let gameuid = body.gameid;

      //   console.log("req.body [user] is", user);
      //   console.log("currentUserEmail in the handler is ", user);
      const game = await searchForExistingGame(user, gameuid);
      if (game) {
        console.log("Game found: ", game);
        res.status(200).json({
          game: game,
        });
      } else {
        console.log("No game found.");
        res.status(404).json({ message: "No game found." }); // Send a 404 response
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    // Optionally handle other HTTP methods, or send a response that the method is not allowed
    res.status(405).json({ error: { message: "Method not allowed" } });
  }
}
