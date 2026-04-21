/**
 * src/schemas/deployments.ts — Zod input schemas for the Deployments domain
 *
 * Each schema corresponds 1:1 to a tool in src/tools/deployments.ts.
 * All schemas extend common building blocks from schemas/common.ts.
 */

import { z } from 'zod';
import {
  PaginationSchema,
  UUIDSchema,
  DeploymentStatusSchema,
  DeploymentIdSchema,
  RequestIdSchema,
} from './common.js';

// ─── vcf_deployment_list ──────────────────────────────────────────────────────

export const DeploymentListSchema = PaginationSchema.extend({
  // Spec uses 'projects' (comma-separated UUIDs) not 'projectId'
  projects: z
    .string()
    .optional()
    .describe('Comma-separated project UUIDs to filter by'),
  // Spec uses 'status' as comma-separated values; keep single-value shortcut for usability
  status: DeploymentStatusSchema.optional().describe(
    'Filter by deployment status',
  ),
  search: z
    .string()
    .max(256)
    .optional()
    .describe('Free-text search across deployment names and resources'),
  name: z
    .string()
    .max(256)
    .optional()
    .describe('Exact deployment name match'),
});

export type DeploymentListInput = z.infer<typeof DeploymentListSchema>;

// ─── vcf_deployment_get ───────────────────────────────────────────────────────

export const DeploymentGetSchema = DeploymentIdSchema.extend({
  expandResources: z
    .boolean()
    .default(false)
    .describe('Include resource list in response'),
});

export type DeploymentGetInput = z.infer<typeof DeploymentGetSchema>;

// ─── vcf_deployment_create ────────────────────────────────────────────────────

export const DeploymentCreateSchema = z.object({
  projectId: UUIDSchema.describe('Target project UUID'),
  deploymentName: z
    .string()
    .min(1)
    .max(256)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9\-_\s]*$/,
      'Name must start with alphanumeric and contain only letters, digits, hyphens, underscores, spaces',
    )
    .describe('Unique deployment name within the organization'),
  description: z
    .string()
    .max(1024)
    .optional()
    .describe('Free-form description'),
  blueprintId: UUIDSchema.describe('Blueprint UUID to deploy from'),
  blueprintVersion: z
    .string()
    .max(64)
    .optional()
    .describe('Blueprint version — omit to use the latest released version'),
  inputs: z
    .record(z.unknown())
    .optional()
    .describe('Blueprint input parameter key-value map'),
  reason: z
    .string()
    .max(512)
    .optional()
    .describe('Deployment request reason (passed to approval workflow)'),
});

export type DeploymentCreateInput = z.infer<typeof DeploymentCreateSchema>;

// ─── vcf_deployment_update ────────────────────────────────────────────────────

export const DeploymentUpdateSchema = DeploymentIdSchema.extend({
  name: z.string().min(1).max(256).optional().describe('New deployment name'),
  description: z
    .string()
    .max(1024)
    .optional()
    .describe('New deployment description'),
  inputs: z
    .record(z.unknown())
    .optional()
    .describe('Input parameters to update (only specified keys are changed)'),
  reason: z.string().max(512).optional().describe('Change reason'),
});

export type DeploymentUpdateInput = z.infer<typeof DeploymentUpdateSchema>;

// ─── vcf_deployment_delete ────────────────────────────────────────────────────

export const DeploymentDeleteSchema = DeploymentIdSchema.extend({
  dryRun: z
    .boolean()
    .default(true)
    .describe(
      'true = list affected resources without deleting; must be explicitly false to execute',
    ),
  forceDelete: z
    .boolean()
    .default(false)
    .describe(
      'Force-remove deployment record even if resource deletion fails (orphan risk)',
    ),
  reason: z
    .string()
    .min(5)
    .max(512)
    .optional()
    .describe('Deletion reason (written to audit log)'),
});

export type DeploymentDeleteInput = z.infer<typeof DeploymentDeleteSchema>;

// ─── vcf_deployment_get_status ────────────────────────────────────────────────

export const DeploymentGetStatusSchema = DeploymentIdSchema.merge(RequestIdSchema);

export type DeploymentGetStatusInput = z.infer<typeof DeploymentGetStatusSchema>;

// ─── vcf_deployment_run_action ────────────────────────────────────────────────

export const DeploymentRunActionSchema = DeploymentIdSchema.extend({
  actionId: z
    .string()
    .min(1)
    .max(256)
    .describe('Day-2 action ID (e.g. "Deployment.PowerOff")'),
  inputs: z
    .record(z.unknown())
    .optional()
    .describe('Action input parameters'),
  reason: z
    .string()
    .max(512)
    .optional()
    .describe('Action execution reason'),
});

export type DeploymentRunActionInput = z.infer<typeof DeploymentRunActionSchema>;
