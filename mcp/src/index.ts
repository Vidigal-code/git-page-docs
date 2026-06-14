// @gitpagedocs/mcp — Model Context Protocol server for Git Page Docs.
//
// Tools and resources are thin: they delegate to @gitpagedocs/tools (the shared
// core). Launch with `gitpagedocs mcp start` or the bin entry.
export { createServer, SERVER_INFO } from "./server";
export { startMcpServer } from "./start";
export { ServerContext } from "./context";
