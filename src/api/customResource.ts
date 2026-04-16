/**
 * src/api/customResource.ts — VCF Automation REST API calls for the Custom Resource domain
 *
 * Base path: /form-service/api/custom
 *
 * Two sub-domains:
 *   - /resource-types   CRUD for Custom Resource Types
 *   - /resource-actions CRUD + form-data for Resource Actions
 *
 * Pagination uses Spring Pageable convention (zero-based page/size/sort).
 * All HTTP work is delegated to api/client.ts.
 */

import { vcfGet, vcfPost, vcfDelete } from './client.js';
import type {
  VcfCustomResourceType,
  VcfResourceActionCustom,
  VcfCustomResourcePage,
} from '../types/vcf.js';
import type {
  CustomResourceTypeListInput,
  CustomResourceTypeIdInput,
  CustomResourceTypeCreateInput,
  CustomResourceActionListInput,
  CustomResourceActionIdInput,
  CustomResourceActionFormDataInput,
} from '../schemas/customResource.js';

const BASE = '/form-service/api/custom';

// ─── Custom Resource Types ────────────────────────────────────────────────────

/**
 * List custom resource types with optional filters and Spring Pageable pagination.
 *
 * @param input - Validated list parameters (page, size, sort, propertiesFormat, runnableId)
 * @returns Paginated list of custom resource types
 */
export async function apiListCustomResourceTypes(
  input: CustomResourceTypeListInput,
): Promise<VcfCustomResourcePage<VcfCustomResourceType>> {
  const params: Record<string, unknown> = {
    page: input.page,
    size: input.size,
  };
  if (input.sort) params['sort'] = input.sort;
  if (input.propertiesFormat) params['propertiesFormat'] = input.propertiesFormat;
  if (input.runnableId) params['runnableId'] = input.runnableId;

  return vcfGet<VcfCustomResourcePage<VcfCustomResourceType>>(
    `${BASE}/resource-types`,
    params,
  );
}

/**
 * Get a single custom resource type by UUID.
 *
 * @param input - Object containing the resource type UUID
 * @returns The custom resource type detail
 */
export async function apiGetCustomResourceType(
  input: CustomResourceTypeIdInput,
): Promise<VcfCustomResourceType> {
  return vcfGet<VcfCustomResourceType>(`${BASE}/resource-types/${input.id}`);
}

/**
 * Create a new custom resource type.
 *
 * @param input - Validated create parameters (displayName required, rest optional)
 * @returns The created custom resource type
 */
export async function apiCreateCustomResourceType(
  input: CustomResourceTypeCreateInput,
): Promise<VcfCustomResourceType> {
  const body: Record<string, unknown> = {
    displayName: input.displayName,
  };
  if (input.description !== undefined) body['description'] = input.description;
  if (input.resourceType !== undefined) body['resourceType'] = input.resourceType;
  if (input.externalType !== undefined) body['externalType'] = input.externalType;
  if (input.projectId !== undefined) body['projectId'] = input.projectId;
  if (input.propertiesYaml !== undefined) body['propertiesYaml'] = input.propertiesYaml;
  if (input.schemaType !== undefined) body['schemaType'] = input.schemaType;

  return vcfPost<VcfCustomResourceType>(`${BASE}/resource-types`, body);
}

/**
 * Delete a custom resource type by UUID.
 *
 * @param input - Object containing the resource type UUID
 * @returns Empty response (204 No Content)
 */
export async function apiDeleteCustomResourceType(
  input: CustomResourceTypeIdInput,
): Promise<unknown> {
  return vcfDelete<unknown>(`${BASE}/resource-types/${input.id}`);
}

// ─── Resource Actions ─────────────────────────────────────────────────────────

/**
 * List resource actions with optional runnableId filter and Spring Pageable pagination.
 *
 * @param input - Validated list parameters (page, size, sort, runnableId)
 * @returns Paginated list of resource actions
 */
export async function apiListResourceActions(
  input: CustomResourceActionListInput,
): Promise<VcfCustomResourcePage<VcfResourceActionCustom>> {
  const params: Record<string, unknown> = {
    page: input.page,
    size: input.size,
  };
  if (input.sort) params['sort'] = input.sort;
  if (input.runnableId) params['runnableId'] = input.runnableId;

  return vcfGet<VcfCustomResourcePage<VcfResourceActionCustom>>(
    `${BASE}/resource-actions`,
    params,
  );
}

/**
 * Get a single resource action by UUID.
 *
 * @param input - Object containing the resource action UUID
 * @returns The resource action detail
 */
export async function apiGetResourceAction(
  input: CustomResourceActionIdInput,
): Promise<VcfResourceActionCustom> {
  return vcfGet<VcfResourceActionCustom>(`${BASE}/resource-actions/${input.id}`);
}

/**
 * Get resolved form data for a resource action.
 *
 * POST /form-service/api/custom/resource-actions/{id}/form-data
 *
 * @param input - Object containing id (path), optional projectId (query), optional body
 * @returns Resolved form data object
 */
export async function apiGetResourceActionFormData(
  input: CustomResourceActionFormDataInput,
): Promise<unknown> {
  const params: Record<string, unknown> = {};
  if (input.projectId) params['projectId'] = input.projectId;

  return vcfPost<unknown>(
    `${BASE}/resource-actions/${input.id}/form-data`,
    input.body ?? {},
    params,
  );
}
