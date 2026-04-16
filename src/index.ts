/**
 * src/index.ts — Entry point
 *
 * Loads environment variables, validates config, connects the MCP server
 * to Claude Desktop via StdioServerTransport, and starts listening.
 */

import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer, logToolRegistration } from './server.js';
import { config } from './config.js';

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  logToolRegistration();
  await server.connect(transport);

  // Write startup diagnostics to stderr only — stdout is reserved for MCP frames
  process.stderr.write(
    `[vcf-auto-mcp] Server started — base=${config.VCF_BASE_URL} org=${config.VCF_ORG}\n`,
  );
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[vcf-auto-mcp] Fatal startup error: ${message}\n`);
  process.exit(1);
});
