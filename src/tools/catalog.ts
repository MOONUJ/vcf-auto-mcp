/**
 * src/tools/catalog.ts — MCP tools for the Catalog domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  CatalogListItemsSchema,
  CatalogGetItemSchema,
  CatalogRequestSchema,
  CatalogListRequestsSchema,
  CatalogGetRequestSchema,
} from '../schemas/catalog.js';
import {
  apiListCatalogItems,
  apiGetCatalogItem,
  apiRequestCatalogItem,
  apiListCatalogRequests,
  apiGetCatalogRequest,
} from '../api/catalog.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const CATALOG_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_catalog_list_items',
      description: 'List Service Catalog items available to the current user.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Filter by project UUID' },
          search: { type: 'string', description: 'Partial name search' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListCatalogItems(CatalogListItemsSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_catalog_get_item',
      description: 'Get details of a single Service Catalog item.',
      inputSchema: {
        type: 'object',
        required: ['catalogItemId'],
        properties: {
          catalogItemId: { type: 'string', description: 'Catalog item UUID' },
          projectId: { type: 'string', description: 'Project context for version resolution' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetCatalogItem(CatalogGetItemSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_catalog_request',
      description:
        'Request a Service Catalog item (async). Returns requestId for polling with vcf_catalog_get_request.',
      inputSchema: {
        type: 'object',
        required: ['catalogItemId', 'deploymentName', 'projectId'],
        properties: {
          catalogItemId: { type: 'string' },
          catalogItemVersion: { type: 'string' },
          deploymentName: { type: 'string', minLength: 1, maxLength: 256 },
          projectId: { type: 'string' },
          inputs: { type: 'object', additionalProperties: true },
          reason: { type: 'string', maxLength: 512 },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        const result = await apiRequestCatalogItem(CatalogRequestSchema.parse(args));
        return ok({ ...result, _hint: 'Poll with vcf_catalog_get_request' });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_catalog_list_requests',
      description: 'List Service Catalog requests.',
      inputSchema: {
        type: 'object',
        properties: {
          catalogItemId: { type: 'string' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListCatalogRequests(CatalogListRequestsSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_catalog_get_request',
      description: 'Poll the status of a Service Catalog request.',
      inputSchema: {
        type: 'object',
        required: ['requestId'],
        properties: { requestId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetCatalogRequest(CatalogGetRequestSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
