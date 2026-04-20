/**
 * src/tools/governance.ts — MCP tools for the Governance domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { GovernanceGetQuotaSchema, GovernanceUpdateQuotaSchema } from '../schemas/governance.js';
import { apiGetProjectQuota, apiUpdateProjectQuota } from '../api/governance.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const GOVERNANCE_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_governance_get_quota',
      description: 'Get project governance settings: placement constraints, custom properties, operation timeout, and shared resource policy.',
      inputSchema: {
        type: 'object', required: ['projectId'],
        properties: { projectId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetProjectQuota(GovernanceGetQuotaSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_governance_update_quota',
      description: 'Update project governance settings: placement constraints, custom properties, operation timeout, and shared resource policy.',
      inputSchema: {
        type: 'object', required: ['projectId'],
        properties: {
          projectId: { type: 'string' },
          constraints: { type: 'object', description: 'Deployment placement constraints (zone, network, storage)' },
          properties:  { type: 'object', description: 'Custom project properties (key-value)' },
          operationTimeout: { type: 'number', description: 'Operation timeout in minutes (0 = no timeout)' },
          sharedResources: { type: 'boolean', description: 'Allow members to share resources' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiUpdateProjectQuota(GovernanceUpdateQuotaSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
