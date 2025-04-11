import React, { useEffect, useState } from 'react';
import styles from './DiagramGenerator.module.css';
import InputSection from '../InputSection';
import DiagramsSection from '../../components/layout/DiagramsSection';
import Loader from '../../components/common/Loader';
import { useClipboard } from '../../hooks/useClipboard';
import { useDiagramGenerator } from '../../hooks/useDiagramGenerator';
import { useDiagramEditor } from '../../hooks/useDiagramEditor';
import { saveInputs, loadInputs, saveDiagrams, loadDiagrams } from '../../services/storage/localStorage';

const DiagramGenerator = () => {
  // Input state
  const [treeStructure, setTreeStructure] = useState('');
  const [readmeFile, setReadmeFile] = useState('');
  const [importsStructure, setImportsStructure] = useState('');
  
  // Custom hooks
  const { copyToClipboard, pasteFromClipboard } = useClipboard();
  const { isLoading, generateDiagramsFromCode } = useDiagramGenerator();
  const firstDiagram = useDiagramEditor();
  const secondDiagram = useDiagramEditor();
  
  // Load saved inputs and diagrams on component mount
  useEffect(() => {
    const savedInputs = loadInputs();
    setTreeStructure(savedInputs.tree);
    setReadmeFile(savedInputs.readme);
    setImportsStructure(savedInputs.imports);
    
    const savedDiagrams = loadDiagrams();
    if (savedDiagrams) {
      firstDiagram.setDiagramDefinition(savedDiagrams.firstDiagram);
      secondDiagram.setDiagramDefinition(savedDiagrams.secondDiagram);
    }
  }, []);
  
  // Save inputs when they change
  useEffect(() => {
    saveInputs(treeStructure, readmeFile, importsStructure);
  }, [treeStructure, readmeFile, importsStructure]);
  
  // Save diagrams when they change
  useEffect(() => {
    if (firstDiagram.diagramDefinition || secondDiagram.diagramDefinition) {
      saveDiagrams(
        firstDiagram.diagramDefinition, 
        secondDiagram.diagramDefinition
      );
    }
  }, [firstDiagram.diagramDefinition, secondDiagram.diagramDefinition]);
  
  const handleGenerate = async () => {
    try {
      const { firstDiagram: first, secondDiagram: second } = 
        await generateDiagramsFromCode(treeStructure, readmeFile, importsStructure);
      
      firstDiagram.setDiagramDefinition(first);
      secondDiagram.setDiagramDefinition(second);
    } catch (error) {
      console.error('Error generating diagrams:', error);
    }
  };
  
  return (
    <div className={styles.container}>
      <InputSection
        treeStructure={treeStructure}
        setTreeStructure={setTreeStructure}
        readmeFile={readmeFile}
        setReadmeFile={setReadmeFile}
        importsStructure={importsStructure}
        setImportsStructure={setImportsStructure}
        onGenerate={{
          copyToClipboard,
          pasteFromClipboard,
          handleGenerate
        }}
        isLoading={isLoading}
      />
      
      {isLoading && <Loader />}
      
      <DiagramsSection
        firstDiagram={firstDiagram}
        secondDiagram={secondDiagram}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DiagramGenerator;
