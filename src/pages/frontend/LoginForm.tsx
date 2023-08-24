import React, { useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import firebaseAuth from "../../backend/firebase-auth";

// Called a  Functional component
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // state variable for error message
  const [passwordShown, setPasswordShown] = useState(false); // state for password visibility
  const [user, setUser] = useState(null); // state for curr user in localstorage

  // Password toggle handler
  const togglePassword = () => {
    // When the handler is invoked
    // inverse the boolean state of passwordShown
    setPasswordShown(!passwordShown);
  };

  // one method to nav pages - has to be in functional component ; not embedded
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

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth.auth,
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
            setErrorMessage(
              "The email address is already in use. Press the 'Log In' button using the same credentials."
            );
            break;
          case "auth/invalid-email":
            setErrorMessage("The email address is not valid."); // Update state instead of alert
            break;
          case "auth/operation-not-allowed":
            setErrorMessage("Operation not allowed."); // Update state instead of alert

            break;
          case "auth/weak-password":
            setErrorMessage(
              "The password is too weak. Please make sure password is at least 6 characters long."
            ); // Update state instead of alert

            break;
          default:
            setErrorMessage("An unknown error occurred."); // Update state instead of alert
        }
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  const logIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth.auth,
        email,
        password
      );

      const user = userCredential.user;
      // console.log("User logged in:", user);

      localStorage.setItem("user", JSON.stringify(user));
      // console.log(JSON.stringify(user));

      navigateToGame();
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = error.code;
        switch (errorCode) {
          case "auth/invalid-email":
            setErrorMessage(
              "The email address is invalid. Please try another email address."
            );
            break;
          case "auth/user-disabled":
            setErrorMessage(
              "The email address is no longer valid. Please create an account by entering an email address and password and pressing 'Sign Up'."
            );
            break;
          case "auth/user-not-found":
            setErrorMessage(
              "The email address was not found. Please create an account by entering an email address and password and pressing 'Sign Up'."
            );
            // Handle user not found
            break;
          case "auth/wrong-password":
            setErrorMessage("Wrong password entered. Try again.");
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
      </div>

      {/* Display error message - only displays when there is an error */}
      <div>
        <p className={styles.errmessage}>{errorMessage}</p>
      </div>

      <div className={styles.emailpasswordWrapper}>
        <input
          placeholder="Email..."
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Super cool feature --> make password type DYNAMIC by using ternary operator in tandem with
      useState */}
        <input
          className={styles.password}
          placeholder="Password..."
          type={passwordShown ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className={styles.visiblebutton}
          onClick={togglePassword}
          style={
            passwordShown
              ? { backgroundImage: `url(/show.png)`, backgroundSize: "cover" }
              : { backgroundImage: `url(/hide.png)`, backgroundSize: "cover" }
          }
        ></button>
      </div>

      <div className={styles.buttonsWrapper}>
        <button className={styles.button} onClick={() => signUp()}>
          Sign Up
        </button>
        <button className={styles.button} onClick={() => logIn()}>
          Log In
        </button>
      </div>
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
