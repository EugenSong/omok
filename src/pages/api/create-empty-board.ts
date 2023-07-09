import type { NextApiRequest, NextApiResponse } from "next";
import gameService from "../backend/game-service.js";

type ApiResponse = {
  data?: Array<{ [key: string]: any }>;
  board?: any[][]; // This represents a 2D array
  error?: {
    message: string;
    code?: number;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const board = gameService.copyBoard();
      res.send({ board: board }); //This will send an object with a board key and the original 2D array as a value. The .send() method will automatically convert this into a JSON string.
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );

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
