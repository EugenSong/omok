import React from "react";
import styles from "@/styles/Home.module.css";

// declare interface - variable "shape" rules
interface CellProps {
  rowIndex: number;
  colIndex: number;
  value: number;
  onClick: () => void;
}

// Cell html skeleton
const Cell = ({ rowIndex, colIndex, value, onClick }: CellProps) => {
  return (
    <td
      key={`${rowIndex}-${colIndex}`}
      style={{ textAlign: "center" }}
      onClick={onClick}
    >
      {value}
    </td>
  );
};

export default Cell;
