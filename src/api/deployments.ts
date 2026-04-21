/**
 * src/api/deployments.ts — VCF Automation REST API calls for the Deployments domain
 *
 * Each function maps 1:1 to a VCF API endpoint.
 * All HTTP work is delegated to api/client.ts — no auth logic here.
 * Return types reference interfaces from types/vcf.ts.
 */

import { vcfGet, vcfPost, vcfPatch, vcfDelete } from './client.js';
import type {
  VcfPage,
  VcfDeploymentSummary,
  VcfDeploymentDetail,
  VcfDeploymentRequest,
  VcfDeploymentCreateResponse,
  VcfAsyncResponse,
} from '../types/vcf.js';
import type {
  DeploymentListInput,
  DeploymentGetInput,
  DeploymentCreateInput,
  DeploymentUpdateInput,
  DeploymentDeleteInput,
  DeploymentGetStatusInput,
  DeploymentRunActionInput,
} from '../schemas/deployments.js';

// ─── List deployments ─────────────────────────────────────────────────────────

export async function apiListDeployments(
  input: DeploymentListInput,
): Promise<VcfPage<VcfDeploymentSummary>> {
  const { projects, status, search, name, page, size, sort } = input;
  const params: Record<string, unknown> = { page, size };
  if (sort) params['sort'] = sort;
  if (projects) params['projects'] = projects;
  if (status) params['status'] = status;
  if (search) params['search'] = search;
  if (name) params['name'] = name;

  return vcfGet<VcfPage<VcfDeploymentSummary>>(
    '/deployment/api/deployments',
    params,
  );
}

// ─── Get single deployment ────────────────────────────────────────────────────

export async function apiGetDeployment(
  input: DeploymentGetInput,
): Promise<VcfDeploymentDetail> {
  const params: Record<string, unknown> = {};
  if (input.expandResources) params['expandResources'] = true;

  return vcfGet<VcfDeploymentDetail>(
    `/deployment/api/deployments/${input.deploymentId}`,
    params,
  );
}

// ─── Create deployment (async) ────────────────────────────────────────────────

export async function apiCreateDeployment(
  input: DeploymentCreateInput,
): Promise<VcfDeploymentCreateResponse> {
  const body: Record<string, unknown> = {
    projectId: input.projectId,
    name: input.deploymentName,
    blueprintId: input.blueprintId,
  };
  if (input.description) body['description'] = input.description;
  if (input.blueprintVersion) body['blueprintVersion'] = input.blueprintVersion;
  if (input.inputs) body['inputs'] = input.inputs;
  if (input.reason) body['reason'] = input.reason;

  return vcfPost<VcfDeploymentCreateResponse>(
    '/deployment/api/deployments',
    body,
  );
}

// ─── Update deployment (async) ────────────────────────────────────────────────

export async function apiUpdateDeployment(
  input: DeploymentUpdateInput,
): Promise<VcfAsyncResponse> {
  const { deploymentId, ...rest } = input;
  const body: Record<string, unknown> = {};
  if (rest.name) body['name'] = rest.name;
  if (rest.description !== undefined) body['description'] = rest.description;
  if (rest.inputs) body['inputs'] = rest.inputs;
  if (rest.reason) body['reason'] = rest.reason;

  return vcfPatch<VcfAsyncResponse>(
    `/deployment/api/deployments/${deploymentId}`,
    body,
  );
}

// ─── Delete deployment (async) ────────────────────────────────────────────────

export async function apiDeleteDeployment(
  input: DeploymentDeleteInput,
): Promise<unknown> {
  const { deploymentId, dryRun, forceDelete, reason } = input;
  const params: Record<string, unknown> = { dryRun };
  if (forceDelete) params['forceDelete'] = true;
  if (reason) params['reason'] = reason;

  return vcfDelete<unknown>(
    `/deployment/api/deployments/${deploymentId}`,
    params,
  );
}

// ─── Get request status (polling) ─────────────────────────────────────────────

export async function apiGetDeploymentStatus(
  input: DeploymentGetStatusInput,
): Promise<VcfDeploymentRequest> {
  return vcfGet<VcfDeploymentRequest>(
    `/deployment/api/deployments/${input.deploymentId}/requests/${input.requestId}`,
  );
}

// ─── Run Day-2 action (async) ──────────────────────────────────────────────────

export async function apiRunDeploymentAction(
  input: DeploymentRunActionInput,
): Promise<VcfAsyncResponse> {
  const body: Record<string, unknown> = {
    actionId: input.actionId,
  };
  if (input.inputs) body['inputs'] = input.inputs;
  if (input.reason) body['reason'] = input.reason;

  return vcfPost<VcfAsyncResponse>(
    `/deployment/api/deployments/${input.deploymentId}/requests`,
    body,
  );
}
