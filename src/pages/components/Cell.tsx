import React from "react";



// declare interface - variable "shape" rules
interface CellProps {
  rowIndex: number;
  colIndex: number;
  value: string;
  onClick: () => void;
}

// Cell html skeleton
const Cell = ({ rowIndex, colIndex, value, onClick }: CellProps) => {
  return (
    <td key={`${rowIndex}-${colIndex}`} onClick={onClick}>
      <img src={value}></img>
      
    </td>
  );
};

export default Cell;
