/**
 * src/tools/abx.ts — MCP tools for the ABX / Extensibility domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  AbxActionListSchema, AbxActionGetSchema,
  AbxActionRunSchema, AbxActionGetRunSchema,
  AbxActionCreateSchema, AbxActionUpdateSchema, AbxActionDeleteSchema,
  AbxActionCreateVersionSchema, AbxActionReleaseSchema,
  AbxRunCancelSchema,
  AbxSecretCreateSchema, AbxSecretUpdateSchema, AbxSecretDeleteSchema,
} from '../schemas/abx.js';
import {
  apiListAbxActions, apiGetAbxAction,
  apiRunAbxAction, apiGetAbxRun,
  apiCreateAbxAction, apiUpdateAbxAction, apiDeleteAbxAction,
  apiCreateAbxActionVersion, apiReleaseAbxAction, apiCancelAbxRun,
  apiCreateAbxSecret, apiUpdateAbxSecret, apiDeleteAbxSecret,
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

  // ── vcf_abx_action_create ─────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_action_create',
      description:
        'Create a new ABX (Action Based Extensibility) action. ' +
        'Spec: POST /abx/api/resources/actions. ' +
        'Supply inline source code via the "source" field or reference stored content via "contentId".',
      inputSchema: {
        type: 'object',
        required: ['name', 'runtime', 'entrypoint', 'actionType'],
        properties: {
          name:           { type: 'string', description: 'Action name' },
          runtime:        { type: 'string', description: 'Runtime identifier, e.g. "python3", "nodejs", "powershell"' },
          entrypoint:     { type: 'string', description: 'Entrypoint function, e.g. "handler.handler"' },
          actionType:     { type: 'string', description: 'Action type, e.g. "SCRIPT", "FLOW"' },
          source:         { type: 'string', description: 'Inline source code string' },
          description:    { type: 'string' },
          projectId:      { type: 'string', description: 'Project UUID' },
          orgId:          { type: 'string', description: 'Organisation ID (usually inferred)' },
          memoryInMB:     { type: 'number', description: 'Memory limit in MB' },
          timeoutSeconds: { type: 'number', description: 'Execution timeout in seconds' },
          dependencies:   { type: 'string', description: 'Newline-separated package specs' },
          runtimeVersion: { type: 'string', description: 'Runtime minor version, e.g. "3.10"' },
          inputs:         { type: 'object', additionalProperties: true, description: 'Default input key-value map' },
          shared:         { type: 'boolean' },
          scalable:       { type: 'boolean' },
          asyncDeployed:  { type: 'boolean' },
          metadata:       { type: 'object', additionalProperties: true },
          configuration:  { type: 'object', additionalProperties: true },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiCreateAbxAction(AbxActionCreateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_action_update ─────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_action_update',
      description:
        'Update an existing ABX action. ' +
        'Spec: PUT /abx/api/resources/actions/{id}. ' +
        'Replaces the full action body — supply all required fields.',
      inputSchema: {
        type: 'object',
        required: ['actionId', 'name', 'runtime', 'entrypoint', 'actionType'],
        properties: {
          actionId:       { type: 'string', description: 'ABX Action UUID to update' },
          name:           { type: 'string' },
          runtime:        { type: 'string' },
          entrypoint:     { type: 'string' },
          actionType:     { type: 'string' },
          source:         { type: 'string', description: 'Inline source code string' },
          description:    { type: 'string' },
          projectId:      { type: 'string' },
          orgId:          { type: 'string' },
          memoryInMB:     { type: 'number' },
          timeoutSeconds: { type: 'number' },
          dependencies:   { type: 'string' },
          runtimeVersion: { type: 'string' },
          inputs:         { type: 'object', additionalProperties: true },
          shared:         { type: 'boolean' },
          scalable:       { type: 'boolean' },
          asyncDeployed:  { type: 'boolean' },
          metadata:       { type: 'object', additionalProperties: true },
          configuration:  { type: 'object', additionalProperties: true },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiUpdateAbxAction(AbxActionUpdateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_action_delete ─────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_action_delete',
      description:
        'DESTRUCTIVE: Permanently delete an ABX action. ' +
        'Spec: DELETE /abx/api/resources/actions/{id}. ' +
        'This cannot be undone.',
      inputSchema: {
        type: 'object',
        required: ['actionId'],
        properties: {
          actionId: { type: 'string', description: 'ABX Action UUID to delete' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        await apiDeleteAbxAction(AbxActionDeleteSchema.parse(args));
        return ok({ success: true, message: 'ABX action deleted.' });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_action_create_version ─────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_action_create_version',
      description:
        'Create a named version snapshot for an ABX action. ' +
        'Spec: POST /abx/api/resources/actions/{id}/versions. ' +
        'Use this to pin a stable point before releasing.',
      inputSchema: {
        type: 'object',
        required: ['actionId', 'name'],
        properties: {
          actionId:    { type: 'string', description: 'ABX Action UUID' },
          name:        { type: 'string', description: 'Version label, e.g. "v1.0.0"' },
          description: { type: 'string', description: 'Version description' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiCreateAbxActionVersion(AbxActionCreateVersionSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_action_release ────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_action_release',
      description:
        'Mark a specific version of an ABX action as the released version. ' +
        'Spec: PUT /abx/api/resources/actions/{id}/release. ' +
        'The version must have been created with vcf_abx_action_create_version.',
      inputSchema: {
        type: 'object',
        required: ['actionId', 'version'],
        properties: {
          actionId: { type: 'string', description: 'ABX Action UUID' },
          version:  { type: 'string', description: 'Version name to release, e.g. "v1.0.0"' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiReleaseAbxAction(AbxActionReleaseSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_run_cancel ────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_run_cancel',
      description:
        'Cancel an in-progress ABX action run. ' +
        'Spec: PATCH /abx/api/resources/action-runs/{id}/cancel. ' +
        'Only runs in a running or queued state can be cancelled.',
      inputSchema: {
        type: 'object',
        required: ['runId'],
        properties: {
          runId: { type: 'string', description: 'Action run UUID to cancel' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiCancelAbxRun(AbxRunCancelSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_secret_create ─────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_secret_create',
      description:
        'Create a new ABX action secret for use as an action input. ' +
        'Spec: POST /abx/api/resources/action-secrets. ' +
        'Secret values are encrypted at rest; the value is not returned on retrieval.',
      inputSchema: {
        type: 'object',
        required: ['name'],
        properties: {
          name:      { type: 'string', description: 'Unique secret name within the organisation' },
          value:     { type: 'object', additionalProperties: true, description: 'Secret value envelope' },
          encrypted: { type: 'boolean', description: 'Whether the value is pre-encrypted' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiCreateAbxSecret(AbxSecretCreateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_secret_update ─────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_secret_update',
      description:
        'Update an existing ABX action secret. ' +
        'Spec: PUT /abx/api/resources/action-secrets/{id}.',
      inputSchema: {
        type: 'object',
        required: ['secretId'],
        properties: {
          secretId:  { type: 'string', description: 'Secret UUID to update' },
          name:      { type: 'string', description: 'New secret name' },
          value:     { type: 'object', additionalProperties: true, description: 'New secret value envelope' },
          encrypted: { type: 'boolean' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiUpdateAbxSecret(AbxSecretUpdateSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },

  // ── vcf_abx_secret_delete ─────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_abx_secret_delete',
      description:
        'DESTRUCTIVE: Permanently delete an ABX action secret. ' +
        'Spec: DELETE /abx/api/resources/action-secrets/{id}. ' +
        'Actions that reference this secret will fail at runtime after deletion.',
      inputSchema: {
        type: 'object',
        required: ['secretId'],
        properties: {
          secretId: { type: 'string', description: 'Secret UUID to delete' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        await apiDeleteAbxSecret(AbxSecretDeleteSchema.parse(args));
        return ok({ success: true, message: 'ABX secret deleted.' });
      }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
