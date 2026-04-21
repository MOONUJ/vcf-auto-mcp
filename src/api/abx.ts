/**
 * src/api/abx.ts — VCF ABX / Extensibility API calls
 */

import { vcfGet, vcfPost, vcfPut, vcfPatch, vcfDelete } from './client.js';
import type { VcfPage, VcfAbxAction, VcfAbxRun } from '../types/vcf.js';
import type {
  AbxActionListInput,
  AbxActionGetInput,
  AbxActionRunInput,
  AbxActionGetRunInput,
  AbxActionCreateInput,
  AbxActionUpdateInput,
  AbxActionDeleteInput,
  AbxActionCreateVersionInput,
  AbxActionReleaseInput,
  AbxRunCancelInput,
  AbxSecretCreateInput,
  AbxSecretUpdateInput,
  AbxSecretDeleteInput,
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

// ─── Mutation APIs ────────────────────────────────────────────────────────────

/**
 * Creates a new ABX action via POST /abx/api/resources/actions.
 *
 * @param input - Validated AbxActionCreateInput
 * @returns The created VcfAbxAction record
 */
export async function apiCreateAbxAction(input: AbxActionCreateInput): Promise<VcfAbxAction> {
  const { ...body } = input;
  return vcfPost('/abx/api/resources/actions', body);
}

/**
 * Updates an existing ABX action via PUT /abx/api/resources/actions/{id}.
 *
 * @param input - Validated AbxActionUpdateInput (includes actionId path param)
 * @returns The updated VcfAbxAction record
 */
export async function apiUpdateAbxAction(input: AbxActionUpdateInput): Promise<VcfAbxAction> {
  const { actionId, ...body } = input;
  return vcfPut(`/abx/api/resources/actions/${actionId}`, body);
}

/**
 * Deletes an ABX action via DELETE /abx/api/resources/actions/{id}.
 *
 * @param input - Validated AbxActionDeleteInput
 * @returns Empty response (204 No Content)
 */
export async function apiDeleteAbxAction(input: AbxActionDeleteInput): Promise<void> {
  return vcfDelete(`/abx/api/resources/actions/${input.actionId}`);
}

/**
 * Creates a named version snapshot for an ABX action via
 * POST /abx/api/resources/actions/{id}/versions.
 *
 * @param input - Validated AbxActionCreateVersionInput
 * @returns The created version record
 */
export async function apiCreateAbxActionVersion(
  input: AbxActionCreateVersionInput,
): Promise<unknown> {
  const { actionId, ...body } = input;
  return vcfPost(`/abx/api/resources/actions/${actionId}/versions`, body);
}

/**
 * Releases a specific version of an ABX action via
 * PUT /abx/api/resources/actions/{id}/release.
 *
 * @param input - Validated AbxActionReleaseInput
 * @returns The release response
 */
export async function apiReleaseAbxAction(input: AbxActionReleaseInput): Promise<unknown> {
  const { actionId, version } = input;
  return vcfPut(`/abx/api/resources/actions/${actionId}/release`, { version });
}

/**
 * Cancels an in-progress ABX action run via
 * PATCH /abx/api/resources/action-runs/{id}/cancel.
 *
 * @param input - Validated AbxRunCancelInput
 * @returns The updated run record
 */
export async function apiCancelAbxRun(input: AbxRunCancelInput): Promise<unknown> {
  return vcfPatch(`/abx/api/resources/action-runs/${input.runId}/cancel`, {});
}

/**
 * Creates a new ABX action secret via POST /abx/api/resources/action-secrets.
 *
 * @param input - Validated AbxSecretCreateInput
 * @returns The created secret record (value is not returned)
 */
export async function apiCreateAbxSecret(input: AbxSecretCreateInput): Promise<unknown> {
  return vcfPost('/abx/api/resources/action-secrets', input);
}

/**
 * Updates an ABX action secret via PUT /abx/api/resources/action-secrets/{id}.
 *
 * @param input - Validated AbxSecretUpdateInput
 * @returns The updated secret record
 */
export async function apiUpdateAbxSecret(input: AbxSecretUpdateInput): Promise<unknown> {
  const { secretId, ...body } = input;
  return vcfPut(`/abx/api/resources/action-secrets/${secretId}`, body);
}

/**
 * Deletes an ABX action secret via DELETE /abx/api/resources/action-secrets/{id}.
 *
 * @param input - Validated AbxSecretDeleteInput
 * @returns Empty response (204 No Content)
 */
export async function apiDeleteAbxSecret(input: AbxSecretDeleteInput): Promise<void> {
  return vcfDelete(`/abx/api/resources/action-secrets/${input.secretId}`);
}
