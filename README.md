# Diagram Generator

Diagram Generator is a web-based application designed to generate system design diagrams using [Mermaid.js](https://mermaid-js.github.io/). 
It allows users to input project file structures, README content, and internal imports to generate visual representations of project architecture and dependencies.

## Demo

![Demo](/demo.gif)
[Download Video](/demo.mp4)

## Features

- **Mermaid.js Integration**: Generate diagrams in Mermaid.js format.
- **Customizable Diagrams**: Edit and apply changes to generated diagrams.
- **Clipboard Support**: Copy and paste commands or content directly from/to the application.
- **Local Storage**: Automatically save and load inputs and generated diagrams.
- **Responsive Design**: Works seamlessly across devices.
- **Toast Notifications**: Provides feedback for user actions like copying, pasting, and generating diagrams.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [License](#license)

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/your-username/diagram-generator.git
   cd diagram-generator/frontend/diagram_frontend
```
2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory based on the .env_example file:

```bash
cp .env_example .env
```

4. Add your OpenAI API key to the .env file:
`REACT_APP_OPEN_API_API_KEY=your_openai_api_key`
5. Start the development server:
```bash
npm start
```
6. Open the application in your browser at http://localhost:3000.


## Usage
1. Input File Tree: Paste the file tree structure of your project into the "File Tree" section.
2. Input README Content: Paste the content of your project's README file into the "README Content" section.
3. Input Imports: Paste the internal imports of your project into the "Imports" section.
4. Generate Diagrams: Click the "Generate Diagrams" button to create system design diagrams.
5. Edit Diagrams: Use the "Edit Diagram" button to modify the generated diagrams.
6. Download Diagrams: Save the diagrams as SVG files using the "Download SVG" button.

## Commands
The following commands can be used to extract the required inputs for the application:

#### File Tree Command
```bash
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/venv/*" \
    -not -path "*/htmlcov/*"  \
    -not -path "*/__pycache__/*"  \
    -not -path "*/\\.*" \
    | sed 's|^\\./||' \
    | sort \
    | sed 's/^/    "/;s/$/"/' \
    | (echo "[" && cat && echo "]") \
    | sed '$!s/$/,/'
```

#### Imports Command
```bash
find . -type f \( -iname "*.java" -o -iname "*.py" -o -iname "*.js" -o -iname "*.ts" -o -iname "*.go" \
    -o -iname "*.cpp" -o -iname "*.cxx" -o -iname "*.cc" -o -iname "*.h" -o -iname "*.hpp" \
    -o -iname "*.kt" -o -iname "*.kts" \) \
! -path "*/node_modules/*" \
! -path "*/venv/*" \
! -path "*/env/*" \
! -path "*/.*" \
-print0 | xargs -0 grep -H -E '^\\s*(import|from|#include)'
```

## Project Structure
```
diagram_frontend/
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   ├── containers/        # Feature-specific containers
│   ├── context/           # React context for state management
│   ├── hooks/             # Custom React hooks
│   ├── prompts/           # Prompt templates for OpenAI API
│   ├── services/          # API and storage services
│   ├── styles/            # Global and modular CSS styles
│   ├── utils/             # Utility functions
│   ├── [App.js](http://_vscodecontentref_/0)             # Main application component
│   ├── [index.js](http://_vscodecontentref_/1)           # Entry point
├── .env_example           # Example environment variables
├── [package.json](http://_vscodecontentref_/2)           # Project metadata and dependencies
└── [README.md](http://_vscodecontentref_/3)              # Project documentation
```


## Technologies Used
- Frontend: React, CSS Modules
- Diagram Rendering: Mermaid.js
- State Management: React Context API
- API Integration: OpenAI API
- Build Tool: React Scripts
- Testing: React Testing Library, Jest

## License
This project is licensed under the MIT License. See the LICENSE file for details.

