import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

type ApiResponse = {
  message?: string;
  game?: GameData; // Add this line
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
  if (req.method === "PUT") {
    // Log the request body before destructuring
    console.log("req.body before destructuring is ", req.body);

    // Destructuring the request body into 2 vars
    const { documentId, player2 } = req.body;

    // Log the variables after destructuring
    console.log("After destructuring, documentId:", documentId);
    console.log("After destructuring, playerTwo:", player2);
    try {
      const docRef = db.collection("games").doc(documentId);

      console.log("docRef is ", docRef);
      console.log("playerTwo is ", player2);

      await docRef.update({
        player2: player2,
      });

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

      res
        .status(200)
        .json({ message: "Document updated successfully", game: gameData });
    } catch (error) {
      console.error("There was an error updating the document: ", error);

      res.status(500).json({
        error: {
          message: "An error occurred while updating the document.",
          code: 500,
        },
      });
    }
  } else {
    // Optionally handle other HTTP methods, or send a response that the method is not allowed
    res.status(405).json({ error: { message: "Method not allowed" } });
  }
}
