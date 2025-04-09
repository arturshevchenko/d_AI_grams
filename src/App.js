import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import "./App.css";
import SYSTEM_FIRST_PROMPT from "./prompts/systemFirstPrompt";
import SYSTEM_THIRD_PROMPT from "./prompts/systemThirdPrompt";

// Initialize Mermaid (disable auto-render on page load)
mermaid.initialize({ startOnLoad: false });

function App() {
  const [treeStructure, setTreeStructure] = useState("");
  const [importsStructure, setImportsStructure] = useState("");
  const [readmeFile, setReadmeFile] = useState("");
  const [diagramDefinition, setDiagramDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingDiagram, setIsEditingDiagram] = useState(false);
  const [editedDiagramText, setEditedDiagramText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState({ show: false, text: "" });
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

  // Function to redraw the diagram with edited text
  const redrawDiagram = () => {
    setDiagramDefinition(editedDiagramText);
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    if (isEditingDiagram) {
      // If we're exiting edit mode, update the diagram with edited text
      redrawDiagram();
    }
    setIsEditingDiagram(!isEditingDiagram);
  };

  useEffect(() => {
    if (diagramDefinition && diagramRef.current) {
      // Clear the previous content
      diagramRef.current.innerHTML = "";

      // Create a container for the Mermaid diagram
      const diagramContainer = document.createElement("div");
      diagramContainer.className = "diagram-container";

      // Create the edit container
      const editContainer = document.createElement("div");
      editContainer.className = "edit-container";

      // Create a button to toggle edit mode
      const editButton = document.createElement("button");
      editButton.textContent = isEditingDiagram ? "Apply Changes" : "Edit Diagram";
      editButton.className = "edit-button";
      editButton.onclick = toggleEditMode;

      // Create the edit area or view area based on edit mode
      if (isEditingDiagram) {
        const editTextArea = document.createElement("textarea");
        editTextArea.className = "edit-textarea";
        editTextArea.value = editedDiagramText;
        editTextArea.addEventListener("input", (e) => {
          setEditedDiagramText(e.target.value);
        });
        
        // Create additional button for applying changes without exiting edit mode
        const applyButton = document.createElement("button");
        applyButton.textContent = "Apply Without Exiting";
        applyButton.className = "apply-button";
        applyButton.onclick = redrawDiagram;
        
        editContainer.appendChild(editTextArea);
        editContainer.appendChild(document.createElement("br"));
        editContainer.appendChild(editButton);
        editContainer.appendChild(applyButton);
      } else {
        // Create a collapsible container for the raw text view
        const collapsibleContainer = document.createElement("div");
        collapsibleContainer.className = "collapsible-container";

        // Create a button to toggle the collapsible content
        const toggleButton = document.createElement("button");
        toggleButton.textContent = "Show/Hide Raw Text";
        toggleButton.className = "toggle-button";
        toggleButton.onclick = () => {
          const content = collapsibleContainer.querySelector(".collapsible-content");
          if (content.style.display === "none" || !content.style.display) {
            content.style.display = "block";
          } else {
            content.style.display = "none";
          }
        };

        // Create the collapsible content for the raw text
        const collapsibleContent = document.createElement("div");
        collapsibleContent.className = "collapsible-content";
        collapsibleContent.style.display = "none"; // Initially hidden
        collapsibleContent.textContent = diagramDefinition;

        // Append the button and content to the collapsible container
        collapsibleContainer.appendChild(toggleButton);
        collapsibleContainer.appendChild(collapsibleContent);
        collapsibleContainer.appendChild(editButton);

        editContainer.appendChild(collapsibleContainer);
      }

      // Create the Mermaid diagram container
      const mermaidDiagram = document.createElement("div");
      mermaidDiagram.className = "mermaid";
      mermaidDiagram.innerHTML = diagramDefinition;

      // Append the edit container to diagramRef
      diagramRef.current.appendChild(editContainer);
      
      if (!isEditingDiagram) {
        // Only append and render diagram if not in edit mode
        diagramContainer.appendChild(mermaidDiagram);
        diagramRef.current.appendChild(diagramContainer);
        // Render the Mermaid diagram
        mermaid.run();
      }
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
          <button
            onClick={() => copyToClipboard(fileTreeCommand, "File tree command")}
            className="copy-button"
          >
            Copy
          </button>
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
          <button
            onClick={() => copyToClipboard(importsCommand, "Imports command")}
            className="copy-button"
          >
            Copy
          </button>
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
      <div ref={diagramRef} className="diagram-container" />
    </div>
  );
}

export default App;