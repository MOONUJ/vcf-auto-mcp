/**
 * src/api/catalog.ts — VCF Automation Catalog API calls
 *
 * Spec: Catalog_Deployment.yaml
 * Endpoints:
 *   GET  /catalog/api/items                    — list catalog items (Spring Pageable)
 *   GET  /catalog/api/items/{id}               — get single catalog item
 *   POST /catalog/api/items/{id}/request       — create deployment from catalog item
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage, VcfCatalogItem } from '../types/vcf.js';
import type {
  CatalogListItemsInput,
  CatalogGetItemInput,
  CatalogRequestInput,
} from '../schemas/catalog.js';

/** Response from POST /catalog/api/items/{id}/request */
export interface CatalogItemRequestResponse {
  deploymentId?: string;
  deploymentName?: string;
}

export async function apiListCatalogItems(
  input: CatalogListItemsInput,
): Promise<VcfPage<VcfCatalogItem>> {
  const { projects, search, page, size, sort } = input;
  const params: Record<string, unknown> = { page, size };
  if (sort) params['sort'] = sort;
  if (projects) params['projects'] = projects;
  if (search) params['search'] = search;
  return vcfGet('/catalog/api/items', params);
}

export async function apiGetCatalogItem(
  input: CatalogGetItemInput,
): Promise<VcfCatalogItem> {
  const params: Record<string, unknown> = {};
  if (input.projectId) params['projectId'] = input.projectId;
  return vcfGet(`/catalog/api/items/${input.catalogItemId}`, params);
}

/**
 * Creates a deployment from a catalog item.
 * Spec: POST /catalog/api/items/{id}/request
 * The catalogItemId is a path parameter; remaining fields go in the request body.
 * Returns an array of CatalogItemRequestResponse objects.
 */
export async function apiRequestCatalogItem(
  input: CatalogRequestInput,
): Promise<CatalogItemRequestResponse[]> {
  const { catalogItemId, ...bodyFields } = input;
  const body: Record<string, unknown> = {
    deploymentName: bodyFields.deploymentName,
    projectId: bodyFields.projectId,
  };
  if (bodyFields.version) body['version'] = bodyFields.version;
  if (bodyFields.inputs) body['inputs'] = bodyFields.inputs;
  if (bodyFields.reason) body['reason'] = bodyFields.reason;
  if (bodyFields.bulkRequestCount !== undefined) body['bulkRequestCount'] = bodyFields.bulkRequestCount;
  return vcfPost(`/catalog/api/items/${catalogItemId}/request`, body);
}
