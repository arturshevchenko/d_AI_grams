import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import "./App.css";
import SYSTEM_FIRST_PROMPT from "./prompts/systemFirstPrompt";
import SYSTEM_THIRD_PROMPT from "./prompts/systemSecondPrompt";

// Initialize Mermaid (disable auto-render on page load)
mermaid.initialize({ startOnLoad: false });

function App() {
  const [treeStructure, setTreeStructure] = useState("");
  const [importsStructure, setImportsStructure] = useState("");
  const [readmeFile, setReadmeFile] = useState("");
  const [diagramDefinition, setDiagramDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingDiagram] = useState(false);
  const [editedDiagramText, setEditedDiagramText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState({ show: false, text: "" });
  const [isTextAreaVisible, setIsTextAreaVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const diagramRef = useRef(null);

  const fileTreeCommand = `find . -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/venv/*" \
        -not -path "*/htmlcov/*"  \
        -not -path "*/__pycache__/*"  \
        -not -path "*/\\.*" \
        | sed 's|^\\./||' \
        | sort \
        | sed 's/^/    "/;s/$/"/' \
        | (echo "[" && cat && echo "]") \
        | sed '$!s/$/,/' \
    `;

  const importsCommand = `find . -type f \\( -iname "*.java" -o -iname "*.py" -o -iname "*.js" -o -iname "*.ts" -o -iname "*.go" \\
    -o -iname "*.cpp" -o -iname "*.cxx" -o -iname "*.cc" -o -iname "*.h" -o -iname "*.hpp" \\
    -o -iname "*.kt" -o -iname "*.kts" \\) \\
! -path "*/node_modules/*" \\
! -path "*/venv/*" \\
! -path "*/env/*" \\
! -path "*/.*" \\
-print0 | xargs -0 grep -H -E '^\\s*(import|from|#include)'
`;

  const copyToClipboard = (command, buttonName) => {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        // Show toast notification
        setCopyFeedback({ 
          show: true, 
          text: `${buttonName} copied to clipboard!` 
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setCopyFeedback({ show: false, text: "" });
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setCopyFeedback({ 
          show: true, 
          text: "Failed to copy to clipboard" 
        });
        
        setTimeout(() => {
          setCopyFeedback({ show: false, text: "" });
        }, 3000);
      });
  };

  const pasteFromClipboard = async (setFunction) => {
    try {
      const text = await navigator.clipboard.readText();
      setFunction(text);
    } catch (err) {
      console.error("Failed to paste: ", err);
      setCopyFeedback({ 
        show: true, 
        text: "Failed to paste from clipboard" 
      });
      setTimeout(() => {
        setCopyFeedback({ show: false, text: "" });
      }, 3000);
    }
  };

  // Helper function to call OpenAI API
  const callOpenAI = async (payload) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPEN_API_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    return await response.json();
  };
  
  // Helper function to clean and format diagram definition
  const cleanDiagramDefinition = (rawDefinition) => {
    return rawDefinition
      .replace(/(\\n)+/g, "\n")
      .replace(/\\"/g, '"')
      .replace('""', '"uses"')
      .replace(/\|\s+"/g, '|"')
      .replace(/"\s+\|/g, '"|');
  };

  const generateDiagram = async () => {
    try {
      setIsLoading(true);
      
      // First API call - analyze code structure
      const firstCallResponse = await callOpenAI({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_FIRST_PROMPT },
          {
            role: "user",
            content: `<file_tree> ${treeStructure} </file_tree> 
            <readme> ${readmeFile} </readme> 
            <imports> ${importsStructure} </imports>`,
          },
        ],
        temperature: 0.7,
      });
      
      const firstReply = firstCallResponse.choices[0].message.content;
      
      // Second API call - generate diagram from explanation
      const secondCallResponse = await callOpenAI({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_THIRD_PROMPT },
          {
            role: "user",
            content: `<explanation> ${firstReply} </explanation>`,
          },
        ],
        temperature: 0.7,
      });
      
      const secondReply = secondCallResponse.choices[0].message.content;
      
      // Process the diagram definition
      const cleanedDiagram = cleanDiagramDefinition(secondReply);
      
      setDiagramDefinition(cleanedDiagram);
      setEditedDiagramText(cleanedDiagram);
    } catch (error) {
      console.error("Error generating diagram:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTextArea = (editing = false) => {
    setIsTextAreaVisible(true);
    setIsEditing(editing);
  };

  const applyChanges = () => {
    if (isEditing) {
      setDiagramDefinition(editedDiagramText);
    }
    setIsTextAreaVisible(false);
    setIsEditing(false);
  };

  useEffect(() => {
    if (diagramDefinition && diagramRef.current) {
      // Clear the previous content
      diagramRef.current.innerHTML = "";

      // Create a container for the Mermaid diagram
      const diagramContainer = document.createElement("div");
      diagramContainer.className = "diagram-container";

      // Create the Show RAW Text button
      const showRawButton = document.createElement("button");
      showRawButton.textContent = "Show Diagram as RAW Text";
      showRawButton.className = "show-raw-button";
      showRawButton.onclick = () => toggleTextArea(false);

      // Create the Edit Diagram button
      const editButton = document.createElement("button");
      editButton.textContent = "Edit Diagram";
      editButton.className = "edit-button";
      editButton.onclick = () => toggleTextArea(true);

      // Create the Download SVG button
      const downloadButton = document.createElement("button");
      downloadButton.textContent = "Download SVG";
      downloadButton.className = "download-button";
      downloadButton.onclick = () => {
        const svgElement = diagramRef.current.querySelector("svg");
        if (svgElement) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgElement);
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = "diagram.svg";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          console.error("No SVG element found to download.");
        }
      };

      // Append the buttons to the diagram container
      diagramContainer.appendChild(showRawButton);
      diagramContainer.appendChild(editButton);
      diagramContainer.appendChild(downloadButton);

      // Create the Mermaid diagram container
      const mermaidDiagram = document.createElement("div");
      mermaidDiagram.className = "mermaid";
      mermaidDiagram.innerHTML = diagramDefinition;

      // Append the Mermaid diagram to the container
      diagramContainer.appendChild(mermaidDiagram);

      // Append the diagram container to the diagramRef
      diagramRef.current.appendChild(diagramContainer);

      // Render the Mermaid diagram
      mermaid.run();
    }
  }, [diagramDefinition, isEditingDiagram, editedDiagramText]);

  return (
    <div className="app-container">
      <h1 className="title">Diagram Generator</h1>

      {/* Toast notification */}
      {copyFeedback.show && (
        <div className="toast-notification">
          {copyFeedback.text}
        </div>
      )}

      <div className="input-container">
        <div className="copy-container">
          <p className="instruction-text">
            Paste this command in terminal to get file tree:
          </p>
          <p className="copy-text">{fileTreeCommand}</p>
          <div className="button-group">
            <button
              onClick={() => copyToClipboard(fileTreeCommand, "File tree command")}
              className="copy-button"
            >
              Copy
            </button>
            <button
              onClick={() => pasteFromClipboard(setTreeStructure)}
              className="paste-button"
            >
              Paste
            </button>
          </div>
        </div>
        <textarea
          placeholder="Enter tree structure here..."
          value={treeStructure}
          onChange={(e) => setTreeStructure(e.target.value)}
          className="input-area"
        />
        <textarea
          placeholder="Enter readme content here..."
          value={readmeFile}
          onChange={(e) => setReadmeFile(e.target.value)}
          className="input-area"
        />
        <div className="copy-container">
          <p className="instruction-text">
            Paste this command in terminal to get imports:
          </p>
          <p className="copy-text">{importsCommand}</p>
          <div className="button-group">
            <button
              onClick={() => copyToClipboard(importsCommand, "Imports command")}
              className="copy-button"
            >
              Copy
            </button>
            <button
              onClick={() => pasteFromClipboard(setImportsStructure)}
              className="paste-button"
            >
              Paste
            </button>
          </div>
        </div>
        <textarea
          placeholder="Enter imports here..."
          value={importsStructure}
          onChange={(e) => setImportsStructure(e.target.value)}
          className="input-area"
        />
        <button
          onClick={generateDiagram}
          className="generate-button"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Diagram"}
        </button>
      </div>
      {isLoading && <div className="loader"></div>}
      {isTextAreaVisible && (
        <div className="textarea-container">
          <textarea
            value={editedDiagramText}
            onChange={(e) => setEditedDiagramText(e.target.value)}
            readOnly={!isEditing}
            className="diagram-textarea"
          />
          {isEditing && (
            <button onClick={applyChanges} className="apply-button">
              Apply Changes
            </button>
          )}
          {!isEditing && (
            <button onClick={() => setIsTextAreaVisible(false)} className="close-button">
              Close
            </button>
          )}
        </div>
      )}
      <div ref={diagramRef} className="diagram-container" />
    </div>
  );
}

export default App;