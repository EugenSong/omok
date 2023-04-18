import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { updateBoard, copyBoard } from './service.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json()); // Add this line to parse JSON data in the request body

app.use(cors({ origin: "*" })); // configure CORS to allow all origins, methods, and headers

// handle OPTIONS request that occurs orior to POST - due to CORS protocol
app.options('/piece', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });
  

app.get('/board', (req, res) => {
    const board = copyBoard();
    res.send(JSON.stringify(board));
    return;
})

// function to validate request-body-params 
function validate(req, res) {
    if (req.body.player === null || typeof req.body.player !== 'number') {
        res.sendStatus(400).json( {
        Error: 'Invalid request - req.body.player' } );
        return 0;
    }
    else if (req.body.x === null || typeof req.body.x !== 'number') {
        res.sendStatus(400).json( {
            Error: 'Invalid request - req.body.x' } );
            return 0;
    }
    else if (req.body.y === null || typeof req.body.y !== 'number') {
        res.sendStatus(400).json( {
            Error: 'Invalid request - req.body.y' } );
            return 0;
    }
    return 1;
}


app.options('/piece', cors()); // Set up pre-flight OPTIONS request handling

app.post('/piece', (req, res) => {

    // console.log('req.body:', req.body); // add this line to debug

    if (validate(req, res)) { // check for null req body
        
        const player = req.body.player
        const xPos = req.body.x
        const yPos = req.body.y

        // update board with player piece
        if (updateBoard(player, xPos, yPos) === 1) {
            console.log("POST - updateBoard worked in controller");
           // console.log(board);
           res.status(200).json({ board: copyBoard() });
        } 
        // there's already a piece there 
        else if (updateBoard(player, xPos, yPos) === 2) {
            return; 
        } else {
            console.log("Failure updating board!");
            res.sendStatus(400).json(
                "error in updateBoard() of POST"
            );
            
        }
    } else {
        res.status(400).json({ error: "Invalid request parameters" });
        

    }

})

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

