/**
 * src/tools/abx.ts — MCP tools for the ABX / Extensibility domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  AbxActionListSchema, AbxActionGetSchema,
  AbxActionRunSchema, AbxActionGetRunSchema,
} from '../schemas/abx.js';
import {
  apiListAbxActions, apiGetAbxAction,
  apiRunAbxAction, apiGetAbxRun,
} from '../api/abx.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const ABX_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_abx_action_list',
      description: 'List ABX (Action Based Extensibility) actions. Uses Spring Pageable pagination (page/size/sort).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Filter by project UUID' },
          page: { type: 'number', description: 'Zero-based page index (default 0)' },
          size: { type: 'number', description: 'Items per page (default 20)' },
          sort: { type: 'string', description: "Sort criteria, e.g. 'name,ASC'" },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListAbxActions(AbxActionListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_abx_action_get',
      description: 'Get details of a single ABX action.',
      inputSchema: {
        type: 'object', required: ['actionId'],
        properties: { actionId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetAbxAction(AbxActionGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_abx_action_run',
      description: 'Execute an ABX action (async). Returns runId for polling with vcf_abx_action_get_run.',
      inputSchema: {
        type: 'object', required: ['actionId'],
        properties: {
          actionId: { type: 'string' },
          inputs: { type: 'object', additionalProperties: true },
          projectId: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        const result = await apiRunAbxAction(AbxActionRunSchema.parse(args));
        return ok({ ...result, _hint: 'Poll with vcf_abx_action_get_run' });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_abx_action_get_run',
      description: 'Poll the status and output of an ABX action run. Spec: GET /abx/api/resources/action-runs/{id}.',
      inputSchema: {
        type: 'object', required: ['runId'],
        properties: {
          runId: { type: 'string', description: 'Action run UUID returned by vcf_abx_action_run' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetAbxRun(AbxActionGetRunSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
