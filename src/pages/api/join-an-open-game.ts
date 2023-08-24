import type { NextApiRequest, NextApiResponse } from "next";
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


// const searchForExistingGame = async (currentUserEmail: any) => {
//   try {
//     const gamesRef = db.collection("games");
//     const snapshot = await gamesRef.get();
//     // console.log("Firestore snapshot:", snapshot); // Log the Firestore snapshot

//     for (let doc of snapshot.docs) {
//       console.log("doc is ", doc); // doc is of type QueryDocumentSnapshot  ---> need to conv to JS object to manipulate

//       // returns a DocumentData object, which is essentially a JavaScript object that represents your document's data ----> no need to JSON.parse(game)
//       let game = doc.data();
//       console.log("doc.data() is ", game);

//       // use dot notation b/c game is now JS obj
//       console.log("game.user.email is ", game.player1);

//       if (game.isOngoing && game.player1 === currentUserEmail) {
//         console.log("returning from searchForOpenGame");
//         return game; // Return the found game
//       }
//     }
//   } catch (error) {
//     console.error("There has been a problem with your fetch operation:", error);
//   }
// };

const searchForExistingGame = async (currentUserEmail: any) => {
  try {
    const gamesRef = db.collection("games");
    const snapshot = await gamesRef
      .where("isOngoing", "==", true)
      .where("player1", "==", currentUserEmail)
      .get();

    for (let doc of snapshot.docs) {
      let game = doc.data();
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
      // first search for existing game with notOngoing (FIX LATER for OPP COND) or for already existing email in game

      // turn json string into an js object using JSON.parse to access fields
      let userData = JSON.parse(req.body.user);

      console.log("req.body [user] is", userData);
      console.log("currentUserEmail in the handler is ", userData.email);
      const game = await searchForExistingGame(userData.email);
      if (game) {
        console.log("Game found: ", game);
        res
          .status(200)
          .json({
            message: "An Open Game exists. Joining the open game...",
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
