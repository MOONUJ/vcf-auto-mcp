/**
 * src/api/catalog.ts — VCF Automation Catalog API calls
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage, VcfCatalogItem, VcfCatalogRequest } from '../types/vcf.js';
import type {
  CatalogListItemsInput,
  CatalogGetItemInput,
  CatalogRequestInput,
  CatalogListRequestsInput,
  CatalogGetRequestInput,
} from '../schemas/catalog.js';

export async function apiListCatalogItems(
  input: CatalogListItemsInput,
): Promise<VcfPage<VcfCatalogItem>> {
  const { projectId, search, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (projectId) params['projectId'] = projectId;
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

export async function apiRequestCatalogItem(
  input: CatalogRequestInput,
): Promise<{ requestId: string; deploymentId?: string; status: string }> {
  const body: Record<string, unknown> = {
    catalogItemId: input.catalogItemId,
    deploymentName: input.deploymentName,
    projectId: input.projectId,
  };
  if (input.catalogItemVersion) body['catalogItemVersion'] = input.catalogItemVersion;
  if (input.inputs) body['inputs'] = input.inputs;
  if (input.reason) body['reason'] = input.reason;
  return vcfPost('/catalog/api/requests', body);
}

export async function apiListCatalogRequests(
  input: CatalogListRequestsInput,
): Promise<VcfPage<VcfCatalogRequest>> {
  const { catalogItemId, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (catalogItemId) params['catalogItemId'] = catalogItemId;
  return vcfGet('/catalog/api/requests', params);
}

export async function apiGetCatalogRequest(
  input: CatalogGetRequestInput,
): Promise<VcfCatalogRequest> {
  return vcfGet(`/catalog/api/requests/${input.requestId}`);
}
