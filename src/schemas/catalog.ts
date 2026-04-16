/**
 * src/schemas/catalog.ts — Zod schemas for the Catalog domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const CatalogListItemsSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional().describe('Filter by project UUID'),
  search: z.string().max(256).optional().describe('Free-text name search'),
});

export const CatalogGetItemSchema = z.object({
  catalogItemId: UUIDSchema.describe('Catalog item UUID'),
  projectId: UUIDSchema.optional().describe('Project context for version resolution'),
});

export const CatalogRequestSchema = z.object({
  catalogItemId: UUIDSchema.describe('Catalog item UUID to request'),
  catalogItemVersion: z.string().max(64).optional().describe('Specific version (omit for latest)'),
  deploymentName: z.string().min(1).max(256).describe('Name for the resulting deployment'),
  projectId: UUIDSchema.describe('Target project UUID'),
  inputs: z.record(z.unknown()).optional().describe('Catalog item input parameters'),
  reason: z.string().max(512).optional().describe('Request reason'),
});

export const CatalogListRequestsSchema = PaginationSchema.extend({
  catalogItemId: UUIDSchema.optional().describe('Filter by catalog item UUID'),
});

export const CatalogGetRequestSchema = z.object({
  requestId: UUIDSchema.describe('Catalog request UUID'),
});

export type CatalogListItemsInput = z.infer<typeof CatalogListItemsSchema>;
export type CatalogGetItemInput = z.infer<typeof CatalogGetItemSchema>;
export type CatalogRequestInput = z.infer<typeof CatalogRequestSchema>;
export type CatalogListRequestsInput = z.infer<typeof CatalogListRequestsSchema>;
export type CatalogGetRequestInput = z.infer<typeof CatalogGetRequestSchema>;
