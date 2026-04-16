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
      description: 'Get current resource quota usage and limits for a project.',
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
      description: 'Update CPU, memory, storage, or instance count limits for a project. Set to 0 for unlimited.',
      inputSchema: {
        type: 'object', required: ['projectId'],
        properties: {
          projectId: { type: 'string' },
          cpuLimit: { type: 'number', minimum: 0, description: 'vCPU limit (0 = unlimited)' },
          memoryLimitMb: { type: 'number', minimum: 0 },
          storageGbLimit: { type: 'number', minimum: 0 },
          instanceCountLimit: { type: 'number', minimum: 0 },
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
