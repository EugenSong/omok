import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase-config.mjs/index.js';


// retrieve initialized firebase app 
const app = initializeApp(firebaseConfig);
// Get the auth instance from the already initialized Firebase app
const auth = getAuth(app);

const firebaseAuth = {
    auth,
}

export default firebaseAuth;