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

// ─── Mutation schemas ─────────────────────────────────────────────────────────

/**
 * Input schema for POST /vco/api/workflows
 * Creates a workflow definition. Most fields are optional at creation time;
 * the full content is typically uploaded separately via PUT /workflows/{id}/content.
 *
 * @property name - Workflow display name
 * @property description - Optional description
 * @property category-id - Parent category UUID
 * @property version - Version string, e.g. "0.0.1"
 */
export const VcoWorkflowCreateSchema = z.object({
  name:           z.string().min(1).describe('Workflow display name'),
  description:    z.string().optional(),
  'category-id':  z.string().min(1).optional().describe('Parent category UUID'),
  version:        z.string().optional().describe('Version string, e.g. "0.0.1"'),
  inputParameters:  z.array(z.record(z.unknown())).optional().describe('Input parameter definitions'),
  outputParameters: z.array(z.record(z.unknown())).optional().describe('Output parameter definitions'),
});

/**
 * Input schema for PUT /vco/api/workflows/{id}/content
 * Uploads the full workflow XML-like content body (attrib, workflow-item, etc.).
 *
 * @property id - Workflow UUID (path parameter)
 * The remaining fields map directly to the vRO workflow content schema.
 */
export const VcoWorkflowUpdateContentSchema = z.object({
  id:               z.string().min(1).describe('vRO Workflow UUID'),
  'display-name':   z.string().min(1).describe('Workflow display name'),
  description:      z.string().describe('Workflow description'),
  version:          z.string().optional().describe('Version string'),
  'category-id':    z.string().optional().describe('Category UUID'),
  'ref-types':      z.string().optional().describe('Referenced types (comma-separated)'),
  input:            z.record(z.unknown()).optional().describe('Input parameter schema object'),
  output:           z.record(z.unknown()).optional().describe('Output parameter schema object'),
  attrib:           z.array(z.record(z.unknown())).optional().describe('Workflow attributes array'),
  presentation:     z.record(z.unknown()).optional().describe('Presentation schema object'),
  'workflow-item':  z.array(z.record(z.unknown())).optional().describe('Workflow item (step) definitions'),
  'workflow-note':  z.array(z.record(z.unknown())).optional().describe('Workflow note annotations'),
  'error-handler':  z.array(z.record(z.unknown())).optional(),
  restartMode:      z.number().int().optional(),
  resumeFromFailedMode: z.number().int().optional(),
});

/**
 * Input schema for PUT /vco/api/actions/{id}
 * Updates a vRO scriptable action definition.
 *
 * @property id - Action qualified ID, e.g. "com.example.module/actionName"
 * @property name - Action simple name
 * @property module - Module namespace, e.g. "com.example.module"
 * @property script - JavaScript source for the action
 */
export const VcoActionUpdateSchema = z.object({
  id:                  z.string().min(1).describe('Action qualified ID, e.g. "com.example.module/actionName"'),
  name:                z.string().min(1).describe('Action simple name'),
  module:              z.string().min(1).describe('Module namespace, e.g. "com.example.module"'),
  description:         z.string().optional(),
  version:             z.string().optional().describe('Version string'),
  script:              z.string().optional().describe('JavaScript source code'),
  runtime:             z.string().optional().describe('Runtime identifier'),
  outputParameterType: z.string().optional().describe('Return type, e.g. "string"'),
  'input-parameters':  z.array(z.record(z.unknown())).optional().describe('Input parameter definitions'),
  'output-type':       z.string().optional(),
  runtimeMemoryLimit:  z.number().int().optional().describe('Memory limit in bytes'),
  runtimeTimeout:      z.number().int().optional().describe('Timeout in seconds'),
  entryPoint:          z.string().optional().describe('Entry point for bundle-based actions'),
});

/**
 * Input schema for POST /vco/api/categories/{id}
 * Creates a sub-category inside the given category.
 *
 * @property id - Parent category UUID (path parameter — becomes the parent)
 * @property name - New category name
 * @property categoryType - Category type string (e.g. "WorkflowCategory")
 */
