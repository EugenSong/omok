import React from "react";
import styles from "@/styles/Home.module.css";

interface MessageProps {
  message: string;
}

const Message = ({ message }: MessageProps) => {
  return <p className={styles.label}>{message}</p>;
};

export default Message;

/** Interface VS Type
 * Syntax and Capabilities:

interface: Interface has a more limited syntax compared to type aliases, but it is more intuitive when defining the shape of an object.
type: Type aliases are more flexible and can represent any valid type, including union types, intersection types, tuples, literal types, etc. This makes them more powerful for complex type definitions.

Example of interface: 
---------------
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  position: string;
}

------------------------------------------------------------
Example of Type:
---------------
type Person = {
  name: string;
  age: number;
};

type Employee = Person & {
  position: string;
};

 */
