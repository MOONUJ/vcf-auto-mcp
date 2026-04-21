/**
 * src/schemas/approval.ts — Zod schemas for the Approval domain
 *
 * Spec: Approval.json
 * Endpoints used:
 *   GET  /approval/api/approvals           — list approval requests (Spring Pageable)
 *   GET  /approval/api/approvals/{id}      — get single approval request
 *   POST /approval/api/approvals/action    — approve/reject/cancel (action on approval request)
 *
 * NOTE: /policy/api/policies is for listing *policies* (content service domain), not approval requests.
 * Actual pending approval requests are under /approval/api/approvals.
 *
 * The action body uses:
 *   - action: 'APPROVE' | 'REJECT' | 'CANCEL'
 *   - comment: justification string
 *   - itemId: approval request UUID
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const ApprovalListRequestsSchema = PaginationSchema.extend({
  requestState: z
    .enum(['APPROVED', 'REJECTED', 'PENDING', 'EXPIRED', 'CANCELLED'])
    .optional()
    .describe('Filter by approval request state'),
  search: z
    .string()
    .max(256)
    .optional()
    .describe('Search across deploymentId, deploymentName, projectId, projectName, requestedBy or action'),
});

export const ApprovalGetRequestSchema = z.object({
  approvalRequestId: UUIDSchema.describe('Approval request UUID'),
});

export const ApprovalDecideSchema = z.object({
  approvalRequestId: UUIDSchema.describe('Approval request UUID (maps to itemId in request body)'),
  action: z
    .enum(['APPROVE', 'REJECT', 'CANCEL'])
    .describe('Approval action to take'),
  comment: z
    .string()
    .min(1)
    .max(2048)
    .optional()
    .describe('Approver comment / justification'),
});

export type ApprovalListRequestsInput = z.infer<typeof ApprovalListRequestsSchema>;
export type ApprovalGetRequestInput = z.infer<typeof ApprovalGetRequestSchema>;
export type ApprovalDecideInput = z.infer<typeof ApprovalDecideSchema>;
