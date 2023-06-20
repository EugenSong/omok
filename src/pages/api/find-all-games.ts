import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../backend/key.json" assert { type: "json" };

// Define the shape of your document --> data can take Array
type ApiResponse = {
  data?: Array<{ [key: string]: any }>;
  error?: {
    message: string;
    code?: number;
  };
};

// Initialize Firebase
admin.initializeApp({
  //@ts-ignore
  credential: admin.credential.cert(serviceAccount),
});
// Initialize Cloud Firestore and get a reference to the service
const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const gamesRef = db.collection("games");
    const response = await gamesRef.get();

    let responseData: Array<{ [key: string]: any }> = [];   
    
    response.forEach((doc) => {
      responseData.push(doc.data());
    });
    res.json({ data: responseData }); // Use res.json() for JSON data
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
}
