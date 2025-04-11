import React from 'react';
import styles from './CommandCopyPaste.module.css';
import Button from '../Button';

const CommandCopyPaste = ({ 
  instruction, 
  command, 
  onCopy, 
  onPaste, 
  buttonName 
}) => {
  return (
    <div className={styles.container}>
      <p className={styles.instruction}>{instruction}</p>
      <p className={styles.command}>{command}</p>
      <div className={styles.buttonGroup}>
        <Button
          onClick={() => onCopy(command, buttonName)}
          variant="secondary"
          className={styles.button}
        >
          Copy
        </Button>
        <Button
          onClick={onPaste}
          variant="secondary"
          className={styles.button}
        >
          Paste
        </Button>
      </div>
    </div>
  );
};

export default CommandCopyPaste;
