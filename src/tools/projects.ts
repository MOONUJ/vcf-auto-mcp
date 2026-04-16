/**
 * src/tools/projects.ts — MCP tools for the Projects domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  ProjectListSchema,
  ProjectGetSchema,
  ProjectCreateSchema,
  ProjectUpdateSchema,
  ProjectDeleteSchema,
} from '../schemas/projects.js';
import {
  apiListProjects,
  apiGetProject,
  apiCreateProject,
  apiUpdateProject,
  apiDeleteProject,
} from '../api/projects.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const PROJECT_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_project_list',
      description: 'List VCF Automation projects.',
      inputSchema: {
        type: 'object',
        properties: {
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListProjects(ProjectListSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_project_get',
      description: 'Get details of a single VCF Automation project.',
      inputSchema: {
        type: 'object',
        required: ['projectId'],
        properties: { projectId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetProject(ProjectGetSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_project_create',
      description: 'Create a new VCF Automation project. At least one administrator is required.',
      inputSchema: {
        type: 'object',
        required: ['name', 'administrators'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 256 },
          description: { type: 'string', maxLength: 1024 },
          administrators: {
            type: 'array',
            items: { type: 'object', required: ['email', 'type'],
              properties: { email: { type: 'string' }, type: { type: 'string', enum: ['user', 'group'] } } },
            minItems: 1,
          },
          members: { type: 'array', items: { type: 'object' } },
          viewers: { type: 'array', items: { type: 'object' } },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiCreateProject(ProjectCreateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_project_update',
      description: 'Update an existing project (name, description, members).',
      inputSchema: {
        type: 'object',
        required: ['projectId'],
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string', maxLength: 256 },
          description: { type: 'string', maxLength: 1024 },
          administrators: { type: 'array', items: { type: 'object' } },
          members: { type: 'array', items: { type: 'object' } },
          viewers: { type: 'array', items: { type: 'object' } },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiUpdateProject(ProjectUpdateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_project_delete',
      description: 'DESTRUCTIVE: Delete a VCF Automation project. All deployments in the project must be deleted first.',
      inputSchema: {
        type: 'object',
        required: ['projectId'],
        properties: { projectId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        await apiDeleteProject(ProjectDeleteSchema.parse(args));
        return ok({ success: true, message: 'Project deleted successfully.' });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
