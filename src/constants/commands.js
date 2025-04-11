export const COMMANDS = {
  fileTree: `find . -type f \
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
    `,
  imports: `find . -type f \\( -iname "*.java" -o -iname "*.py" -o -iname "*.js" -o -iname "*.ts" -o -iname "*.go" \\
    -o -iname "*.cpp" -o -iname "*.cxx" -o -iname "*.cc" -o -iname "*.h" -o -iname "*.hpp" \\
    -o -iname "*.kt" -o -iname "*.kts" \\) \\
! -path "*/node_modules/*" \\
! -path "*/venv/*" \\
! -path "*/env/*" \\
! -path "*/.*" \\
-print0 | xargs -0 grep -H -E '^\\s*(import|from|#include)'
  `,
};
