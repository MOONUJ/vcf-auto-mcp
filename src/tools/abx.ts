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
      description: 'List ABX (Action Based Extensibility) actions.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
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
      description: 'Poll the status and output of an ABX action run.',
      inputSchema: {
        type: 'object', required: ['actionId', 'runId'],
        properties: {
          actionId: { type: 'string' }, runId: { type: 'string' },
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
