/**
 * src/tools/catalog.ts — MCP tools for the Catalog domain
 *
 * Tools:
 *   vcf_catalog_list_items  — GET /catalog/api/items
 *   vcf_catalog_get_item    — GET /catalog/api/items/{id}
 *   vcf_catalog_request     — POST /catalog/api/items/{id}/request
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  CatalogListItemsSchema,
  CatalogGetItemSchema,
  CatalogRequestSchema,
} from '../schemas/catalog.js';
import {
  apiListCatalogItems,
  apiGetCatalogItem,
  apiRequestCatalogItem,
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
      description:
        'List Service Catalog items available to the current user. Uses Spring Pageable pagination (page/size/sort).',
      inputSchema: {
        type: 'object',
        properties: {
          projects: { type: 'string', description: 'Comma-separated project UUIDs to filter by' },
          search: { type: 'string', description: 'Partial name search' },
          page: { type: 'number', description: 'Zero-based page index (default 0)' },
          size: { type: 'number', description: 'Items per page (default 20)' },
          sort: { type: 'string', description: "Sort criteria, e.g. 'name,ASC'" },
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
        'Request a Service Catalog item to create a deployment. ' +
        'Spec: POST /catalog/api/items/{id}/request. ' +
        'Returns an array with deploymentId and deploymentName for each created deployment.',
      inputSchema: {
        type: 'object',
        required: ['catalogItemId', 'deploymentName', 'projectId'],
        properties: {
          catalogItemId: { type: 'string', description: 'Catalog item UUID (path parameter)' },
          version: { type: 'string', description: 'Catalog item version (omit for latest)' },
          deploymentName: { type: 'string', minLength: 1, maxLength: 900, description: 'Name for the resulting deployment' },
          projectId: { type: 'string', description: 'Target project UUID' },
          inputs: { type: 'object', additionalProperties: true, description: 'Catalog item input parameters' },
          reason: { type: 'string', maxLength: 10240, description: 'Request reason' },
          bulkRequestCount: { type: 'number', description: 'Number of deployments to create (default 1)' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        const result = await apiRequestCatalogItem(CatalogRequestSchema.parse(args));
        return ok(result);
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
