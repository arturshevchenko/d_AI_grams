// import React, { useEffect, useRef, useState } from "react";
// import mermaid from "mermaid";
// import "./App.css";
// import SYSTEM_FIRST_PROMPT from "./prompts/systemFirstPrompt";
// import SYSTEM_SECOND_PROMPT from "./prompts/systemSecondPrompt";
// import SYSTEM_THIRD_PROMPT from "./prompts/systemThirdPrompt";

// // Initialize Mermaid (disable auto-render on page load)
// mermaid.initialize({ startOnLoad: false });

// function App() {
//   const [treeStructure, setTreeStructure] = useState("");
//   const [importsStructure, setImportsStructure] = useState("");
//   const [readmeFile, setReadmeFile] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [copyFeedback, setCopyFeedback] = useState({ show: false, text: "" });
//   const [diagramsGenerated, setDiagramsGenerated] = useState(false);

//   // First diagram states
//   const [firstDiagramDefinition, setFirstDiagramDefinition] = useState("");
//   const [isEditingFirstDiagram, setIsEditingFirstDiagram] = useState(false);
//   const [editedFirstDiagramText, setEditedFirstDiagramText] = useState("");
//   const [isFirstTextAreaVisible, setIsFirstTextAreaVisible] = useState(false);

//   // Second diagram states
//   const [secondDiagramDefinition, setSecondDiagramDefinition] = useState("");
//   const [isEditingSecondDiagram, setIsEditingSecondDiagram] = useState(false);
//   const [editedSecondDiagramText, setEditedSecondDiagramText] = useState("");
//   const [isSecondTextAreaVisible, setIsSecondTextAreaVisible] = useState(false);

//   // Separate refs for each diagram
//   const firstDiagramRef = useRef(null);
//   const secondDiagramRef = useRef(null);

//   const fileTreeCommand = `find . -type f \
//         -not -path "*/node_modules/*" \
//         -not -path "*/venv/*" \
//         -not -path "*/htmlcov/*"  \
//         -not -path "*/__pycache__/*"  \
//         -not -path "*/\\.*" \
//         | sed 's|^\\./||' \
//         | sort \
//         | sed 's/^/    "/;s/$/"/' \
//         | (echo "[" && cat && echo "]") \
//         | sed '$!s/$/,/' \
//     `;

//   const importsCommand = `find . -type f \\( -iname "*.java" -o -iname "*.py" -o -iname "*.js" -o -iname "*.ts" -o -iname "*.go" \\
//     -o -iname "*.cpp" -o -iname "*.cxx" -o -iname "*.cc" -o -iname "*.h" -o -iname "*.hpp" \\
//     -o -iname "*.kt" -o -iname "*.kts" \\) \\
// ! -path "*/node_modules/*" \\
// ! -path "*/venv/*" \\
// ! -path "*/env/*" \\
// ! -path "*/.*" \\
// -print0 | xargs -0 grep -H -E '^\\s*(import|from|#include)'
// `;

//   const copyToClipboard = (command, buttonName) => {
//     navigator.clipboard
//       .writeText(command)
//       .then(() => {
//         // Show toast notification
//         setCopyFeedback({
//           show: true,
//           text: `${buttonName} copied to clipboard!`,
//         });

//         // Hide notification after 3 seconds
//         setTimeout(() => {
//           setCopyFeedback({ show: false, text: "" });
//         }, 3000);
//       })
//       .catch((err) => {
//         console.error("Failed to copy: ", err);
//         setCopyFeedback({
//           show: true,
//           text: "Failed to copy to clipboard",
//         });

//         setTimeout(() => {
//           setCopyFeedback({ show: false, text: "" });
//         }, 3000);
//       });
//   };

