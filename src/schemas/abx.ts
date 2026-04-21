/**
 * src/schemas/abx.ts — Zod schemas for the ABX / Extensibility domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const AbxActionListSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional(),
});

export const AbxActionGetSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID'),
});

export const AbxActionRunSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID to execute'),
  inputs: z.record(z.unknown()).optional().describe('Action input key-value map'),
  projectId: UUIDSchema.optional().describe('Project context'),
});

/**
 * Spec: GET /abx/api/resources/action-runs/{id}
 * Only runId needed — the run endpoint is not nested under a specific action.
 */
export const AbxActionGetRunSchema = z.object({
  runId: UUIDSchema.describe('Action run UUID returned by vcf_abx_action_run'),
});

// ─── Mutation schemas ─────────────────────────────────────────────────────────

/**
 * Shared fields for ABX Action create and update.
 * Spec required: actionType, entrypoint, name, orgId, runtime.
 * We make orgId optional since it can often be inferred server-side.
 */
const AbxActionBodySchema = z.object({
  name:           z.string().min(1).describe('Action name'),
  runtime:        z.string().min(1).describe('Runtime identifier, e.g. "python3", "nodejs", "powershell"'),
  entrypoint:     z.string().min(1).describe('Entrypoint function, e.g. "handler.handler"'),
  actionType:     z.string().min(1).describe('Action type, e.g. "SCRIPT", "FLOW"'),
  source:         z.string().optional().describe('Source code string (inline)'),
  description:    z.string().optional(),
  projectId:      UUIDSchema.optional().describe('Project UUID to associate the action with'),
  orgId:          z.string().optional().describe('Organisation ID (usually inferred)'),
  memoryInMB:     z.number().int().positive().optional().describe('Memory limit in MB'),
  timeoutSeconds: z.number().int().positive().optional().describe('Execution timeout in seconds'),
  dependencies:   z.string().optional().describe('Dependency list (newline-separated package specs)'),
  runtimeVersion: z.string().optional().describe('Runtime minor version, e.g. "3.10"'),
  inputs:         z.record(z.unknown()).optional().describe('Default input key-value map'),
  shared:         z.boolean().optional().describe('Make action shared across projects'),
  scalable:       z.boolean().optional(),
  asyncDeployed:  z.boolean().optional(),
  metadata:       z.record(z.unknown()).optional(),
  configuration:  z.record(z.unknown()).optional(),
});

/** POST /abx/api/resources/actions */
export const AbxActionCreateSchema = AbxActionBodySchema;

/** PUT /abx/api/resources/actions/{id} */
export const AbxActionUpdateSchema = AbxActionBodySchema.extend({
  actionId: UUIDSchema.describe('ABX Action UUID to update'),
});

/** DELETE /abx/api/resources/actions/{id} */
export const AbxActionDeleteSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID to delete'),
});

/**
 * POST /abx/api/resources/actions/{id}/versions
 * Creates a named version snapshot of an action.
 */
export const AbxActionCreateVersionSchema = z.object({
  actionId:    UUIDSchema.describe('ABX Action UUID'),
  name:        z.string().min(1).describe('Version name label, e.g. "v1.0.0"'),
  description: z.string().optional().describe('Version description'),
});

/**
 * PUT /abx/api/resources/actions/{id}/release
 * Marks a specific version as the released version of an action.
 */
export const AbxActionReleaseSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID'),
  version:  z.string().min(1).describe('Version name to release'),
});

/**
 * PATCH /abx/api/resources/action-runs/{id}/cancel
 * Cancels an in-progress action run.
 */
export const AbxRunCancelSchema = z.object({
  runId: UUIDSchema.describe('Action run UUID to cancel'),
});

/** POST /abx/api/resources/action-secrets */
export const AbxSecretCreateSchema = z.object({
  name:  z.string().min(1).describe('Secret name (must be unique in org)'),
  value: z.record(z.unknown()).optional().describe('Secret value envelope'),
  encrypted: z.boolean().optional().describe('Whether the value is pre-encrypted'),
});

/** PUT /abx/api/resources/action-secrets/{id} */
export const AbxSecretUpdateSchema = z.object({
  secretId: UUIDSchema.describe('Secret UUID to update'),
  name:     z.string().min(1).optional().describe('New secret name'),
  value:    z.record(z.unknown()).optional().describe('New secret value envelope'),
  encrypted: z.boolean().optional(),
});

/** DELETE /abx/api/resources/action-secrets/{id} */
export const AbxSecretDeleteSchema = z.object({
  secretId: UUIDSchema.describe('Secret UUID to delete'),
});

export type AbxActionListInput = z.infer<typeof AbxActionListSchema>;
export type AbxActionGetInput = z.infer<typeof AbxActionGetSchema>;
export type AbxActionRunInput = z.infer<typeof AbxActionRunSchema>;
export type AbxActionGetRunInput = z.infer<typeof AbxActionGetRunSchema>;
export type AbxActionCreateInput        = z.infer<typeof AbxActionCreateSchema>;
export type AbxActionUpdateInput        = z.infer<typeof AbxActionUpdateSchema>;
export type AbxActionDeleteInput        = z.infer<typeof AbxActionDeleteSchema>;
export type AbxActionCreateVersionInput = z.infer<typeof AbxActionCreateVersionSchema>;
export type AbxActionReleaseInput       = z.infer<typeof AbxActionReleaseSchema>;
export type AbxRunCancelInput           = z.infer<typeof AbxRunCancelSchema>;
export type AbxSecretCreateInput        = z.infer<typeof AbxSecretCreateSchema>;
export type AbxSecretUpdateInput        = z.infer<typeof AbxSecretUpdateSchema>;
export type AbxSecretDeleteInput        = z.infer<typeof AbxSecretDeleteSchema>;
