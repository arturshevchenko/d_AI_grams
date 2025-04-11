import React from 'react';
import styles from './InputSection.module.css';
import CommandCopyPaste from '../../components/common/CommandCopyPaste';
import CodeInput from '../../components/common/CodeInput';
import Button from '../../components/common/Button';
import { COMMANDS } from '../../constants/commands';

const InputSection = ({
  treeStructure,
  setTreeStructure,
  readmeFile,
  setReadmeFile,
  importsStructure,
  setImportsStructure,
  onGenerate,
  isLoading
}) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Code Input</h2>
      
      <div className={styles.inputsContainer}>
        {/* File Tree Section */}
        <div className={styles.inputGroup}>
          <CommandCopyPaste
            instruction="Paste this command in terminal to get file tree:"
            command={COMMANDS.fileTree}
            onCopy={onGenerate.copyToClipboard}
            onPaste={() => onGenerate.pasteFromClipboard(setTreeStructure)}
            buttonName="File tree command"
          />
          
          <CodeInput
            placeholder="Enter tree structure here..."
            value={treeStructure}
            onChange={setTreeStructure}
          />
        </div>
        
        {/* Readme Section */}
        <div className={styles.inputGroup}>
          <h3 className={styles.inputTitle}>README Content</h3>
          <CodeInput
            placeholder="Enter readme content here..."
            value={readmeFile}
            onChange={setReadmeFile}
          />
        </div>
        
        {/* Imports Section */}
        <div className={styles.inputGroup}>
          <CommandCopyPaste
            instruction="Paste this command in terminal to get imports:"
            command={COMMANDS.imports}
            onCopy={onGenerate.copyToClipboard}
            onPaste={() => onGenerate.pasteFromClipboard(setImportsStructure)}
            buttonName="Imports command"
          />
          
          <CodeInput
            placeholder="Enter imports here..."
            value={importsStructure}
            onChange={setImportsStructure}
          />
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        <Button
          onClick={onGenerate.handleGenerate}
          disabled={isLoading}
          className={styles.generateButton}
        >
          {isLoading ? "Generating..." : "Generate Diagrams"}
        </Button>
      </div>
    </section>
  );
};

export default InputSection;