//   const pasteFromClipboard = async (setFunction) => {
//     try {
//       const text = await navigator.clipboard.readText();
//       setFunction(text);
//     } catch (err) {
//       console.error("Failed to paste: ", err);
//       setCopyFeedback({
//         show: true,
//         text: "Failed to paste from clipboard",
//       });
//       setTimeout(() => {
//         setCopyFeedback({ show: false, text: "" });
//       }, 3000);
//     }
//   };

//   // Helper function to call OpenAI API
//   const callOpenAI = async (payload) => {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.REACT_APP_OPEN_API_API_KEY}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`API call failed with status: ${response.status}`);
//     }

//     return await response.json();
//   };

//   // Helper function to clean and format diagram definition
//   const cleanDiagramDefinition = (rawDefinition) => {
//     return rawDefinition
//       .replace(/(\\n)+/g, "\n")
//       .replace(/\\"/g, '"')
//       .replace('""', '"uses"')
//       .replace(/\|\s+"/g, '|"')
//       .replace(/\bstyle\b/g, "style1")
//       .replace(/\|""\|/g, '|"uses"|')
//       .replace(/"\s+\|/g, '"|')
//       .replace(/```/g, '')
//       .replace(/mermaid/g, '');
//   };

//   const generateDiagram = async () => {
//     try {
//       setIsLoading(true);

//       // First API call - analyze code structure
//       const firstCallResponse = await callOpenAI({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: SYSTEM_FIRST_PROMPT },
//           {
//             role: "user",
//             content: `<file_tree> ${treeStructure} </file_tree> 
//             <readme> ${readmeFile} </readme> 
//             <imports> ${importsStructure} </imports>`,
//           },
//         ],
//         temperature: 0.7,
//       });

//       const firstReply = firstCallResponse.choices[0].message.content;

//       // Second API call - generate first diagram from explanation
//       const secondCallResponse = await callOpenAI({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: SYSTEM_SECOND_PROMPT },
//           {
//             role: "user",
//             content: `<explanation> ${firstReply} </explanation>`,
//           },
//         ],
//         temperature: 0.7,
//       });

//       const secondReply = secondCallResponse.choices[0].message.content;

//       // Third API call - generate second diagram from explanation
//       const thirdCallResponse = await callOpenAI({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: SYSTEM_THIRD_PROMPT },
//           {
//             role: "user",
//             content: `<file_tree> ${treeStructure} </file_tree> 
//             <readme> ${readmeFile} </readme> 
//             <imports> ${importsStructure} </imports>
//             <explanation> ${firstReply} </explanation>`,
//           },
//         ],
//         temperature: 0.7,
//       });

//       const thirdReply = thirdCallResponse.choices[0].message.content;

//       // Process the first diagram definition
//       const cleanedFirstDiagram = cleanDiagramDefinition(secondReply);
//       setFirstDiagramDefinition(cleanedFirstDiagram);
//       setEditedFirstDiagramText(cleanedFirstDiagram);

//       // Process the second diagram definition
//       const cleanedSecondDiagram = cleanDiagramDefinition(thirdReply);
//       setSecondDiagramDefinition(cleanedSecondDiagram);
//       setEditedSecondDiagramText(cleanedSecondDiagram);

//       // Set diagrams as generated
//       setDiagramsGenerated(true);
//     } catch (error) {
//       console.error("Error generating diagram:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // First diagram functions
//   const toggleFirstTextArea = (editing = false) => {
//     setIsFirstTextAreaVisible(true);
//     setIsEditingFirstDiagram(editing);
//   };

//   const applyFirstChanges = () => {
//     if (isEditingFirstDiagram) {
//       setFirstDiagramDefinition(editedFirstDiagramText);
//     }
//     setIsFirstTextAreaVisible(false);
//     setIsEditingFirstDiagram(false);
//   };

//   // Second diagram functions
//   const toggleSecondTextArea = (editing = false) => {
//     setIsSecondTextAreaVisible(true);
//     setIsEditingSecondDiagram(editing);
//   };

