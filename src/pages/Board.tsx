import React from 'react';
import styles from '@/styles/Home.module.css'
import { useState } from 'react';

interface CellProps {
  rowIndex: number;
  colIndex: number;
  p1Turn: boolean;
  setP1Turn: (p1Turn: boolean) => void; 
}

interface GridProps {
  numRows: number;
  numCols: number;
}

const Cell = ({ rowIndex, colIndex, p1Turn, setP1Turn }: CellProps) => {

    
    const [value, setValue] = useState('');


    const handleClick = () => {
        if (p1Turn && value === '') {
          setValue('X');
          setP1Turn(!p1Turn);
        } else if (!p1Turn && value == '') {
          setValue('O');
          setP1Turn(!p1Turn);
        }
      };

      return (
        <td key={`${rowIndex}-${colIndex}`} style={{ textAlign: 'center' }} onClick={handleClick}>
          {value}
        </td>
      );
};

const Grid = ({ numRows, numCols }: GridProps) => {

  const [p1Turn, setP1Turn] = useState(true);

  const renderRow = (rowIndex: number) => {
    const cells = [];
    for (let colIndex = 0; colIndex < numCols; colIndex++) {
      cells.push(<Cell 
      key={`${rowIndex}-${colIndex}`} 
      rowIndex={rowIndex} 
      colIndex={colIndex} 
      p1Turn={p1Turn}
      setP1Turn={setP1Turn}/>);
    }
    return <tr key={rowIndex}>{cells}</tr>;
  };

  let rows = [];
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    rows.push(renderRow(rowIndex));
  }

  return (
    <div>

    <table className={styles.grid}>
      <tbody>
        {rows}
      </tbody>
    </table>

    <button>Clear board</button>
    </div>
    
  );

};

export default Grid;
