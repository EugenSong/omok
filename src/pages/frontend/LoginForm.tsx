import React, { useEffect } from "react";
import firebaseService from "../backend/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/router";

import styles from "@/styles/Home.module.css";

// Called a  Functional component
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // New state variable for error message

  const [user, setUser] = useState(null);

  // one method to nav pages
  const router = useRouter();

  const navigateToGame = () => {
    router.push("/frontend/Game");
    return;
  };

  // useEffect to track local storage "user" @ startup --> set existing user and nav to game
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser); // JSON.parse() turns JSON object into Javascript object
      setUser(foundUser);
      navigateToGame();
    }
  }, []);

  const signIn = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseService.auth,
        email,
        password
      );

      const user = userCredential.user;
      console.log("User created:", user);

      localStorage.setItem("user", JSON.stringify(user));
      console.log(JSON.stringify(user));

      navigateToGame();
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = error.code;
        switch (errorCode) {
          case "auth/email-already-in-use":
            setErrorMessage("The email address is already in use"); // Update state instead of alert
            break;
          case "auth/invalid-email":
            setErrorMessage("The email address is not valid."); // Update state instead of alert
            break;
          case "auth/operation-not-allowed":
            setErrorMessage("Operation not allowed."); // Update state instead of alert

            break;
          case "auth/weak-password":
            setErrorMessage("The password is too weak."); // Update state instead of alert

            break;
          default:
            setErrorMessage("An unknown error occurred."); // Update state instead of alert
        }
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  return (
    <div className={styles.login}>
      <div>
        <p>Login page.</p>
        <p className={styles.errmessage}>{errorMessage}</p>

        {/* Conditionally render the user email */}
        {user && (user as any).email ? (
          <div>{(user as any).email} is logged in</div>
        ) : null}
        {/* Display error message */}
      </div>
      <input
        placeholder="Email..."
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => signIn()}>Sign In</button>
      
    </div>
  );
};

export default LoginForm;

/* example of Class Component

export default class Login extends Component {
  render() {
    return (
      <div>Login</div>
    )
  }
}

*/