//   const applySecondChanges = () => {
//     if (isEditingSecondDiagram) {
//       setSecondDiagramDefinition(editedSecondDiagramText);
//     }
//     setIsSecondTextAreaVisible(false);
//     setIsEditingSecondDiagram(false);
//   };

//   // Render first diagram when its state changes
//   useEffect(() => {
//     if (firstDiagramDefinition && firstDiagramRef.current) {
//       firstDiagramRef.current.innerHTML = "";

//       // Create the Mermaid diagram container
//       const mermaidDiv = document.createElement("div");
//       mermaidDiv.className = "mermaid";
//       mermaidDiv.innerHTML = firstDiagramDefinition;

//       // Append the Mermaid diagram to the container
//       firstDiagramRef.current.appendChild(mermaidDiv);

//       // Render the Mermaid diagram
//       mermaid.run();
//     }
//   }, [firstDiagramDefinition]);

//   // Render second diagram when its state changes
//   useEffect(() => {
//     if (secondDiagramDefinition && secondDiagramRef.current) {
//       secondDiagramRef.current.innerHTML = "";

//       // Create the Mermaid diagram container
//       const mermaidDiv = document.createElement("div");
//       mermaidDiv.className = "mermaid";
//       mermaidDiv.innerHTML = secondDiagramDefinition;

//       // Append the Mermaid diagram to the container
//       secondDiagramRef.current.appendChild(mermaidDiv);

//       // Render the Mermaid diagram
//       mermaid.run();
//     }
//   }, [secondDiagramDefinition]);

//   return (
//     <div className="app-container">
//       <h1 className="title">Diagram Generator</h1>

//       {/* Toast notification */}
//       {copyFeedback.show && (
//         <div className="toast-notification">{copyFeedback.text}</div>
//       )}

//       <div className="input-container">
//         <div className="copy-container">
//           <p className="instruction-text">
//             Paste this command in terminal to get file tree:
//           </p>
//           <p className="copy-text">{fileTreeCommand}</p>
//           <div className="button-group">
//             <button
//               onClick={() =>
//                 copyToClipboard(fileTreeCommand, "File tree command")
//               }
//               className="copy-button"
//             >
//               Copy
//             </button>
//             <button
//               onClick={() => pasteFromClipboard(setTreeStructure)}
//               className="paste-button"
//             >
//               Paste
//             </button>
//           </div>
//         </div>

//         <textarea
//           placeholder="Enter tree structure here..."
//           value={treeStructure}
//           onChange={(e) => setTreeStructure(e.target.value)}
//           className="input-area"
//         />

//         <textarea
//           placeholder="Enter readme content here..."
//           value={readmeFile}
//           onChange={(e) => setReadmeFile(e.target.value)}
//           className="input-area"
//         />

//         <div className="copy-container">
//           <p className="instruction-text">
//             Paste this command in terminal to get imports:
//           </p>
//           <p className="copy-text">{importsCommand}</p>
//           <div className="button-group">
//             <button
//               onClick={() => copyToClipboard(importsCommand, "Imports command")}
//               className="copy-button"
//             >
//               Copy
//             </button>
//             <button
//               onClick={() => pasteFromClipboard(setImportsStructure)}
//               className="paste-button"
//             >
//               Paste
//             </button>
//           </div>
//         </div>

//         <textarea
//           placeholder="Enter imports here..."
//           value={importsStructure}
//           onChange={(e) => setImportsStructure(e.target.value)}
//           className="input-area"
//         />

//         <button
//           onClick={generateDiagram}
//           className="generate-button"
//           disabled={isLoading}
//         >
//           {isLoading ? "Generating..." : "Generate Diagrams"}
//         </button>
//       </div>

//       {isLoading && <div className="loader"></div>}

//       {/* Diagram container sections - only shown after generation */}
//       {diagramsGenerated && (
//         <div className="diagrams-section">
//           <div className="diagram-wrapper">
//             <h2>First Diagram</h2>
//             <div className="button-group">
//               <button
//                 onClick={() => toggleFirstTextArea(false)}
//                 className="show-raw-button"
//               >
//                 Show Diagram as RAW Text
//               </button>
//               <button
//                 onClick={() => toggleFirstTextArea(true)}
//                 className="edit-button"
//               >
//                 Edit Diagram
//               </button>
//               <button
//                 onClick={() => {
//                   const svgElement =
//                     firstDiagramRef.current.querySelector("svg");
//                   if (svgElement) {
//                     const serializer = new XMLSerializer();
//                     const svgString = serializer.serializeToString(svgElement);
//                     const blob = new Blob([svgString], {
//                       type: "image/svg+xml",
//                     });
//                     const url = URL.createObjectURL(blob);

//                     const link = document.createElement("a");
//                     link.href = url;
//                     link.download = `diagram-first.svg`;
//                     document.body.appendChild(link);
//                     link.click();
//                     document.body.removeChild(link);
//                     URL.revokeObjectURL(url);
//                   } else {
//                     console.error("No SVG element found to download.");
//                   }
//                 }}
//                 className="download-button"
//               >
//                 Download SVG
//               </button>
//             </div>

//             {/* First diagram text area directly under buttons */}
//             {isFirstTextAreaVisible && (
//               <div className="textarea-container">
//                 <textarea
//                   value={editedFirstDiagramText}
//                   onChange={(e) => setEditedFirstDiagramText(e.target.value)}
//                   readOnly={!isEditingFirstDiagram}
//                   className="diagram-textarea"
//                 />
//                 {isEditingFirstDiagram ? (
//                   <button onClick={applyFirstChanges} className="apply-button">
//                     Apply Changes
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => setIsFirstTextAreaVisible(false)}
//                     className="close-button"
//                   >
//                     Close
//                   </button>
//                 )}
//               </div>
//             )}

//             <div ref={firstDiagramRef} className="diagram-display" />
//           </div>

//           <div className="diagram-wrapper">
//             <h2>Second Diagram</h2>
//             <div className="button-group">
//               <button
//                 onClick={() => toggleSecondTextArea(false)}
//                 className="show-raw-button"
//               >
//                 Show Diagram as RAW Text
//               </button>
//               <button
//                 onClick={() => toggleSecondTextArea(true)}
//                 className="edit-button"
//               >
//                 Edit Diagram
//               </button>
//               <button
//                 onClick={() => {
//                   const svgElement =
//                     secondDiagramRef.current.querySelector("svg");
//                   if (svgElement) {
//                     const serializer = new XMLSerializer();
//                     const svgString = serializer.serializeToString(svgElement);
//                     const blob = new Blob([svgString], {
//                       type: "image/svg+xml",
//                     });
//                     const url = URL.createObjectURL(blob);

//                     const link = document.createElement("a");
//                     link.href = url;
//                     link.download = `diagram-second.svg`;
//                     document.body.appendChild(link);
//                     link.click();
//                     document.body.removeChild(link);
//                     URL.revokeObjectURL(url);
//                   } else {
//                     console.error("No SVG element found to download.");
//                   }
//                 }}
//                 className="download-button"
//               >
//                 Download SVG
//               </button>
//             </div>

//             {/* Second diagram text area directly under buttons */}
//             {isSecondTextAreaVisible && (
//               <div className="textarea-container">
//                 <textarea
//                   value={editedSecondDiagramText}
//                   onChange={(e) => setEditedSecondDiagramText(e.target.value)}
//                   readOnly={!isEditingSecondDiagram}
//                   className="diagram-textarea"
//                 />
//                 {isEditingSecondDiagram ? (
//                   <button onClick={applySecondChanges} className="apply-button">
//                     Apply Changes
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => setIsSecondTextAreaVisible(false)}
//                     className="close-button"
//                   >
//                     Close
//                   </button>
//                 )}
//               </div>
//             )}

//             <div ref={secondDiagramRef} className="diagram-display" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
