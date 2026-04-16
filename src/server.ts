/**
 * src/server.ts — MCP Server factory + tool registration
 *
 * Creates the McpServer instance and registers all 47 tools from 10 domains.
 * Tool dispatch follows a Map<name, handler> lookup for O(1) routing.
 *
 * Adding a new domain:
 *   1. Import its ToolEntry array
 *   2. Spread it into ALL_TOOLS
 *   3. No other changes needed
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// ─── Domain tool registries ───────────────────────────────────────────────────
import { AUTH_TOOLS } from './tools/auth.js';
import { DEPLOYMENT_TOOLS } from './tools/deployments.js';
import { CATALOG_TOOLS } from './tools/catalog.js';
import { RESOURCE_TOOLS } from './tools/resources.js';
import { PROJECT_TOOLS } from './tools/projects.js';
import { BLUEPRINT_TOOLS } from './tools/blueprints.js';
import { IAAS_TOOLS } from './tools/iaas.js';
import { ABX_TOOLS } from './tools/abx.js';
import { VRO_TOOLS } from './tools/vro.js';
import { GOVERNANCE_TOOLS } from './tools/governance.js';
import { APPROVAL_TOOLS } from './tools/approval.js';
import type { ToolEntry } from './tools/deployments.js';

// ─── Aggregate all tools ──────────────────────────────────────────────────────

const ALL_TOOLS: ToolEntry[] = [
  ...AUTH_TOOLS,        //  1 tool
  ...DEPLOYMENT_TOOLS,  //  7 tools  (includes vcf_deployment_list, _get, _create, _update, _delete, _get_status, _run_action)
  ...CATALOG_TOOLS,     //  5 tools
  ...RESOURCE_TOOLS,    //  4 tools
  ...PROJECT_TOOLS,     //  5 tools
  ...BLUEPRINT_TOOLS,   //  7 tools  (list, get, create, update, delete, validate, list_versions)
  ...IAAS_TOOLS,        //  4 tools
  ...ABX_TOOLS,         //  4 tools
  ...VRO_TOOLS,         //  5 tools
  ...GOVERNANCE_TOOLS,  //  2 tools
  ...APPROVAL_TOOLS,    //  3 tools
];

// O(1) dispatch map
const HANDLER_MAP = new Map<string, (args: unknown) => Promise<CallToolResult>>(
  ALL_TOOLS.map((entry) => [entry.definition.name, entry.handler]),
);

// ─── Server factory ───────────────────────────────────────────────────────────

export function createServer(): Server {
  const server = new Server(
    { name: 'vcf-auto-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  // ── list_tools ──────────────────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS.map((entry) => entry.definition),
  }));

  // ── call_tool ───────────────────────────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = HANDLER_MAP.get(name);
    if (!handler) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: "${name}". Available tools: ${[...HANDLER_MAP.keys()].join(', ')}`,
      );
    }

    try {
      return await handler(args ?? {});
    } catch (err: unknown) {
      // Re-throw McpErrors directly so the MCP layer serializes them correctly
      if (err instanceof McpError) throw err;

      // Unexpected errors: sanitize before surfacing
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[vcf-auto-mcp] Unhandled error in tool "${name}": ${msg}\n`);
      throw new McpError(
        ErrorCode.InternalError,
        `Internal error in tool "${name}": ${msg}`,
      );
    }
  });

  return server;
}

// ─── Tool count validation (compile-time documentation) ─────────────────────
// Expected: 47 tools. Actual count logged at startup.
export function logToolRegistration(): void {
  process.stderr.write(
    `[vcf-auto-mcp] Registered ${ALL_TOOLS.length} tools across 10 domains\n`,
  );
  if (ALL_TOOLS.length !== 47) {
    process.stderr.write(
      `[vcf-auto-mcp] WARNING: Expected 47 tools, got ${ALL_TOOLS.length}\n`,
    );
  }
}
