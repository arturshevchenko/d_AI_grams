import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import styles from './MermaidRenderer.module.css';

// Initialize Mermaid with configuration
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose', // Required for some diagrams
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  flowchart: {
    useMaxWidth: false
  }
});

const MermaidRenderer = ({ definition }) => {
  const containerRef = useRef(null);
  const [renderError, setRenderError] = useState(null);
  
  useEffect(() => {
    // Skip if no definition or container ref not available
    if (!definition || !containerRef.current) return;
    
    let isMounted = true;
    
    const renderDiagram = async () => {
      try {
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        
        // Use mermaid's render method directly
        const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}`, definition);
        
        // Only update DOM if component is still mounted
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          // Adjust SVG styles after rendering
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
            svgElement.style.minHeight = '200px';
          }
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        
        if (isMounted) {
          setRenderError(error.message || 'Failed to render diagram');
          
          // Display error message
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="${styles.error}">
                <p>Error rendering diagram:</p>
                <pre>${error.message}</pre>
              </div>
            `;
          }
        }
      }
    };
    
    // Add a small delay to ensure the DOM is ready
    const timerId = setTimeout(() => {
      renderDiagram();
    }, 100);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [definition]);
  
  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.diagram}>
        {/* Initial loading message */}
        {!renderError && <div className={styles.loading}>Rendering diagram...</div>}
      </div>
    </div>
  );
};

export default MermaidRenderer;