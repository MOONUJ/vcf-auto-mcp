/**
 * src/api/abx.ts — VCF ABX / Extensibility API calls
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage, VcfAbxAction, VcfAbxRun } from '../types/vcf.js';
import type {
  AbxActionListInput,
  AbxActionGetInput,
  AbxActionRunInput,
  AbxActionGetRunInput,
} from '../schemas/abx.js';

export async function apiListAbxActions(input: AbxActionListInput): Promise<VcfPage<VcfAbxAction>> {
  const { projectId, page, size, sort } = input;
  const params: Record<string, unknown> = { page, size };
  if (sort) params['sort'] = sort;
  if (projectId) params['projectId'] = projectId;
  return vcfGet('/abx/api/resources/actions', params);
}

export async function apiGetAbxAction(input: AbxActionGetInput): Promise<VcfAbxAction> {
  return vcfGet(`/abx/api/resources/actions/${input.actionId}`);
}

export async function apiRunAbxAction(
  input: AbxActionRunInput,
): Promise<VcfAbxRun> {
  const body: Record<string, unknown> = {
    actionId: input.actionId,
  };
  if (input.inputs) body['inputs'] = input.inputs;
  if (input.projectId) body['projectId'] = input.projectId;
  // Spec: POST /abx/api/resources/actions/{id}/action-runs (not /runs)
  return vcfPost(`/abx/api/resources/actions/${input.actionId}/action-runs`, body);
}

export async function apiGetAbxRun(input: AbxActionGetRunInput): Promise<VcfAbxRun> {
  // Spec: GET /abx/api/resources/action-runs/{id} (top-level, not nested under action)
  return vcfGet(`/abx/api/resources/action-runs/${input.runId}`);
}
