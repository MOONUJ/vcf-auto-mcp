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
  const { projectId, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (projectId) params['projectId'] = projectId;
  return vcfGet('/abx/api/resources/actions', params);
}

export async function apiGetAbxAction(input: AbxActionGetInput): Promise<VcfAbxAction> {
  return vcfGet(`/abx/api/resources/actions/${input.actionId}`);
}

export async function apiRunAbxAction(
  input: AbxActionRunInput,
): Promise<{ runId: string; status: string }> {
  const body: Record<string, unknown> = {};
  if (input.inputs) body['inputs'] = input.inputs;
  if (input.projectId) body['projectId'] = input.projectId;
  return vcfPost(`/abx/api/resources/actions/${input.actionId}/runs`, body);
}

export async function apiGetAbxRun(input: AbxActionGetRunInput): Promise<VcfAbxRun> {
  return vcfGet(`/abx/api/resources/actions/${input.actionId}/runs/${input.runId}`);
}
