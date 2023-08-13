import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

type Data = {
  message?: string;
  error?: {
    message: string;
    code?: number;
  };
  game?: Game; // Include a field for the game object
};

interface Game {
  board: Map<number, number[]>;
  board_uid: string;
  isOngoing: boolean;
  player1: string;
  player2: string;
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
    const snapshot = await gamesRef
      .where("isOngoing", "==", true)
      .where("player2", "==", user)
      .where("board_uid", "==", gameid)
      .get();

    for (let doc of snapshot.docs) {
      let game = doc.data() as Game;
      console.log("Found game:", game);
      return game; // Return the found game
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
      // don't need to use JSON.parse since nextjs responses are by default parsed as strings
      const body = req.body;

      // now use body.user and body.gameid
      let user = body.user;
      let gameuid = body.gameid;

      console.log("req.body [user] is", user);
      console.log("currentUserEmail in the handler is ", user);
      const game = await searchForExistingGame(user, gameuid);
      if (game) {
        console.log("Game found: ", game);
        res.status(200).json({
          game,
        });
      } else {
        console.log("No game found.");
        return;
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    // Optionally handle other HTTP methods, or send a response that the method is not allowed
    res.status(405).json({ error: { message: "Method not allowed" } });
  }
}
