import React from 'react';
import styles from './Toast.module.css';
import { useToast } from '../../../context/ToastContext';

const Toast = () => {
  const { toast } = useToast();
  
  if (!toast.show) return null;
  
  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      {toast.message}
    </div>
  );
};

export default Toast;
