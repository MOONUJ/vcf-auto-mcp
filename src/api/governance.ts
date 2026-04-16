/**
 * src/api/governance.ts — VCF Governance / Project Quota API calls
 */

import { vcfGet, vcfPatch } from './client.js';
import type { VcfQuota } from '../types/vcf.js';
import type { GovernanceGetQuotaInput, GovernanceUpdateQuotaInput } from '../schemas/governance.js';

export async function apiGetProjectQuota(input: GovernanceGetQuotaInput): Promise<VcfQuota> {
  return vcfGet(`/project-service/api/projects/${input.projectId}/quota`);
}

export async function apiUpdateProjectQuota(
  input: GovernanceUpdateQuotaInput,
): Promise<VcfQuota> {
  const { projectId, ...body } = input;
  return vcfPatch(`/project-service/api/projects/${projectId}/quota`, body);
}