export const VcoCategoryCreateSchema = z.object({
  id:           z.string().min(1).describe('Parent category UUID (the category to create under)'),
  name:         z.string().min(1).describe('New sub-category name'),
  categoryType: z.string().optional().describe('Category type, e.g. "WorkflowCategory"'),
  description:  z.string().optional(),
  'parent-category-id': z.string().optional().describe('Explicit parent UUID (overrides path id if supplied)'),
});

/**
 * Input schema for PUT /vco/api/categories/{id}
 * Updates an existing category.
 *
 * @property id - Category UUID to update (path parameter)
 */
export const VcoCategoryUpdateSchema = z.object({
  id:           z.string().min(1).describe('Category UUID to update'),
  name:         z.string().min(1).optional().describe('New category name'),
  categoryType: z.string().optional(),
  description:  z.string().optional(),
  'parent-category-id': z.string().optional().describe('New parent category UUID'),
});

/**
 * Input schema for DELETE /vco/api/categories/{id}
 *
 * @property id - Category UUID to delete
 */
export const VcoCategoryDeleteSchema = z.object({
  id: z.string().min(1).describe('Category UUID to delete'),
});

/**
 * Input schema for PUT /vco/api/configurations/{id}
 * Updates a vRO configuration element.
 *
 * @property id - Configuration element UUID (path parameter)
 */
export const VcoConfigurationUpdateSchema = z.object({
  id:          z.string().min(1).describe('Configuration element UUID'),
  name:        z.string().optional().describe('Configuration name'),
  description: z.string().optional(),
  version:     z.string().optional(),
  'category-id': z.string().optional().describe('Category UUID'),
  attributes:  z.array(z.record(z.unknown())).optional().describe('Configuration attribute definitions'),
  status:      z.number().int().optional().describe('Configuration status code'),
});

/**
 * Input schema for DELETE /vco/api/configurations/{id}
 *
 * @property id - Configuration element UUID to delete
 */
export const VcoConfigurationDeleteSchema = z.object({
  id: z.string().min(1).describe('Configuration element UUID to delete'),
});

// ─── Exported inferred types ──────────────────────────────────────────────────

export type VcoWorkflowListInput          = z.infer<typeof VcoWorkflowListSchema>;
export type VcoWorkflowGetInput           = z.infer<typeof VcoWorkflowGetSchema>;
export type VcoWorkflowExecuteInput       = z.infer<typeof VcoWorkflowExecuteSchema>;
export type VcoExecutionListInput         = z.infer<typeof VcoExecutionListSchema>;
export type VcoExecutionGetInput          = z.infer<typeof VcoExecutionGetSchema>;
export type VcoExecutionLogsInput         = z.infer<typeof VcoExecutionLogsSchema>;
export type VcoCategoryListInput          = z.infer<typeof VcoCategoryListSchema>;
export type VcoCategoryGetInput           = z.infer<typeof VcoCategoryGetSchema>;
export type VcoActionListInput            = z.infer<typeof VcoActionListSchema>;
export type VcoActionGetInput             = z.infer<typeof VcoActionGetSchema>;
export type VcoPackageListInput           = z.infer<typeof VcoPackageListSchema>;
export type VcoPackageGetInput            = z.infer<typeof VcoPackageGetSchema>;
export type VcoWorkflowCreateInput        = z.infer<typeof VcoWorkflowCreateSchema>;
export type VcoWorkflowUpdateContentInput = z.infer<typeof VcoWorkflowUpdateContentSchema>;
export type VcoActionUpdateInput          = z.infer<typeof VcoActionUpdateSchema>;
export type VcoCategoryCreateInput        = z.infer<typeof VcoCategoryCreateSchema>;
export type VcoCategoryUpdateInput        = z.infer<typeof VcoCategoryUpdateSchema>;
export type VcoCategoryDeleteInput        = z.infer<typeof VcoCategoryDeleteSchema>;
export type VcoConfigurationUpdateInput   = z.infer<typeof VcoConfigurationUpdateSchema>;
export type VcoConfigurationDeleteInput   = z.infer<typeof VcoConfigurationDeleteSchema>;
