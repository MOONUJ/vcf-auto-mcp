/**
 * src/schemas/approval.ts — Zod schemas for the Approval domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const ApprovalListPoliciesSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional(),
  enabled: z.boolean().optional(),
});

export const ApprovalGetRequestSchema = z.object({
  approvalRequestId: UUIDSchema.describe('Approval request UUID'),
});

export const ApprovalDecideSchema = z.object({
  approvalRequestId: UUIDSchema.describe('Approval request UUID'),
  decision: z.enum(['APPROVED', 'REJECTED']).describe('Approval decision'),
  justification: z
    .string()
    .min(5)
    .max(1024)
    .describe('Required justification for the decision'),
});

export type ApprovalListPoliciesInput = z.infer<typeof ApprovalListPoliciesSchema>;
export type ApprovalGetRequestInput = z.infer<typeof ApprovalGetRequestSchema>;
export type ApprovalDecideInput = z.infer<typeof ApprovalDecideSchema>;
