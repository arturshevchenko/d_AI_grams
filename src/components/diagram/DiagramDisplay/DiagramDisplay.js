import React, { useRef, useState, useEffect } from 'react';
import styles from './DiagramDisplay.module.css';
import DiagramControls from '../DiagramControls';
import DiagramTextArea from '../DiagramTextArea';
import MermaidRenderer from '../MermaidRenderer';
import { downloadSVG } from '../../../utils/diagramUtils';

const DiagramDisplay = ({
  title,
  diagramDefinition,
  isTextAreaVisible,
  isEditing,
  editedText,
  toggleTextArea,
  applyChanges,
  closeTextArea,
  onEditText
}) => {
  const diagramRef = useRef(null);
  const [isValid, setIsValid] = useState(true);
  const [isRawVisible, setIsRawVisible] = useState(false);
  
  // Validate the diagram definition
  useEffect(() => {
    if (!diagramDefinition) {
      setIsValid(false);
      return;
    }
    
    // Simple validation - ensure it's not empty and has some basic structure
    const hasContent = diagramDefinition.trim().length > 0;
    const hasBasicStructure = 
      diagramDefinition.includes('graph') || 
      diagramDefinition.includes('flowchart') ||
      diagramDefinition.includes('sequenceDiagram') ||
      diagramDefinition.includes('classDiagram');
    
    setIsValid(hasContent && hasBasicStructure);
  }, [diagramDefinition]);
  
  const handleDownload = () => {
    if (isValid) {
      downloadSVG(diagramRef, `diagram-${title.toLowerCase().replace(/\s+/g, '-')}.svg`);
    } else {
      alert('Cannot download: The diagram is not valid or has not been properly rendered.');
    }
  };

  const handleToggleRaw = () => {
    if (isEditing) {
      // If we're in edit mode, first apply changes
      applyChanges();
    }
    
    // Toggle the raw view
    setIsRawVisible(!isRawVisible);
  };
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      
      <DiagramControls 
        onToggleRaw={handleToggleRaw}
        isRawVisible={isRawVisible}
        onEdit={() => toggleTextArea(true)}
        onDownload={handleDownload}
        isDownloadDisabled={!isValid}
      />
      
      {isRawVisible && !isEditing && (
        <DiagramTextArea 
          value={diagramDefinition}
          onChange={() => {}} // No change allowed in view mode
          readOnly={true}
          isEditing={false}
        />
      )}
      
      {isEditing && (
        <DiagramTextArea 
          value={editedText}
          onChange={onEditText}
          readOnly={false}
          onApply={applyChanges}
          isEditing={true}
        />
      )}
      
      <div ref={diagramRef} className={styles.diagramContainer}>
        {diagramDefinition ? (
          <MermaidRenderer definition={diagramDefinition} />
        ) : (
          <div className={styles.emptyState}>
            No diagram generated yet. Please generate a diagram first.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramDisplay;