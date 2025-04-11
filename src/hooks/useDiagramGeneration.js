// hooks/useDualDiagramGeneration.js
import { useState, useCallback } from "react";
import SYSTEM_FIRST_PROMPT from "../prompts/systemFirstPrompt";
import SYSTEM_SECOND_PROMPT from "../prompts/systemSecondPrompt";
import SYSTEM_THIRD_PROMPT from "../prompts/systemSecondPrompt";

// Helper function to call OpenAI API
const callOpenAI = async (payload) => {
  // if (payload.messages[0].content === SYSTEM_FIRST_PROMPT) {
  //   return {
  //     choices: [
  //       {
  //         message: {
  //           content: `<explanation>qweqweqwe</explanation>`,
  //         },
  //       },
  //     ],
  //   };
  // }

  // if (payload.messages[0].content === SYSTEM_SECOND_PROMPT) {
  //   return {
  //     choices: [
  //       {
  //         message: {
  //           content:
  //             'flowchart TD\n    %% Global entities\n    A["App.js"]:::component\n    B["CommandCopySection"]:::component\n    C["DiagramEditor"]:::component\n    D["Toast"]:::component\n    E["useDiagramGeneration"]:::hook\n    F["useToast"]:::hook\n    G["public directory"]:::assets\n    H["index.html"]:::assets\n\n    %% Connections\n    A -->|"renders"| B\n    A -->|"renders"| C\n    A -->|"renders"| D\n    A -->|"uses"| E\n    A -->|"uses"| F\n    G -->|"contains"| H\n\n    %% Styles\n    classDef component fill:#f9f,stroke:#333,stroke-width:2px;\n    classDef hook fill:#bbf,stroke:#333,stroke-width:2px;\n    classDef assets fill:#bfb,stroke:#333,stroke-width:2px;\n\n    %% Click Events\n    click A "src/App.js"\n    click B "src/components/CommandCopySection.js"\n    click C "src/components/DiagramEditor.js"\n    click D "src/components/Toast.js"\n    click E "src/hooks/useDiagramGeneration.js"\n    click F "src/hooks/useToast.js"\n    click G "public/"\n    click H "public/index.html"',
  //         },
  //       },
  //     ],
  //   };
  // }

  // if (payload.messages[0].content === SYSTEM_THIRD_PROMPT) {
  //   return {
  //     choices: [
  //       {
  //         message: {
  //           content:
  //             'flowchart TD\n    subgraph "Components Layer"\n        A1["src/components/CommandCopySection.js"]:::component\n        A2["src/components/DiagramEditor.js"]:::component\n        A3["src/components/Toast.js"]:::component\n    end\n\n    subgraph "Hooks Layer"\n        B1["src/hooks/useDiagramGeneration.js"]:::hook\n        B2["src/hooks/useToast.js"]:::hook\n    end\n\n    subgraph "Prompts Layer"\n        C1["src/prompts/systemFirstPrompt.js"]:::prompt\n        C2["src/prompts/systemThirdPrompt.js"]:::prompt\n    end\n\n    subgraph "Main Layer"\n        D1["src/App.js"]:::main\n        D2["src/App.css"]:::style\n        D3["src/index.js"]:::main\n        D4["src/reportWebVitals.js"]:::utility\n        D5["src/setupTests.js"]:::test\n        D6["src/index.css"]:::style\n        D7["src/logo.svg"]:::image\n        D8["src/App.test.js"]:::test\n    end\n\n    D1 -->|"imports"| A1\n    D1 -->|"imports"| A2\n    D1 -->|"imports"| A3\n    D1 -->|"imports"| B1\n    D1 -->|"imports"| B2\n    D1 -->|"imports"| C1\n    D1 -->|"imports"| C2\n    D3 -->|"imports"| D1\n    D4 -->|"utility functions"| D1\n    D5 -->|"tests"| D1\n    D8 -->|"tests"| D1\n\n    classDef component fill:#bfb,stroke:#333,stroke-width:2px;\n    classDef hook fill:#ffb,stroke:#333,stroke-width:2px;\n    classDef prompt fill:#bff,stroke:#333,stroke-width:2px;\n    classDef main fill:#fbf,stroke:#333,stroke-width:2px;\n    classDef style fill:#ffb3b3,stroke:#333,stroke-width:2px;\n    classDef utility fill:#b3b3ff,stroke:#333,stroke-width:2px;\n    classDef test fill:#ffffb3,stroke:#333,stroke-width:2px;\n    classDef image fill:#ffb3ff,stroke:#333,stroke-width:2px;',
  //         },
  //       },
  //     ],
  //   };
  // }

  try {
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
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};

// Helper function to clean and format diagram definition
const cleanDiagramDefinition = (rawDefinition) => {
  return rawDefinition
    .replace(/(\\n)+/g, "\n")
    .replace(/\\"/g, '"')
    .replace('""', '"uses"')
    .replace(/\|\s+"/g, '|"')
    .replace(/"\s+\|/g, '"|')
    .replace(/\bstyle\b/g, "style1")
    .replace(/\|\s*['"]([^'"]+)['"]/g, "| $1");
};

export const useDualDiagramGeneration = ({
  treeStructure,
  importsStructure,
  readmeFile,
  SYSTEM_FIRST_PROMPT,
  SYSTEM_SECOND_PROMPT,
  SYSTEM_THIRD_PROMPT,
}) => {
  const [primaryDiagramDefinition, setPrimaryDiagramDefinition] = useState("");
  const [secondaryDiagramDefinition, setSecondaryDiagramDefinition] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateDiagrams = useCallback(async () => {
    try {
      setIsLoading(true);

      // First API call - analyze code structure (this is shared between both diagrams)
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

      // Create both diagrams in parallel for efficiency
      const [secondCallResponse, thirdCallResponse] = await Promise.all([
        // Second API call - generate secondary diagram
        callOpenAI({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_SECOND_PROMPT },
            {
              role: "user",
              content: `<explanation> ${firstReply} </explanation>`,
            },
          ],
          temperature: 0.7,
        }),

        // Third API call - generate primary diagram
        callOpenAI({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_THIRD_PROMPT },
            {
              role: "user",
              content: `<file_tree> ${treeStructure} </file_tree> 
            <readme> ${readmeFile} </readme> 
            <imports> ${importsStructure} </imports>`,
            },
          ],
          temperature: 0.7,
        }),
      ]);

      const secondReply = secondCallResponse.choices[0].message.content;
      const thirdReply = thirdCallResponse.choices[0].message.content;

      // Process the diagram definitions
      const cleanedPrimaryDiagram = cleanDiagramDefinition(thirdReply);
      const cleanedSecondaryDiagram = cleanDiagramDefinition(secondReply);

      setPrimaryDiagramDefinition(cleanedPrimaryDiagram);
      setSecondaryDiagramDefinition(cleanedSecondaryDiagram);
    } catch (error) {
      console.error("Error generating diagrams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    treeStructure,
    readmeFile,
    importsStructure,
    SYSTEM_FIRST_PROMPT,
    SYSTEM_SECOND_PROMPT,
    SYSTEM_THIRD_PROMPT,
  ]);

  return {
    primaryDiagramDefinition,
    secondaryDiagramDefinition,
    isLoading,
    generateDiagrams,
  };
};
