/** Template content for home distribution files */

export function getEnvTemplate({ repositorySearch = false, basePath = "" }) {
  const pathLine = basePath
    ? `GITPAGEDOCS_PATH=${basePath}`
    : `# GITPAGEDOCS_PATH=gi-page-docs`;
  return `# GitPageDocs - Local development
# Set to "true" to enable the search aggregator home.
GITPAGEDOCS_REPOSITORY_SEARCH=${String(repositorySearch)}

# Base path (when GITPAGEDOCS_REPOSITORY_SEARCH=false).
# Example: localhost:3000/gi-page-docs
${pathLine}
`;
}

export function getDockerfileTemplate() {
  return `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
}

export function getReadmeTemplate({ outputDir = "gitpagedocshome" }) {
  const cdDir = outputDir === "." || outputDir === "./" ? "." : outputDir;
  return `# GitPageDocs Home

Pre-built GitPageDocs static site by Vidigal-code.

## Quick start

\`\`\`bash
npx serve .
\`\`\`

## Docker

\`\`\`bash
docker build -t gitpagedocshome .
docker run -p 3000:80 gitpagedocshome
\`\`\`

## Credits

Powered by Vidigal-code - https://github.com/Vidigal-code/git-page-docs
`;
}
