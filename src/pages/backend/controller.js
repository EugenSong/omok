import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { updateBoard, copyBoard } from './service.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json()); // Add this line to parse JSON data in the request body

app.use(cors());

app.get('/board', (req, res) => {
    const board = copyBoard();
    res.send(JSON.stringify(board));
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

app.post('/', (req, res) => {

    // console.log('req.body:', req.body); // add this line to debug

    if (validate(req, res)) { // check for null req body
        
        const player = req.body.player
        const xPos = req.body.x
        const yPos = req.body.y

        // instead of if-else... use try-catch
        if (updateBoard(player, xPos, yPos) === 1) {
            const board = copyBoard();
            console.log(board);
            res.sendStatus(200);
        } else {
            console.log("Failure updating board!");
            res.sendStatus(400);
        }
    } else {
        res.status(400).json({ error: "Invalid request parameters" });

    }

})

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

