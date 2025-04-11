import React from 'react';
import styles from './DiagramTextArea.module.css';
import Button from '../../common/Button';

const DiagramTextArea = ({ 
    value, 
    onChange, 
    readOnly, 
    onApply, 
    isEditing 
  }) => {
    return (
      <div className={styles.container}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={styles.textarea}
        />
        {isEditing && (
          <div className={styles.buttonContainer}>
            <Button 
              onClick={onApply} 
              variant="success"
              className={styles.button}
            >
              Apply Changes
            </Button>
          </div>
        )}
      </div>
    );
  };
  

export default DiagramTextArea;
