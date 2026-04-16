/**
 * src/schemas/governance.ts — Zod schemas for the Governance domain
 */

import { z } from 'zod';
import { ProjectIdSchema } from './common.js';

export const GovernanceGetQuotaSchema = ProjectIdSchema;

export const GovernanceUpdateQuotaSchema = ProjectIdSchema.extend({
  cpuLimit: z.number().int().min(0).optional().describe('vCPU limit (0 = unlimited)'),
  memoryLimitMb: z.number().int().min(0).optional().describe('Memory limit in MB'),
  storageGbLimit: z.number().int().min(0).optional().describe('Storage limit in GB'),
  instanceCountLimit: z.number().int().min(0).optional().describe('Max VM instances'),
});

export type GovernanceGetQuotaInput = z.infer<typeof GovernanceGetQuotaSchema>;
export type GovernanceUpdateQuotaInput = z.infer<typeof GovernanceUpdateQuotaSchema>;
