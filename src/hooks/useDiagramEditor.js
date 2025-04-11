import { useState, useEffect } from 'react';

export const useDiagramEditor = (initialDefinition = "") => {
  const [diagramDefinition, setDiagramDefinition] = useState(initialDefinition);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(initialDefinition);
  
  // Update edited text when diagram definition changes
  useEffect(() => {
    setEditedText(diagramDefinition);
  }, [diagramDefinition]);

  const toggleTextArea = (editing = false) => {
    setIsEditing(editing);
    
    if (editing) {
      // Reset edited text to match current definition when entering edit mode
      setEditedText(diagramDefinition); 
    }
  };

  const applyChanges = () => {
    if (isEditing) {
      setDiagramDefinition(editedText);
    }
    setIsEditing(false);
  };

  return {
    diagramDefinition,
    setDiagramDefinition,
    isEditing,
    editedText,
    setEditedText,
    toggleTextArea,
    applyChanges
  };
};