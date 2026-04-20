/**
 * src/schemas/blueprints.ts — Zod schemas for the Blueprints domain
 */

import { z } from 'zod';
import { UUIDSchema, BlueprintIdSchema } from './common.js';

// Blueprint API uses Spring Pageable, not OData
const BlueprintPageSchema = z.object({
  page:   z.coerce.number().int().min(0).default(0).describe('Zero-based page index'),
  size:   z.coerce.number().int().min(1).max(200).default(20).describe('Page size'),
  sort:   z.string().optional().describe('Sort field, e.g. "updatedAt,DESC"'),
  name:   z.string().optional().describe('Filter by exact name'),
  search: z.string().optional().describe('Search by name and description'),
  projects: z.array(z.string()).optional().describe('Filter by project IDs (array)'),
});

export const BlueprintListSchema = BlueprintPageSchema;

export const BlueprintGetSchema = BlueprintIdSchema;

export const BlueprintCreateSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(1024).optional(),
  projectId: UUIDSchema,
  content: z.string().min(1).describe('Blueprint YAML content'),
});

export const BlueprintUpdateSchema = BlueprintIdSchema.extend({
  name: z.string().min(1).max(256).optional(),
  description: z.string().max(1024).optional(),
  content: z.string().min(1).optional().describe('Updated YAML content'),
});

export const BlueprintDeleteSchema = BlueprintIdSchema;

export const BlueprintValidateSchema = z.object({
  content: z.string().min(1).describe('Blueprint YAML to validate'),
  projectId: UUIDSchema.optional().describe('Project context for constraint checks'),
});

export const BlueprintListVersionsSchema = BlueprintIdSchema.extend({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(200).default(20),
});

export type BlueprintListInput = z.infer<typeof BlueprintListSchema>;
export type BlueprintGetInput = z.infer<typeof BlueprintGetSchema>;
export type BlueprintCreateInput = z.infer<typeof BlueprintCreateSchema>;
export type BlueprintUpdateInput = z.infer<typeof BlueprintUpdateSchema>;
export type BlueprintDeleteInput = z.infer<typeof BlueprintDeleteSchema>;
export type BlueprintValidateInput = z.infer<typeof BlueprintValidateSchema>;
export type BlueprintListVersionsInput = z.infer<typeof BlueprintListVersionsSchema>;
