/**
 * src/schemas/vro.ts — Zod schemas for the Orchestrator (vRO) domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const VroWorkflowListSchema = PaginationSchema.extend({
  categoryName: z.string().max(256).optional().describe('Filter by category name'),
  nameFilter: z.string().max(256).optional().describe('Partial name match'),
});

export const VroWorkflowGetSchema = z.object({
  workflowId: UUIDSchema.describe('vRO Workflow UUID'),
});

export const VroWorkflowExecuteSchema = z.object({
  workflowId: UUIDSchema.describe('vRO Workflow UUID to execute'),
  inputParameters: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        value: z.unknown(),
      }),
    )
    .optional()
    .describe('Workflow input parameters as typed name-value pairs'),
});

export const VroExecutionGetSchema = z.object({
  workflowId: UUIDSchema,
  executionId: UUIDSchema.describe('Execution UUID returned by vcf_vro_workflow_execute'),
});

export const VroExecutionListSchema = z.object({
  workflowId: UUIDSchema,
  ...PaginationSchema.shape,
});

export type VroWorkflowListInput = z.infer<typeof VroWorkflowListSchema>;
export type VroWorkflowGetInput = z.infer<typeof VroWorkflowGetSchema>;
export type VroWorkflowExecuteInput = z.infer<typeof VroWorkflowExecuteSchema>;
export type VroExecutionGetInput = z.infer<typeof VroExecutionGetSchema>;
export type VroExecutionListInput = z.infer<typeof VroExecutionListSchema>;
