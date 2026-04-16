/**
 * src/schemas/blueprints.ts — Zod schemas for the Blueprints domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema, BlueprintIdSchema, ProjectIdSchema } from './common.js';

export const BlueprintListSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional(),
});

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

export const BlueprintListVersionsSchema = BlueprintIdSchema.merge(PaginationSchema);

export type BlueprintListInput = z.infer<typeof BlueprintListSchema>;
export type BlueprintGetInput = z.infer<typeof BlueprintGetSchema>;
export type BlueprintCreateInput = z.infer<typeof BlueprintCreateSchema>;
export type BlueprintUpdateInput = z.infer<typeof BlueprintUpdateSchema>;
export type BlueprintDeleteInput = z.infer<typeof BlueprintDeleteSchema>;
export type BlueprintValidateInput = z.infer<typeof BlueprintValidateSchema>;
export type BlueprintListVersionsInput = z.infer<typeof BlueprintListVersionsSchema>;
