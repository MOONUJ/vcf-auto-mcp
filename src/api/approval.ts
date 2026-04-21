/**
 * src/api/approval.ts — VCF Approval API calls
 *
 * Spec: Approval.json
 * Endpoints:
 *   GET  /approval/api/approvals           — list approval requests
 *   GET  /approval/api/approvals/{id}      — get single approval request
 *   POST /approval/api/approvals/action    — take action (APPROVE/REJECT/CANCEL)
 *
 * NOTE: These are approval *requests* (pending approvals for deployments).
 * Approval *policies* are managed separately via /policy/api/policies.
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage } from '../types/vcf.js';
import type {
  ApprovalListRequestsInput,
  ApprovalGetRequestInput,
  ApprovalDecideInput,
} from '../schemas/approval.js';

/** Approval request object from the Approval API */
export interface VcfApprovalRequest {
  id: string;
  action?: string;
  deploymentId?: string;
  deploymentName?: string;
  projectId?: string;
  projectName?: string;
  requestedBy?: string;
  status?: string;
  createdAt?: string;
  expiryAt?: string;
  decision?: string;
  levels?: unknown[];
  [key: string]: unknown;
}

export async function apiListApprovalRequests(
  input: ApprovalListRequestsInput,
): Promise<VcfPage<VcfApprovalRequest>> {
  const { requestState, search, page, size, sort } = input;
  const params: Record<string, unknown> = { page, size };
  if (sort) params['sort'] = sort;
  if (requestState) params['requestState'] = requestState;
  if (search) params['search'] = search;
  return vcfGet('/approval/api/approvals', params);
}

export async function apiGetApprovalRequest(
  input: ApprovalGetRequestInput,
): Promise<VcfApprovalRequest> {
  return vcfGet(`/approval/api/approvals/${input.approvalRequestId}`);
}

/**
 * Approve, reject, or cancel an approval request.
 * Spec: POST /approval/api/approvals/action
 * Body: { action, comment, itemId }
 */
export async function apiDecideApprovalRequest(
  input: ApprovalDecideInput,
): Promise<VcfApprovalRequest> {
  return vcfPost('/approval/api/approvals/action', {
    action: input.action,
    comment: input.comment,
    itemId: input.approvalRequestId,
  });
}
