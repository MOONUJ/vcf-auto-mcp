/**
 * src/tools/iaas.ts — MCP tools for the Cloud Assembly (IaaS) domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  IaasMachineListSchema, IaasMachineGetSchema,
  IaasNetworkListSchema, IaasNetworkGetSchema,
} from '../schemas/iaas.js';
import {
  apiListMachines, apiGetMachine,
  apiListNetworks, apiGetNetwork,
} from '../api/iaas.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const IAAS_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_iaas_machine_list',
      description: 'List virtual machines managed by VCF Cloud Assembly. Uses OData pagination ($top/$skip).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Filter by project UUID' },
          deploymentId: { type: 'string', description: 'Filter by deployment UUID' },
          $top: { type: 'number', description: 'Max items to return' },
          $skip: { type: 'number', description: 'Items to skip' },
          $filter: { type: 'string', description: 'OData filter expression' },
          $orderby: { type: 'string', description: 'Sort field' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListMachines(IaasMachineListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_iaas_machine_get',
      description: 'Get details of a single Cloud Assembly machine.',
      inputSchema: {
        type: 'object', required: ['machineId'],
        properties: { machineId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetMachine(IaasMachineGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_iaas_network_list',
      description: 'List networks managed by VCF Cloud Assembly. Uses OData pagination ($top/$skip).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Filter by project UUID' },
          $top: { type: 'number', description: 'Max items to return' },
          $skip: { type: 'number', description: 'Items to skip' },
          $filter: { type: 'string', description: 'OData filter expression' },
          $orderby: { type: 'string', description: 'Sort field' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListNetworks(IaasNetworkListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_iaas_network_get',
      description: 'Get details of a single Cloud Assembly network.',
      inputSchema: {
        type: 'object', required: ['networkId'],
        properties: { networkId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetNetwork(IaasNetworkGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
