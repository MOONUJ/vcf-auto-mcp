/**
 * src/api/approval.ts — VCF Approval API calls
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage, VcfApprovalPolicy, VcfApprovalRequest } from '../types/vcf.js';
import type {
  ApprovalListPoliciesInput,
  ApprovalGetRequestInput,
  ApprovalDecideInput,
} from '../schemas/approval.js';

export async function apiListApprovalPolicies(
  input: ApprovalListPoliciesInput,
): Promise<VcfPage<VcfApprovalPolicy>> {
  const { projectId, enabled, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (projectId) params['projectId'] = projectId;
  if (enabled !== undefined) params['enabled'] = enabled;
  // NOTE: VCD-based VCF instances expose approval/policy under /policy/api/policies
  // (not /approval/api/policies which returns 404 on this stack).
  return vcfGet('/policy/api/policies', params);
}

export async function apiGetApprovalRequest(
  input: ApprovalGetRequestInput,
): Promise<VcfApprovalRequest> {
  return vcfGet(`/policy/api/requests/${input.approvalRequestId}`);
}

export async function apiDecideApprovalRequest(
  input: ApprovalDecideInput,
): Promise<VcfApprovalRequest> {
  return vcfPost(`/policy/api/requests/${input.approvalRequestId}/decide`, {
    decision: input.decision,
    justification: input.justification,
  });
}
