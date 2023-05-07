import React from "react";
import styles from "@/styles/Home.module.css";
import Image from "next/image";

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
      {/* use conditional here to avoid having src read empty/undefined image url 
          - also styles.img overrides required 'width' and 'height' */}
      {value && (
        <Image
          className={styles.img}
          src={value}
          placeholder="empty"
          alt=""
          width={50}
          height={50}
        />
      )}
    </td>
  );
};

export default Cell;
