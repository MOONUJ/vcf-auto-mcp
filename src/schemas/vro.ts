/**
 * src/schemas/vro.ts — Zod schemas for the OrchestratorGateway (vRO) domain
 *
 * Based on OrchestratorGateway API spec (/vro/ path prefix).
 * All list endpoints use 0-based `page` parameter (not OData $top/$skip).
 */

import { z } from 'zod';

// ─── Workflow schemas ─────────────────────────────────────────────────────────

/**
 * Input schema for GET /vro/workflows
 * @property page - 0-based page index (required by the API)
 * @property expand - Optional comma-separated fields to expand in the response
 */
export const VroWorkflowListSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('0-based page index'),
  expand: z
    .string()
    .max(512)
    .optional()
    .describe('Comma-separated fields to expand (e.g. "permissions,inputParameters")'),
});

/**
 * Input schema for GET /vro/workflows/{workflowId}
 * @property workflowId - vRO Workflow UUID (path parameter)
 * @property expand - Optional fields to expand
 * @property endpointConfigurationLink - Optional endpoint config link filter
 */
export const VroWorkflowGetSchema = z.object({
  workflowId: z
    .string()
    .min(1)
    .describe('vRO Workflow UUID'),
  expand: z
    .string()
    .max(512)
    .optional()
    .describe('Comma-separated fields to expand'),
  endpointConfigurationLink: z
    .string()
    .max(512)
    .optional()
    .describe('Endpoint configuration link to filter by'),
});

// ─── Run schemas ──────────────────────────────────────────────────────────────

/**
 * Input schema for GET /vro/runs
 * @property page - 0-based page index
 */
export const VroRunListSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('0-based page index'),
});

/**
 * Schema for a single typed workflow execution parameter.
 * Used in VroRunStartSchema.parameters array.
 */
const VroRunParameterSchema = z.object({
  name: z.string().min(1).describe('Parameter name'),
  type: z.string().min(1).describe('Parameter type (e.g. "string", "number", "boolean")'),
  value: z.unknown().describe('Parameter value — type must match the declared type'),
});

/**
 * Input schema for POST /vro/runs (start a workflow run)
 * Maps to the execution-context request body.
 *
 * @property workflowId - UUID of the workflow to run (required)
 * @property parameters - Optional array of typed input parameters
 * @property projectId - Optional project scope
 * @property actionName - Optional action name override
 */
export const VroRunStartSchema = z.object({
  workflowId: z
    .string()
    .min(1)
    .describe('UUID of the vRO workflow to execute'),
  parameters: z
    .array(VroRunParameterSchema)
    .optional()
    .describe('Typed input parameters for the workflow'),
  projectId: z
    .string()
    .min(1)
    .optional()
    .describe('Project UUID to scope the execution to'),
  actionName: z
    .string()
    .min(1)
    .optional()
    .describe('Action name override'),
});

/**
 * Input schema for GET /vro/runs/{runId}
 * @property runId - Workflow run ID returned by vcf_vro_run_start
 */
export const VroRunGetSchema = z.object({
  runId: z
    .string()
    .min(1)
    .describe('Workflow run ID returned by vcf_vro_run_start'),
});

/**
 * Input schema for GET /vro/runs/{runId}/logs
 *
 * @property runId - Workflow run ID
 * @property olderThan - Return logs older than this timestamp (ms epoch)
 * @property severity - Filter logs by severity level
 * @property localOnly - If true, return only logs from the local node
 */
export const VroRunGetLogsSchema = z.object({
  runId: z
    .string()
    .min(1)
    .describe('Workflow run ID to retrieve logs for'),
  olderThan: z
    .coerce
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Return logs older than this timestamp (milliseconds since epoch)'),
  severity: z
    .enum(['DEBUG', 'INFO', 'WARNING', 'ERROR'])
    .optional()
    .describe('Filter logs by severity: DEBUG | INFO | WARNING | ERROR'),
  localOnly: z
    .boolean()
    .optional()
    .describe('When true, return only logs from the local orchestrator node'),
});

// ─── Aggregated workflow schemas ──────────────────────────────────────────────

/**
 * Input schema for GET /vro/aggregated-workflows
 * @property page - 0-based page index
 */
export const VroAggregatedWorkflowListSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('0-based page index'),
});

/**
 * Input schema for GET /vro/aggregated-workflows/{id}
 * @property id - Aggregated workflow ID (typically matches the workflow UUID)
 */
export const VroAggregatedWorkflowGetSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('Aggregated workflow ID (typically the workflow UUID)'),
});

// ─── Exported inferred types ──────────────────────────────────────────────────

export type VroWorkflowListInput = z.infer<typeof VroWorkflowListSchema>;
export type VroWorkflowGetInput = z.infer<typeof VroWorkflowGetSchema>;
export type VroRunListInput = z.infer<typeof VroRunListSchema>;
export type VroRunStartInput = z.infer<typeof VroRunStartSchema>;
export type VroRunGetInput = z.infer<typeof VroRunGetSchema>;
export type VroRunGetLogsInput = z.infer<typeof VroRunGetLogsSchema>;
export type VroAggregatedWorkflowListInput = z.infer<typeof VroAggregatedWorkflowListSchema>;
export type VroAggregatedWorkflowGetInput = z.infer<typeof VroAggregatedWorkflowGetSchema>;
