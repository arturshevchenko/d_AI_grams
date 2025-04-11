import { useState } from 'react';
import { cleanDiagramDefinition } from '../utils/diagramUtils';
import { generateDiagrams } from '../services/api/openaiService';
import { useToast } from '../context/ToastContext';

export const useDiagramGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [diagramsGenerated, setDiagramsGenerated] = useState(false);
  const { showToast } = useToast();

  const generateDiagramsFromCode = async (treeStructure, readmeFile, importsStructure) => {
    setIsLoading(true);
    
    try {
      if (!treeStructure.trim()) {
        showToast('Please provide file tree structure data', 'warning');
        setIsLoading(false);
        return null;
      }
      
      const { firstDiagram, secondDiagram } = await generateDiagrams(
        treeStructure, 
        readmeFile, 
        importsStructure
      );
      
      // Ensure we have valid diagram definitions
      const cleanedFirstDiagram = cleanDiagramDefinition(firstDiagram);
      const cleanedSecondDiagram = cleanDiagramDefinition(secondDiagram);
      
      // Validate the diagrams have actual content
      if (!cleanedFirstDiagram || !cleanedSecondDiagram) {
        showToast('Failed to generate valid diagrams. Please try again.', 'error');
        return null;
      }
      
      setDiagramsGenerated(true);
      showToast('Diagrams generated successfully!', 'success');
      
      return {
        firstDiagram: cleanedFirstDiagram,
        secondDiagram: cleanedSecondDiagram
      };
    } catch (error) {
      console.error("Error generating diagrams:", error);
      showToast('Error generating diagrams. Please try again.', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    diagramsGenerated,
    generateDiagramsFromCode,
  };
};