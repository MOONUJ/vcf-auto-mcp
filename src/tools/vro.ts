/**
 * src/tools/vro.ts — MCP tools for the Orchestrator (vRO) domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  VroWorkflowListSchema, VroWorkflowGetSchema, VroWorkflowExecuteSchema,
  VroExecutionGetSchema, VroExecutionListSchema,
} from '../schemas/vro.js';
import {
  apiListVroWorkflows, apiGetVroWorkflow, apiExecuteVroWorkflow,
  apiGetVroExecution, apiListVroExecutions,
} from '../api/vro.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const VRO_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_vro_workflow_list',
      description: 'List vRO workflows, optionally filtered by category or name.',
      inputSchema: {
        type: 'object',
        properties: {
          categoryName: { type: 'string' }, nameFilter: { type: 'string' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListVroWorkflows(VroWorkflowListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_vro_workflow_get',
      description: 'Get details and parameter schema of a vRO workflow.',
      inputSchema: {
        type: 'object', required: ['workflowId'],
        properties: { workflowId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetVroWorkflow(VroWorkflowGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_vro_workflow_execute',
      description:
        'Execute a vRO workflow (async). Returns executionId for polling with vcf_vro_execution_get.',
      inputSchema: {
        type: 'object', required: ['workflowId'],
        properties: {
          workflowId: { type: 'string' },
          inputParameters: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'type', 'value'],
              properties: {
                name: { type: 'string' }, type: { type: 'string' }, value: {},
              },
            },
            description: 'Typed input parameters for the workflow',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        const result = await apiExecuteVroWorkflow(VroWorkflowExecuteSchema.parse(args));
        return ok({ ...result, _hint: 'Poll with vcf_vro_execution_get' });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_vro_execution_get',
      description: 'Poll the status and output parameters of a vRO workflow execution.',
      inputSchema: {
        type: 'object', required: ['workflowId', 'executionId'],
        properties: {
          workflowId: { type: 'string' }, executionId: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetVroExecution(VroExecutionGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_vro_execution_list',
      description: 'List execution history for a vRO workflow.',
      inputSchema: {
        type: 'object', required: ['workflowId'],
        properties: {
          workflowId: { type: 'string' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListVroExecutions(VroExecutionListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
