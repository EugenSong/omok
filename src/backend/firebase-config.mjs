// Your web app's Firebase configuration
const firebaseConfig= {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

export default firebaseConfig;


// import it without using the curly braces, you can export it as the default export.
// import firebaseConfig from './path-to-your-config-file';


// if you use the export const syntax I provided earlier, you will need to use the curly braces when importing, like this:
// import { firebaseConfig } from './path-to-your-config-file';

