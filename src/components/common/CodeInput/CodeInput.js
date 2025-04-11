import React from 'react';
import styles from './CodeInput.module.css';

const CodeInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  ...props 
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${styles.textarea} ${className}`}
      {...props}
    />
  );
};

export default CodeInput;
