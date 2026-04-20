/**
 * src/tools/blueprints.ts — MCP tools for the Blueprints domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  BlueprintListSchema, BlueprintGetSchema, BlueprintCreateSchema,
  BlueprintUpdateSchema, BlueprintDeleteSchema, BlueprintValidateSchema,
  BlueprintListVersionsSchema,
} from '../schemas/blueprints.js';
import {
  apiListBlueprints, apiGetBlueprint, apiCreateBlueprint,
  apiUpdateBlueprint, apiDeleteBlueprint, apiValidateBlueprint,
  apiListBlueprintVersions,
} from '../api/blueprints.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const BLUEPRINT_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_blueprint_list',
      description: 'List VCF Automation blueprints, optionally filtered by project.',
      inputSchema: {
        type: 'object',
        properties: {
          page:     { type: 'number', description: 'Zero-based page index (default: 0)' },
          size:     { type: 'number', description: 'Page size (default: 20, max: 200)' },
          sort:     { type: 'string', description: 'Sort, e.g. "updatedAt,DESC"' },
          name:     { type: 'string', description: 'Filter by exact name' },
          search:   { type: 'string', description: 'Search by name and description' },
          projects: { type: 'array', items: { type: 'string' }, description: 'Filter by project IDs' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListBlueprints(BlueprintListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_blueprint_get',
      description: 'Get details and YAML content of a single blueprint.',
      inputSchema: {
        type: 'object', required: ['blueprintId'],
        properties: { blueprintId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetBlueprint(BlueprintGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_blueprint_create',
      description: 'Create a new blueprint with YAML content.',
      inputSchema: {
        type: 'object', required: ['name', 'projectId', 'content'],
        properties: {
          name: { type: 'string' }, description: { type: 'string' },
          projectId: { type: 'string' },
          content: { type: 'string', description: 'Blueprint YAML' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiCreateBlueprint(BlueprintCreateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_blueprint_update',
      description: 'Update an existing blueprint (name, description, or YAML content).',
      inputSchema: {
        type: 'object', required: ['blueprintId'],
        properties: {
          blueprintId: { type: 'string' },
          name: { type: 'string' }, description: { type: 'string' },
          content: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiUpdateBlueprint(BlueprintUpdateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_blueprint_delete',
      description: 'DESTRUCTIVE: Delete a blueprint. Cannot delete if active deployments reference it.',
      inputSchema: {
        type: 'object', required: ['blueprintId'],
        properties: { blueprintId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        await apiDeleteBlueprint(BlueprintDeleteSchema.parse(args));
        return ok({ success: true });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_blueprint_validate',
      description: 'Validate blueprint YAML without saving. Returns errors, warnings, and info messages.',
      inputSchema: {
        type: 'object', required: ['content'],
        properties: {
          content: { type: 'string', description: 'Blueprint YAML to validate' },
          projectId: { type: 'string', description: 'Project context for constraint evaluation' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiValidateBlueprint(BlueprintValidateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_blueprint_list_versions',
      description: 'List version history of a blueprint.',
      inputSchema: {
        type: 'object', required: ['blueprintId'],
        properties: {
          blueprintId: { type: 'string' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListBlueprintVersions(BlueprintListVersionsSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
