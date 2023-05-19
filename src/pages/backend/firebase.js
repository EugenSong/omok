// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getFunctions } from "firebase/functions";
import { collection, addDoc } from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid';

const BOARD_LEN = 19
const board = Array(BOARD_LEN)
  .fill(0)
  .map(() => Array(BOARD_LEN).fill(0));

//https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Cloud Functions and get ref to the service
//const functions = getFunctions(app);


const generateUUID = () => {
  return uuidv4(); // ⇨ ex) '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
}

// func to create a board object to store in firebase (firebase does not support nested arrays)
const createBoardObject = (board, BOARD_LEN) => {

  const object = {};

  // quick and simple  algo to construct object from 2-d array
  // loop both arrays -> create key -> store original value into new object's hashmap 
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const key = `${i}-${j}`;
      object[key] = board[i][j];
    }
  }
  return object;
}

const boardObject = createBoardObject(board, BOARD_LEN);

const createGame = async () => {
  try {

    // assign game unique id
    const uuid = generateUUID();

    // add a single game (document) in 'games' collection 
    const docRef = await addDoc(collection(db, "games"), {
      board_uid: uuid,
      board: boardObject,
    });

    console.log("Document written with ID: ", docRef.id);
    //console.log("board-object is: ", board_obj);

  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export { createGame };

const firebaseService = {
  createGame,
};

export default firebaseService;
