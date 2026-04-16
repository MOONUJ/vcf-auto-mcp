/**
 * src/tools/resources.ts — MCP tools for the Resources domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  ResourceListSchema,
  ResourceGetSchema,
  ResourceListActionsSchema,
  ResourceRunActionSchema,
} from '../schemas/resources.js';
import {
  apiListResources,
  apiGetResource,
  apiListResourceActions,
  apiRunResourceAction,
} from '../api/resources.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const RESOURCE_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_resource_list',
      description: 'List provisioned resources within a deployment.',
      inputSchema: {
        type: 'object',
        required: ['deploymentId'],
        properties: {
          deploymentId: { type: 'string' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListResources(ResourceListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_resource_get',
      description: 'Get details of a single resource within a deployment.',
      inputSchema: {
        type: 'object',
        required: ['deploymentId', 'resourceId'],
        properties: {
          deploymentId: { type: 'string' },
          resourceId: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetResource(ResourceGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_resource_list_actions',
      description: 'List available Day-2 actions for a specific resource.',
      inputSchema: {
        type: 'object',
        required: ['deploymentId', 'resourceId'],
        properties: {
          deploymentId: { type: 'string' },
          resourceId: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListResourceActions(ResourceListActionsSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_resource_run_action',
      description: 'Execute a Day-2 action on a specific resource (async). Returns requestId.',
      inputSchema: {
        type: 'object',
        required: ['deploymentId', 'resourceId', 'actionId'],
        properties: {
          deploymentId: { type: 'string' },
          resourceId: { type: 'string' },
          actionId: { type: 'string' },
          inputs: { type: 'object', additionalProperties: true },
          reason: { type: 'string', maxLength: 512 },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiRunResourceAction(ResourceRunActionSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
