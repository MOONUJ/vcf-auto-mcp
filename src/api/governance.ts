/**
 * src/api/governance.ts — VCF Governance / Project Quota API calls
 */

import { vcfGet, vcfPatch } from './client.js';
import type { GovernanceGetQuotaInput, GovernanceUpdateQuotaInput } from '../schemas/governance.js';

export async function apiGetProjectQuota(input: GovernanceGetQuotaInput): Promise<unknown> {
  const project = await vcfGet<Record<string, unknown>>(`/project-service/api/projects/${input.projectId}`);
  return {
    projectId: input.projectId,
    name: project['name'],
    constraints: project['constraints'] ?? {},
    properties: project['properties'] ?? {},
    operationTimeout: project['operationTimeout'],
    sharedResources: project['sharedResources'],
  };
}

export async function apiUpdateProjectQuota(
  input: GovernanceUpdateQuotaInput,
): Promise<unknown> {
  const { projectId, ...body } = input;
  return vcfPatch(`/project-service/api/projects/${projectId}`, body);
}
