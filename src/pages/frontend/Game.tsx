import React from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

import Board2 from "./Board2";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Game = () => {
  // persist user from Login Page by grabbing from localStorage
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter(); // Hooks can only exist in functional components

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser); // JSON.parse() turns JSON object into Javascript object
      setUser(foundUser);
    }
  }, []);

  const navigateToHome = () => {
    // one method to nav pages
    router.push("/frontend/LoginForm");
    return;
  };

  const handleLogout = () => {
    setUser(null);
    setEmail("");
    setPassword("");
    localStorage.clear();
    navigateToHome();
  };

  return (
    <>
      <Head>
        <title>omok</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Omok - Connect 5</h1>
        <button
          className={styles.logoutbutton}
          onClick={() => {
            handleLogout();
          }}
        >
          Log Out
        </button>

        <div>
          <Board2 />
        </div>
      </main>
    </>
  );
};

export default Game;
