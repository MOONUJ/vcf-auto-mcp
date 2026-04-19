/**
 * src/tools/vro.ts — MCP tools for the OrchestratorGateway (vRO) domain
 *
 * Implements 8 tools backed by OrchestratorGateway /vro/ API paths:
 *   vcf_vro_workflow_list          — GET /vro/workflows
 *   vcf_vro_workflow_get           — GET /vro/workflows/{workflowId}
 *   vcf_vro_run_list               — GET /vro/runs
 *   vcf_vro_run_start              — POST /vro/runs
 *   vcf_vro_run_get                — GET /vro/runs/{runId}
 *   vcf_vro_run_get_logs           — GET /vro/runs/{runId}/logs
 *   vcf_vro_aggregated_workflow_list — GET /vro/aggregated-workflows
 *   vcf_vro_aggregated_workflow_get  — GET /vro/aggregated-workflows/{id}
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  VroWorkflowListSchema,
  VroWorkflowGetSchema,
  VroRunListSchema,
  VroRunStartSchema,
  VroRunGetSchema,
  VroRunGetLogsSchema,
  VroAggregatedWorkflowListSchema,
  VroAggregatedWorkflowGetSchema,
} from '../schemas/vro.js';
import {
  apiListVroWorkflows,
  apiGetVroWorkflow,
  apiListVroRuns,
  apiStartVroRun,
  apiGetVroRun,
  apiGetVroRunLogs,
  apiListVroAggregatedWorkflows,
  apiGetVroAggregatedWorkflow,
} from '../api/vro.js';
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

export const VRO_TOOLS: ToolEntry[] = [
  // ── vcf_vro_workflow_list ────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_workflow_list',
      description:
        'List vRO workflows from the OrchestratorGateway. ' +
        'Returns a paginated list (page is 0-based). ' +
        'Use the expand parameter to include additional fields such as inputParameters.',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: '0-based page index (default: 0)',
          },
          expand: {
            type: 'string',
            description:
              'Comma-separated fields to expand in the response, e.g. "permissions,inputParameters"',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiListVroWorkflows(VroWorkflowListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_workflow_get ─────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_workflow_get',
      description:
        'Get the full definition of a single vRO workflow including its parameter schema. ' +
        'Use expand to include inputParameters/outputParameters.',
      inputSchema: {
        type: 'object',
        required: ['workflowId'],
        properties: {
          workflowId: {
            type: 'string',
            description: 'vRO Workflow UUID',
          },
          expand: {
            type: 'string',
            description: 'Comma-separated fields to expand',
          },
          endpointConfigurationLink: {
            type: 'string',
            description: 'Filter by endpoint configuration link',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiGetVroWorkflow(VroWorkflowGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_run_list ─────────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_run_list',
      description:
        'List all workflow runs from the OrchestratorGateway. ' +
        'Returns a paginated list of run records (page is 0-based).',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: '0-based page index (default: 0)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiListVroRuns(VroRunListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_run_start ────────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_run_start',
      description:
        'Start a new vRO workflow run (async). ' +
        'Supply the workflowId and optional typed input parameters. ' +
        'Returns the created run object including its runId for polling with vcf_vro_run_get.',
      inputSchema: {
        type: 'object',
        required: ['workflowId'],
        properties: {
          workflowId: {
            type: 'string',
            description: 'UUID of the vRO workflow to execute',
          },
          parameters: {
            type: 'array',
            description: 'Typed input parameters for the workflow',
            items: {
              type: 'object',
              required: ['name', 'type', 'value'],
              properties: {
                name: { type: 'string', description: 'Parameter name' },
                type: { type: 'string', description: 'Parameter type (e.g. "string", "number")' },
                value: { description: 'Parameter value' },
              },
            },
          },
          projectId: {
            type: 'string',
            description: 'Project UUID to scope the execution to',
          },
          actionName: {
            type: 'string',
            description: 'Action name override',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        const result = await apiStartVroRun(VroRunStartSchema.parse(args));
        return ok({ ...result, _hint: 'Poll run status with vcf_vro_run_get' });
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_run_get ──────────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_run_get',
      description:
        'Get the current status and output of a specific vRO workflow run by its run ID. ' +
        'Use this to poll for completion after starting a run with vcf_vro_run_start.',
      inputSchema: {
        type: 'object',
        required: ['runId'],
        properties: {
          runId: {
            type: 'string',
            description: 'Workflow run ID returned by vcf_vro_run_start',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiGetVroRun(VroRunGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_run_get_logs ─────────────────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_run_get_logs',
      description:
        'Retrieve execution logs for a vRO workflow run. ' +
        'Optionally filter by severity level (DEBUG/INFO/WARNING/ERROR) or timestamp.',
      inputSchema: {
        type: 'object',
        required: ['runId'],
        properties: {
          runId: {
            type: 'string',
            description: 'Workflow run ID to retrieve logs for',
          },
          olderThan: {
            type: 'number',
            description: 'Return logs older than this timestamp (milliseconds since epoch)',
          },
          severity: {
            type: 'string',
            enum: ['DEBUG', 'INFO', 'WARNING', 'ERROR'],
            description: 'Filter logs by severity level',
          },
          localOnly: {
            type: 'boolean',
            description: 'When true, return only logs from the local orchestrator node',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiGetVroRunLogs(VroRunGetLogsSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_aggregated_workflow_list ─────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_aggregated_workflow_list',
      description:
        'List aggregated workflow records from the OrchestratorGateway. ' +
        'Each entry groups all runs of a given workflow and includes the run count. ' +
        'Returns a paginated list (page is 0-based).',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: '0-based page index (default: 0)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiListVroAggregatedWorkflows(VroAggregatedWorkflowListSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },

  // ── vcf_vro_aggregated_workflow_get ──────────────────────────────────────────
  {
    definition: {
      name: 'vcf_vro_aggregated_workflow_get',
      description:
        'Get aggregated information for a single vRO workflow by its ID. ' +
        'Returns the workflow metadata along with the total run count.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'Aggregated workflow ID (typically matches the workflow UUID)',
          },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try {
        return ok(await apiGetVroAggregatedWorkflow(VroAggregatedWorkflowGetSchema.parse(args)));
      } catch (e) {
        if (e instanceof McpError) throw e;
        throw ve(e);
      }
    },
  },
];
