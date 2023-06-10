import { useState } from "react";

const handleLogout = (setUser, setEmail, setPassword) => {
    setUser(null);
    setEmail("");
    setPassword("");
    localStorage.clear();
};

export default handleLogout