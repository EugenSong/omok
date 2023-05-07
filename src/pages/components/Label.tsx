import { useState } from 'react';
import React from 'react';
import styles from '@/styles/Home.module.css';


interface MessageProps {
    message: string;
  
  }


const Message = ( { message }: MessageProps) => {
  
    return (
      <p className={styles.label}>{message}</p>
    );
  }

  
export default Message