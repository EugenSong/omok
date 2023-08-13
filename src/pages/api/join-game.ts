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
// stores a map of arrays (aka object of arrays) 
const createBoardObject = (board: number[][]) => {
  return board.reduce((acc: Record<string, any>, curr, idx) => {
    acc[`${idx}`] = curr;
    return acc;
  }, {} as Record<string, any>);
};


const createGame = async (user: any) => {
  try {

    const boardObject = createBoardObject(
      gameService.board
    );

    // assign game unique id
    const uuid = generateUUID();

    // add a single game (document) in 'games' collection ... so far just adds the first game with no player / move
    const newGameRef = db.collection("games").doc();

    // create a user object out of user json
    let userObject = JSON.parse(user);

    await newGameRef.set({
      board_uid: uuid,
      board: boardObject,
      isOngoing: true,
      player1: userObject.email, // If you need to save the user information with the game
      player2: "",
    });

    console.log("Document written with ID: ", newGameRef.id);
    console.log("board-object is: ", newGameRef);
    return;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

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
            message: "A Game already exists. Joining the existing game...",
          });
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
