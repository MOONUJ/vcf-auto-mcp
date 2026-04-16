/**
 * src/schemas/customResource.ts — Zod schemas for the Custom Resource domain
 *
 * Covers two sub-domains:
 *   - Custom Resource Types  (/form-service/api/custom/resource-types)
 *   - Resource Actions       (/form-service/api/custom/resource-actions)
 *
 * Pagination uses Spring Pageable style (zero-based page/size/sort)
 * rather than the OData $top/$skip used by other domains.
 */

import { z } from 'zod';
import { UUIDSchema } from './common.js';

// ─── Spring Pageable pagination (shared by both sub-domains) ─────────────────

/**
 * Base pagination schema for form-service endpoints.
 * Spring Pageable convention: page is zero-based, size defaults to 20.
 */
const SpringPageSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Zero-based page number'),
  size: z.coerce
    .number()
    .int()
    .min(1)
    .max(200)
    .default(20)
    .describe('Page size (max 200)'),
  sort: z
    .string()
    .max(128)
    .optional()
    .describe("Sort expression, e.g. 'displayName,asc'"),
});

// ─── Custom Resource Type schemas ─────────────────────────────────────────────

/**
 * Input schema for listing custom resource types.
 *
 * @example
 * { page: 0, size: 20 }
 * { propertiesFormat: 'YAML', runnableId: 'abc123', page: 0, size: 10 }
 */
export const CustomResourceTypeListSchema = SpringPageSchema.extend({
  propertiesFormat: z
    .enum(['YAML', 'JSON'])
    .optional()
    .describe("Format of the propertiesYaml field in the response ('YAML' or 'JSON')"),
  runnableId: z
    .string()
    .optional()
    .describe('Filter by associated runnable item ID (ABX action or vRO workflow)'),
});

/**
 * Input schema for getting or deleting a single custom resource type by ID.
 */
export const CustomResourceTypeIdSchema = z.object({
  id: UUIDSchema.describe('Custom Resource Type UUID'),
});

/**
 * Input schema for creating a custom resource type.
 *
 * `propertiesYaml` must be a valid YAML string defining the resource's
 * property schema. `resourceType` is the internal identifier used in blueprints.
 */
export const CustomResourceTypeCreateSchema = z.object({
  displayName: z
    .string()
    .min(1)
    .max(256)
    .describe('Human-readable display name for the resource type'),
  description: z
    .string()
    .max(1024)
    .optional()
    .describe('Optional description of the resource type'),
  resourceType: z
    .string()
    .min(1)
    .max(256)
    .optional()
    .describe('Internal resource type identifier used in blueprints (e.g. Custom.MyType)'),
  externalType: z
    .string()
    .max(256)
    .optional()
    .describe('External system type identifier'),
  projectId: UUIDSchema.optional().describe('Project UUID to scope this resource type'),
  propertiesYaml: z
    .string()
    .optional()
    .describe('YAML string defining the resource property schema'),
  schemaType: z
    .string()
    .max(128)
    .optional()
    .describe('Schema type descriptor'),
});

export type CustomResourceTypeListInput = z.infer<typeof CustomResourceTypeListSchema>;
export type CustomResourceTypeIdInput = z.infer<typeof CustomResourceTypeIdSchema>;
export type CustomResourceTypeCreateInput = z.infer<typeof CustomResourceTypeCreateSchema>;

// ─── Resource Action schemas ──────────────────────────────────────────────────

/**
 * Input schema for listing resource actions.
 */
export const CustomResourceActionListSchema = SpringPageSchema.extend({
  runnableId: z
    .string()
    .optional()
    .describe('Filter by associated runnable item ID'),
});

/**
 * Input schema for getting or deleting a single resource action by ID.
 */
export const CustomResourceActionIdSchema = z.object({
  id: UUIDSchema.describe('Resource Action UUID'),
});

/**
 * Input schema for POST /resource-actions/{id}/form-data.
 *
 * `id` is the resource action UUID (path parameter).
 * `projectId` scopes the request (optional query parameter).
 * `body` is the arbitrary request payload passed to the form resolver.
 */
export const CustomResourceActionFormDataSchema = z.object({
  id: UUIDSchema.describe('Resource Action UUID'),
  projectId: UUIDSchema.optional().describe('Project UUID for scoping the form data resolution'),
  body: z
    .record(z.unknown())
    .optional()
    .describe('Request body payload for form data resolution'),
});

export type CustomResourceActionListInput = z.infer<typeof CustomResourceActionListSchema>;
export type CustomResourceActionIdInput = z.infer<typeof CustomResourceActionIdSchema>;
export type CustomResourceActionFormDataInput = z.infer<typeof CustomResourceActionFormDataSchema>;
