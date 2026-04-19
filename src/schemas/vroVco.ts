/**
 * src/schemas/vroVco.ts — Zod schemas for the direct vRO API (/vco/api/) domain
 *
 * These schemas correspond to endpoints on the native vRO REST API, distinct
 * from the OrchestratorGateway /vro/ path prefix.
 *
 * Pagination: list endpoints use `maxResult` + `startIndex` (VCO convention),
 * NOT the Spring-style `page` parameter used by the Gateway API.
 */

import { z } from 'zod';

// ─── Shared pagination fields ─────────────────────────────────────────────────

/** Maximum number of results to return (VCO list endpoints) */
const maxResult = z.coerce
  .number()
  .int()
  .min(1)
  .max(1000)
  .default(25)
  .describe('Maximum number of results to return (1–1000, default: 25)');

/** 0-based start index for pagination (VCO list endpoints) */
const startIndex = z.coerce
  .number()
  .int()
  .min(0)
  .default(0)
  .describe('0-based start index for pagination (default: 0)');

// ─── Workflow schemas ─────────────────────────────────────────────────────────

/**
 * Input schema for GET /vco/api/workflows
 *
 * @property maxResult - Maximum number of workflows to return
 * @property startIndex - 0-based start index for pagination
 * @property categoryId - Filter workflows by category UUID
 * @property name - Filter workflows by name (substring match)
 */
export const VcoWorkflowListSchema = z.object({
  maxResult,
  startIndex,
  categoryId: z
    .string()
    .min(1)
    .optional()
    .describe('Filter workflows by category UUID'),
  name: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe('Filter workflows by name (substring match)'),
});

/**
 * Input schema for GET /vco/api/workflows/{id}
 *
 * @property id - vRO Workflow UUID (path parameter)
 */
export const VcoWorkflowGetSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('vRO Workflow UUID'),
});

/**
 * Schema for a single VCO-native workflow execution parameter.
 *
 * The value field uses VCO's nested envelope structure:
 *   - string:  { "string":  { "value": "..." } }
 *   - number:  { "number":  { "value": 42 } }
 *   - boolean: { "boolean": { "value": true } }
 */
const VcoWorkflowParameterSchema = z.object({
  name: z.string().min(1).describe('Parameter name'),
  type: z.string().min(1).describe('Parameter type, e.g. "string", "number", "boolean"'),
  value: z
    .record(z.unknown())
    .optional()
    .describe(
      'Typed value envelope, e.g. {"string":{"value":"foo"}} or {"number":{"value":5}}',
    ),
});

/**
 * Input schema for POST /vco/api/workflows/{id}/executions
 *
 * @property id - vRO Workflow UUID to execute
 * @property parameters - Optional array of typed input parameters in VCO envelope format
 */
export const VcoWorkflowExecuteSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('vRO Workflow UUID to execute'),
  parameters: z
    .array(VcoWorkflowParameterSchema)
    .optional()
    .describe(
      'Input parameters in VCO envelope format. ' +
      'Each item: {name, type, value} where value uses {type:{value:...}} nesting.',
    ),
});

// ─── Execution schemas ────────────────────────────────────────────────────────

/**
 * Input schema for GET /vco/api/workflows/{id}/executions
 *
 * @property id - vRO Workflow UUID
 * @property maxResult - Maximum number of executions to return
 * @property startIndex - 0-based start index
 */
export const VcoExecutionListSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('vRO Workflow UUID'),
  maxResult,
  startIndex,
});

/**
 * Input schema for GET /vco/api/workflows/{id}/executions/{execId}
 *
 * @property id - vRO Workflow UUID
 * @property execId - Execution ID returned by vcf_vro_direct_workflow_execute
 */
export const VcoExecutionGetSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('vRO Workflow UUID'),
  execId: z
    .string()
    .min(1)
    .describe('Execution ID returned by vcf_vro_direct_workflow_execute'),
});

/**
 * Input schema for GET /vco/api/workflows/{id}/executions/{execId}/logs
 *
 * @property id - vRO Workflow UUID
 * @property execId - Execution ID to retrieve logs for
 * @property maxResult - Maximum number of log entries to return
 */
export const VcoExecutionLogsSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('vRO Workflow UUID'),
  execId: z
    .string()
    .min(1)
    .describe('Execution ID to retrieve logs for'),
  maxResult,
});

// ─── Category schemas ─────────────────────────────────────────────────────────

/**
 * Input schema for GET /vco/api/categories
 *
 * @property maxResult - Maximum number of categories to return
 * @property isRoot - When true, return only root-level categories
 */
export const VcoCategoryListSchema = z.object({
  maxResult,
  isRoot: z
    .boolean()
    .optional()
    .describe('When true, return only root-level categories'),
});

/**
 * Input schema for GET /vco/api/categories/{id}
 *
 * @property id - Category UUID
 */
export const VcoCategoryGetSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('Category UUID'),
});

// ─── Action schemas ───────────────────────────────────────────────────────────

/**
 * Input schema for GET /vco/api/actions
 *
 * @property maxResult - Maximum number of actions to return
 * @property startIndex - 0-based start index
 */
export const VcoActionListSchema = z.object({
  maxResult,
  startIndex,
});

/**
 * Input schema for GET /vco/api/actions/{id}
 *
 * @property id - Action ID (qualified name, e.g. "com.example.module/actionName")
 */
export const VcoActionGetSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('Action ID — qualified name, e.g. "com.example.module/actionName"'),
});

// ─── Package schemas ──────────────────────────────────────────────────────────

/**
 * Input schema for GET /vco/api/packages
 *
 * @property maxResult - Maximum number of packages to return
 * @property startIndex - 0-based start index
 */
export const VcoPackageListSchema = z.object({
  maxResult,
  startIndex,
});

/**
 * Input schema for GET /vco/api/packages/{name}
 *
 * @property name - Package name, e.g. "com.example.mypackage"
 */
export const VcoPackageGetSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe('Package name, e.g. "com.example.mypackage"'),
});

// ─── Exported inferred types ──────────────────────────────────────────────────

export type VcoWorkflowListInput    = z.infer<typeof VcoWorkflowListSchema>;
export type VcoWorkflowGetInput     = z.infer<typeof VcoWorkflowGetSchema>;
export type VcoWorkflowExecuteInput = z.infer<typeof VcoWorkflowExecuteSchema>;
export type VcoExecutionListInput   = z.infer<typeof VcoExecutionListSchema>;
export type VcoExecutionGetInput    = z.infer<typeof VcoExecutionGetSchema>;
export type VcoExecutionLogsInput   = z.infer<typeof VcoExecutionLogsSchema>;
export type VcoCategoryListInput    = z.infer<typeof VcoCategoryListSchema>;
export type VcoCategoryGetInput     = z.infer<typeof VcoCategoryGetSchema>;
export type VcoActionListInput      = z.infer<typeof VcoActionListSchema>;
export type VcoActionGetInput       = z.infer<typeof VcoActionGetSchema>;
export type VcoPackageListInput     = z.infer<typeof VcoPackageListSchema>;
export type VcoPackageGetInput      = z.infer<typeof VcoPackageGetSchema>;
