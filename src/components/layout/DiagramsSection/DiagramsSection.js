import React from 'react';
import styles from './DiagramsSection.module.css';
import DiagramDisplay from '../../diagram/DiagramDisplay';

const DiagramsSection = ({ 
  firstDiagram, 
  secondDiagram,
  isLoading
}) => {
  if (isLoading) {
    return null; // Don't render when loading
  }
  
  if (!firstDiagram.diagramDefinition && !secondDiagram.diagramDefinition) {
    return null; // Don't render when no diagrams are generated
  }
  
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Generated Diagrams</h2>
      <div className={styles.diagramsContainer}>
        <DiagramDisplay
          title="Component Structure"
          diagramDefinition={firstDiagram.diagramDefinition}
          isTextAreaVisible={firstDiagram.isTextAreaVisible}
          isEditing={firstDiagram.isEditing}
          editedText={firstDiagram.editedText}
          toggleTextArea={firstDiagram.toggleTextArea}
          applyChanges={firstDiagram.applyChanges}
          closeTextArea={firstDiagram.closeTextArea}
          onEditText={firstDiagram.setEditedText}
        />
        
        <DiagramDisplay
          title="Dependencies"
          diagramDefinition={secondDiagram.diagramDefinition}
          isTextAreaVisible={secondDiagram.isTextAreaVisible}
          isEditing={secondDiagram.isEditing}
          editedText={secondDiagram.editedText}
          toggleTextArea={secondDiagram.toggleTextArea}
          applyChanges={secondDiagram.applyChanges}
          closeTextArea={secondDiagram.closeTextArea}
          onEditText={secondDiagram.setEditedText}
        />
      </div>
    </section>
  );
};

export default DiagramsSection;
