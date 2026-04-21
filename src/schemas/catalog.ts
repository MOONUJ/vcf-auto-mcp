/**
 * src/schemas/catalog.ts — Zod schemas for the Catalog domain
 *
 * Spec: Catalog_Deployment.yaml
 * - GET  /catalog/api/items          → Spring Pageable (page/size/sort)
 * - GET  /catalog/api/items/{id}     → single item
 * - POST /catalog/api/items/{id}/request → create deployment from catalog item
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const CatalogListItemsSchema = PaginationSchema.extend({
  /** Comma-separated project UUIDs. Spec param name is 'projects'. */
  projects: z.string().optional().describe('Comma-separated project UUIDs to filter by'),
  search: z.string().max(256).optional().describe('Free-text name search'),
});

export const CatalogGetItemSchema = z.object({
  catalogItemId: UUIDSchema.describe('Catalog item UUID'),
  projectId: UUIDSchema.optional().describe('Project context for version resolution'),
});

/**
 * Schema for POST /catalog/api/items/{id}/request
 * Field names match the CatalogItemRequest schema in the spec:
 *   - version (not catalogItemVersion) for the catalog item version
 *   - deploymentName, projectId, inputs, reason — same as before
 */
export const CatalogRequestSchema = z.object({
  catalogItemId: UUIDSchema.describe('Catalog item UUID (used as path parameter)'),
  version: z.string().max(64).optional().describe('Catalog item version (omit for latest)'),
  deploymentName: z.string().min(1).max(900).describe('Name for the resulting deployment'),
  projectId: UUIDSchema.describe('Target project UUID'),
  inputs: z.record(z.unknown()).optional().describe('Catalog item input parameters'),
  reason: z.string().max(10240).optional().describe('Request reason'),
  bulkRequestCount: z.number().int().min(1).optional().describe('Number of deployments to create (default 1)'),
});

export type CatalogListItemsInput = z.infer<typeof CatalogListItemsSchema>;
export type CatalogGetItemInput = z.infer<typeof CatalogGetItemSchema>;
export type CatalogRequestInput = z.infer<typeof CatalogRequestSchema>;
