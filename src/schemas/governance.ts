/**
 * src/schemas/governance.ts — Zod schemas for the Governance domain
 */

import { z } from 'zod';
import { ProjectIdSchema } from './common.js';

export const GovernanceGetQuotaSchema = ProjectIdSchema;

export const GovernanceUpdateQuotaSchema = ProjectIdSchema.extend({
  constraints: z.record(z.unknown()).optional().describe('Deployment placement constraints (zone, network, etc.)'),
  properties:  z.record(z.unknown()).optional().describe('Custom project properties'),
  operationTimeout: z.number().int().min(0).optional().describe('Operation timeout in minutes'),
  sharedResources: z.boolean().optional().describe('Allow shared resources across project members'),
});

export type GovernanceGetQuotaInput = z.infer<typeof GovernanceGetQuotaSchema>;
export type GovernanceUpdateQuotaInput = z.infer<typeof GovernanceUpdateQuotaSchema>;
