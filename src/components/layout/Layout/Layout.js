import React from 'react';
import styles from './Layout.module.css';
import Header from '../../common/Header';
import Toast from '../../common/Toast';

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Toast />
    </div>
  );
};

export default Layout;

