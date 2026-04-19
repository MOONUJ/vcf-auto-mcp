/**
 * src/tools/vroVco.ts — MCP tools for the direct vRO API (/vco/api/) domain
 *
 * Implements 12 tools backed by the native vRO REST API:
 *   vcf_vro_direct_workflow_list    — GET  /vco/api/workflows
 *   vcf_vro_direct_workflow_get     — GET  /vco/api/workflows/{id}
 *   vcf_vro_direct_workflow_execute — POST /vco/api/workflows/{id}/executions
 *   vcf_vro_direct_execution_list   — GET  /vco/api/workflows/{id}/executions
 *   vcf_vro_direct_execution_get    — GET  /vco/api/workflows/{id}/executions/{execId}
 *   vcf_vro_direct_execution_logs   — GET  /vco/api/workflows/{id}/executions/{execId}/logs
 *   vcf_vro_direct_category_list    — GET  /vco/api/categories
 *   vcf_vro_direct_category_get     — GET  /vco/api/categories/{id}
 *   vcf_vro_direct_action_list      — GET  /vco/api/actions
 *   vcf_vro_direct_action_get       — GET  /vco/api/actions/{id}
 *   vcf_vro_direct_package_list     — GET  /vco/api/packages
 *   vcf_vro_direct_package_get      — GET  /vco/api/packages/{name}
 *
 * These tools differ from VRO_TOOLS in that they call the native /vco/api/
 * endpoint directly, bypassing the OrchestratorGateway. The response shape
 * follows the VCO "link" envelope (normalised to {items, total}).
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  VcoWorkflowListSchema,
  VcoWorkflowGetSchema,
  VcoWorkflowExecuteSchema,
  VcoExecutionListSchema,
  VcoExecutionGetSchema,
  VcoExecutionLogsSchema,
  VcoCategoryListSchema,
  VcoCategoryGetSchema,
  VcoActionListSchema,
  VcoActionGetSchema,
  VcoPackageListSchema,
  VcoPackageGetSchema,
} from '../schemas/vroVco.js';
import {
  apiVcoListWorkflows,
  apiVcoGetWorkflow,
  apiVcoExecuteWorkflow,
  apiVcoListExecutions,
  apiVcoGetExecution,
  apiVcoGetExecutionLogs,
  apiVcoListCategories,
  apiVcoGetCategory,
  apiVcoListActions,
  apiVcoGetAction,
  apiVcoListPackages,
  apiVcoGetPackage,
} from '../api/vroVco.js';
import type { ToolEntry } from './deployments.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

// ─── Tool registry ────────────────────────────────────────────────────────────

export const VRO_VCO_TOOLS: ToolEntry[] = [

  // ── vcf_vro_direct_workflow_list ─────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_workflow_list',
      description:
        'List vRO workflows directly from the native vRO API (/vco/api/workflows). ' +
        'Uses VCO-style pagination (maxResult + startIndex). ' +
        'Optionally filter by categoryId or workflow name substring. ' +
        'Returns a normalised {items, total} object where each item contains ' +
        'the flattened VCO attributes (id, name, href, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          maxResult: {
            type: 'number',
            description: 'Maximum number of results to return (1–1000, default: 25)',
          },
          startIndex: {
            type: 'number',
            description: '0-based start index for pagination (default: 0)',
          },
          categoryId: {
            type: 'string',
            description: 'Filter workflows by category UUID',
          },
          name: {
            type: 'string',
            description: 'Filter workflows by name (substring match)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoListWorkflows(VcoWorkflowListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_workflow_get ──────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_workflow_get',
      description:
        'Get a single vRO workflow definition directly from the native vRO API ' +
        '(/vco/api/workflows/{id}). ' +
        'Returns the full workflow detail including name, version, category-id, ' +
        'and the input-parameters array (each with name and type).',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'vRO Workflow UUID',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoGetWorkflow(VcoWorkflowGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_workflow_execute ──────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_workflow_execute',
      description:
        'Execute a vRO workflow directly via the native vRO API ' +
        '(POST /vco/api/workflows/{id}/executions). ' +
        'Supply typed parameters using the VCO value envelope: ' +
        '{"name":"p","type":"string","value":{"string":{"value":"v"}}}. ' +
        'Returns the created execution record; use vcf_vro_direct_execution_get ' +
        'to poll for completion.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'vRO Workflow UUID to execute',
          },
          parameters: {
            type: 'array',
            description:
              'Input parameters in VCO envelope format. ' +
              'Each item: {name, type, value} where value uses type-keyed nesting, ' +
              'e.g. {"string":{"value":"foo"}} or {"number":{"value":5}}.',
            items: {
              type: 'object',
              required: ['name', 'type'],
              properties: {
                name: { type: 'string', description: 'Parameter name' },
                type: {
                  type: 'string',
                  description: 'Parameter type, e.g. "string", "number", "boolean"',
                },
                value: {
                  type: 'object',
                  description:
                    'VCO value envelope — key is the type, e.g. ' +
                    '{"string":{"value":"foo"}}',
                },
              },
            },
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        const result = await apiVcoExecuteWorkflow(VcoWorkflowExecuteSchema.parse(args));
        return ok({
          ...(result as object),
          _hint: 'Poll execution status with vcf_vro_direct_execution_get',
        });
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_execution_list ────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_execution_list',
      description:
        'List executions for a specific vRO workflow from the native vRO API ' +
        '(/vco/api/workflows/{id}/executions). ' +
        'Returns a normalised {items, total} object with execution summaries.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'vRO Workflow UUID',
          },
          maxResult: {
            type: 'number',
            description: 'Maximum number of results to return (default: 25)',
          },
          startIndex: {
            type: 'number',
            description: '0-based start index for pagination (default: 0)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoListExecutions(VcoExecutionListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_execution_get ─────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_execution_get',
      description:
        'Get the status and output of a single vRO workflow execution from the ' +
        'native vRO API (/vco/api/workflows/{id}/executions/{execId}). ' +
        'Use this to poll for completion after starting an execution with ' +
        'vcf_vro_direct_workflow_execute.',
      inputSchema: {
        type: 'object',
        required: ['id', 'execId'],
        properties: {
          id: {
            type: 'string',
            description: 'vRO Workflow UUID',
          },
          execId: {
            type: 'string',
            description: 'Execution ID returned by vcf_vro_direct_workflow_execute',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoGetExecution(VcoExecutionGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_execution_logs ────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_execution_logs',
      description:
        'Retrieve log entries for a vRO workflow execution from the native vRO API ' +
        '(/vco/api/workflows/{id}/executions/{execId}/logs). ' +
        'Returns raw log lines including timestamp, severity, and message.',
      inputSchema: {
        type: 'object',
        required: ['id', 'execId'],
        properties: {
          id: {
            type: 'string',
            description: 'vRO Workflow UUID',
          },
          execId: {
            type: 'string',
            description: 'Execution ID to retrieve logs for',
          },
          maxResult: {
            type: 'number',
            description: 'Maximum number of log entries to return (default: 25)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoGetExecutionLogs(VcoExecutionLogsSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_category_list ─────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_category_list',
      description:
        'List vRO categories from the native vRO API (/vco/api/categories). ' +
        'Set isRoot=true to retrieve only top-level (root) categories. ' +
        'Returns a normalised {items, total} object with category summaries.',
      inputSchema: {
        type: 'object',
        properties: {
          maxResult: {
            type: 'number',
            description: 'Maximum number of results to return (default: 25)',
          },
          isRoot: {
            type: 'boolean',
            description: 'When true, return only root-level categories',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoListCategories(VcoCategoryListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_category_get ──────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_category_get',
      description:
        'Get a single vRO category by UUID from the native vRO API ' +
        '(/vco/api/categories/{id}). ' +
        'Returns category metadata including name, type, and child links.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'Category UUID',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoGetCategory(VcoCategoryGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_action_list ───────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_action_list',
      description:
        'List vRO scriptable actions from the native vRO API (/vco/api/actions). ' +
        'Uses VCO-style pagination (maxResult + startIndex). ' +
        'Returns a normalised {items, total} object with action summaries.',
      inputSchema: {
        type: 'object',
        properties: {
          maxResult: {
            type: 'number',
            description: 'Maximum number of results to return (default: 25)',
          },
          startIndex: {
            type: 'number',
            description: '0-based start index for pagination (default: 0)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoListActions(VcoActionListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_action_get ────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_action_get',
      description:
        'Get a single vRO scriptable action by its qualified ID from the native ' +
        'vRO API (/vco/api/actions/{id}). ' +
        'The ID is the qualified name, e.g. "com.example.module/actionName". ' +
        'Returns the full action definition including script source and parameters.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description:
              'Action qualified ID, e.g. "com.example.module/actionName"',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoGetAction(VcoActionGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_package_list ──────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_package_list',
      description:
        'List vRO packages from the native vRO API (/vco/api/packages). ' +
        'Uses VCO-style pagination (maxResult + startIndex). ' +
        'Returns a normalised {items, total} object with package summaries.',
      inputSchema: {
        type: 'object',
        properties: {
          maxResult: {
            type: 'number',
            description: 'Maximum number of results to return (default: 25)',
          },
          startIndex: {
            type: 'number',
            description: '0-based start index for pagination (default: 0)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoListPackages(VcoPackageListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_direct_package_get ───────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_direct_package_get',
      description:
        'Get a single vRO package by its dotted name from the native vRO API ' +
        '(/vco/api/packages/{name}). ' +
        'The name is the package identifier, e.g. "com.example.mypackage". ' +
        'Returns the full package metadata including contained workflows and actions.',
      inputSchema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description:
              'Package name (dotted identifier), e.g. "com.example.mypackage"',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiVcoGetPackage(VcoPackageGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },
];
