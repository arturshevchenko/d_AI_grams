// src/utils/diagramUtils.js
// Clean and format diagram definition
export const cleanDiagramDefinition = (rawDefinition) => {
    if (!rawDefinition) return '';
    
    // Replace code block markers first
    let cleaned = rawDefinition.replace(/```mermaid/g, '')
                              .replace(/```/g, '')
                              .trim();
    
    // Return empty string for empty diagrams                          
    if (!cleaned) return '';
    
    // Common fixes for Mermaid diagrams
    cleaned = cleaned
      // Fix newlines
      .replace(/(\\n)+/g, "\n")
      // Fix quotes
      .replace(/\\"/g, '"')
      // Fix empty relationships
      .replace('""', '"uses"')
      // Fix spacing around quotes
      .replace(/\|\s+"/g, '|"')
      .replace(/"\s+\|/g, '"|')
      // Fix empty relationship labels
      .replace(/\|""\|/g, '|"uses"|')
      // Fix style keyword conflicts
      .replace(/\bstyle\b(?=\s+[A-Za-z0-9_-]+\s+fill)/g, "style1")
      // Remove 'mermaid' from content
      .replace(/mermaid/g, '');
      
    // Basic validation - ensure it starts with a valid diagram type  
    const validStart = [
      'graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram', 
      'erDiagram', 'gantt', 'pie', 'stateDiagram'
    ].some(start => cleaned.trim().startsWith(start));
    
    // If it doesn't start with a valid diagram type, try to add one
    if (!validStart) {
      // Check if it looks like a class diagram
      if (cleaned.includes('class ') || cleaned.includes(' --> ')) {
        cleaned = 'classDiagram\n' + cleaned;
      } 
      // Check if it looks like a flow chart
      else if (cleaned.includes('-->') || cleaned.includes('---')) {
        cleaned = 'flowchart TD\n' + cleaned;
      }
    }
    
    return cleaned;
  };
  
  // Download SVG function
  export const downloadSVG = (ref, filename) => {
    if (!ref || !ref.current) {
      console.error("No reference provided for SVG download");
      return false;
    }
    
    const svgElement = ref.current.querySelector("svg");
    if (svgElement) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } else {
      console.error("No SVG element found to download.");
      return false;
    }
  };