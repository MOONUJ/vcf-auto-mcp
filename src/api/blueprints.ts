/**
 * src/api/blueprints.ts — VCF Automation Blueprints API calls
 */

import { vcfGet, vcfPost, vcfPut, vcfDelete } from './client.js';
import type { VcfPage, VcfBlueprint, VcfBlueprintVersion, VcfBlueprintValidation } from '../types/vcf.js';
import type {
  BlueprintListInput,
  BlueprintGetInput,
  BlueprintCreateInput,
  BlueprintUpdateInput,
  BlueprintDeleteInput,
  BlueprintValidateInput,
  BlueprintListVersionsInput,
} from '../schemas/blueprints.js';

export async function apiListBlueprints(input: BlueprintListInput): Promise<VcfPage<VcfBlueprint>> {
  const { projectId, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (projectId) params['projectId'] = projectId;
  return vcfGet('/blueprint/api/blueprints', params);
}

export async function apiGetBlueprint(input: BlueprintGetInput): Promise<VcfBlueprint> {
  return vcfGet(`/blueprint/api/blueprints/${input.blueprintId}`);
}

export async function apiCreateBlueprint(input: BlueprintCreateInput): Promise<VcfBlueprint> {
  return vcfPost('/blueprint/api/blueprints', input);
}

export async function apiUpdateBlueprint(input: BlueprintUpdateInput): Promise<VcfBlueprint> {
  const { blueprintId, ...body } = input;
  return vcfPut(`/blueprint/api/blueprints/${blueprintId}`, body);
}

export async function apiDeleteBlueprint(input: BlueprintDeleteInput): Promise<void> {
  await vcfDelete(`/blueprint/api/blueprints/${input.blueprintId}`);
}

export async function apiValidateBlueprint(
  input: BlueprintValidateInput,
): Promise<VcfBlueprintValidation> {
  return vcfPost('/blueprint/api/blueprints/validate', input);
}

export async function apiListBlueprintVersions(
  input: BlueprintListVersionsInput,
): Promise<VcfPage<VcfBlueprintVersion>> {
  const { blueprintId, ...pagination } = input;
  return vcfGet(`/blueprint/api/blueprints/${blueprintId}/versions`, pagination);
}
