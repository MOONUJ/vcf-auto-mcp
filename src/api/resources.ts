/**
 * src/api/resources.ts — VCF Automation Resources API calls
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage, VcfResource, VcfResourceAction, VcfAsyncResponse } from '../types/vcf.js';
import type {
  ResourceListInput,
  ResourceGetInput,
  ResourceListActionsInput,
  ResourceRunActionInput,
} from '../schemas/resources.js';

export async function apiListResources(input: ResourceListInput): Promise<VcfPage<VcfResource>> {
  const { deploymentId, ...pagination } = input;
  return vcfGet(`/deployment/api/deployments/${deploymentId}/resources`, pagination);
}

export async function apiGetResource(input: ResourceGetInput): Promise<VcfResource> {
  return vcfGet(
    `/deployment/api/deployments/${input.deploymentId}/resources/${input.resourceId}`,
  );
}

export async function apiListResourceActions(
  input: ResourceListActionsInput,
): Promise<VcfResourceAction[]> {
  return vcfGet(
    `/deployment/api/deployments/${input.deploymentId}/resources/${input.resourceId}/actions`,
  );
}

export async function apiRunResourceAction(
  input: ResourceRunActionInput,
): Promise<VcfAsyncResponse> {
  const body: Record<string, unknown> = { actionId: input.actionId };
  if (input.inputs) body['inputs'] = input.inputs;
  if (input.reason) body['reason'] = input.reason;
  return vcfPost(
    `/deployment/api/deployments/${input.deploymentId}/resources/${input.resourceId}/requests`,
    body,
  );
}
