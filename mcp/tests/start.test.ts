import { describe, it, expect, vi, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  createServer: vi.fn(),
  connect: vi.fn(async () => {}),
  transports: [] as object[],
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: class FakeStdioServerTransport {
    constructor() {
      mocks.transports.push(this);
    }
  },
}));
vi.mock("../src/server", () => ({ createServer: mocks.createServer }));

import { startMcpServer } from "../src/start";

afterEach(() => {
  mocks.createServer.mockReset();
  mocks.connect.mockClear();
  mocks.transports.length = 0;
});

describe("startMcpServer", () => {
  it("builds the server for the given root and connects it over a stdio transport", async () => {
    mocks.createServer.mockReturnValue({ connect: mocks.connect });

    await startMcpServer("/some/project");

    expect(mocks.createServer).toHaveBeenCalledWith("/some/project");
    expect(mocks.transports).toHaveLength(1);
    expect(mocks.connect).toHaveBeenCalledWith(mocks.transports[0]);
  });

  it("defaults the root to the current working directory", async () => {
    mocks.createServer.mockReturnValue({ connect: mocks.connect });
    await startMcpServer();
    expect(mocks.createServer).toHaveBeenCalledWith(process.cwd());
  });

  it("propagates a transport failure to the caller", async () => {
    mocks.createServer.mockReturnValue({
      connect: vi.fn(async () => {
        throw new Error("stdio closed");
      }),
    });
    await expect(startMcpServer("/r")).rejects.toThrow("stdio closed");
  });
});
