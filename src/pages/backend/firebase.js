// Import the functions you need from the SDKs you need


import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getFunctions } from "firebase/functions";
import { collection, addDoc } from "firebase/firestore";


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

const createGame = async () => {
  try {
    const docRef = await addDoc(collection(db, "games"), {
      board_uid: "abc",
      board: [0, 1, 2],
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export { createGame };

const firebaseService = {
  createGame,
};

export default firebaseService;
