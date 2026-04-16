/**
 * src/schemas/resources.ts — Zod schemas for the Resources domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema, DeploymentIdSchema, ResourceIdSchema } from './common.js';

export const ResourceListSchema = DeploymentIdSchema.merge(PaginationSchema);

export const ResourceGetSchema = DeploymentIdSchema.merge(ResourceIdSchema);

export const ResourceListActionsSchema = DeploymentIdSchema.merge(ResourceIdSchema);

export const ResourceRunActionSchema = DeploymentIdSchema.merge(ResourceIdSchema).extend({
  actionId: z.string().min(1).max(256).describe('Resource Day-2 action ID'),
  inputs: z.record(z.unknown()).optional().describe('Action input parameters'),
  reason: z.string().max(512).optional(),
});

export type ResourceListInput = z.infer<typeof ResourceListSchema>;
export type ResourceGetInput = z.infer<typeof ResourceGetSchema>;
export type ResourceListActionsInput = z.infer<typeof ResourceListActionsSchema>;
export type ResourceRunActionInput = z.infer<typeof ResourceRunActionSchema>;
