const STORAGE_KEYS = {
    DIAGRAMS: 'diagram-generator-diagrams',
    TREE: 'diagram-generator-tree',
    README: 'diagram-generator-readme',
    IMPORTS: 'diagram-generator-imports'
  };
  
  export const saveDiagrams = (firstDiagram, secondDiagram) => {
    try {
      const data = JSON.stringify({
        firstDiagram,
        secondDiagram,
        timestamp: Date.now()
      });
      
      localStorage.setItem(STORAGE_KEYS.DIAGRAMS, data);
      return true;
    } catch (error) {
      console.error('Error saving diagrams to localStorage:', error);
      return false;
    }
  };
  
  export const loadDiagrams = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIAGRAMS);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading diagrams from localStorage:', error);
      return null;
    }
  };
  
  export const saveInputs = (tree, readme, imports) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TREE, tree);
      localStorage.setItem(STORAGE_KEYS.README, readme);
      localStorage.setItem(STORAGE_KEYS.IMPORTS, imports);
      return true;
    } catch (error) {
      console.error('Error saving inputs to localStorage:', error);
      return false;
    }
  };
  
  export const loadInputs = () => {
    try {
      return {
        tree: localStorage.getItem(STORAGE_KEYS.TREE) || '',
        readme: localStorage.getItem(STORAGE_KEYS.README) || '',
        imports: localStorage.getItem(STORAGE_KEYS.IMPORTS) || ''
      };
    } catch (error) {
      console.error('Error loading inputs from localStorage:', error);
      return { tree: '', readme: '', imports: '' };
    }
  };