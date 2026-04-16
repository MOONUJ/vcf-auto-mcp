/**
 * src/schemas/abx.ts — Zod schemas for the ABX / Extensibility domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const AbxActionListSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional(),
});

export const AbxActionGetSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID'),
});

export const AbxActionRunSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID to execute'),
  inputs: z.record(z.unknown()).optional().describe('Action input key-value map'),
  projectId: UUIDSchema.optional().describe('Project context'),
});

export const AbxActionGetRunSchema = z.object({
  actionId: UUIDSchema.describe('ABX Action UUID'),
  runId: UUIDSchema.describe('Run UUID returned by vcf_abx_action_run'),
});

export type AbxActionListInput = z.infer<typeof AbxActionListSchema>;
export type AbxActionGetInput = z.infer<typeof AbxActionGetSchema>;
export type AbxActionRunInput = z.infer<typeof AbxActionRunSchema>;
export type AbxActionGetRunInput = z.infer<typeof AbxActionGetRunSchema>;
