import React from 'react';
import Layout from '../../components/layout/Layout';
import DiagramGenerator from '../DiagramGenerator';
import { useEffect } from 'react';
import mermaid from 'mermaid';

const App = () => {
  // Initialize Mermaid with configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    });
  }, []);
  
  return (
    <Layout>
      <DiagramGenerator />
    </Layout>
  );
};

export default App;
