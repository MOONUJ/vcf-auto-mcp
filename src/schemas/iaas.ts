/**
 * src/schemas/iaas.ts — Zod schemas for the Cloud Assembly (IaaS) domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema } from './common.js';

export const IaasMachineListSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional().describe('Filter by project UUID'),
  deploymentId: UUIDSchema.optional().describe('Filter by deployment UUID'),
});

export const IaasMachineGetSchema = z.object({
  machineId: UUIDSchema.describe('Machine UUID'),
});

export const IaasNetworkListSchema = PaginationSchema.extend({
  projectId: UUIDSchema.optional(),
});

export const IaasNetworkGetSchema = z.object({
  networkId: UUIDSchema.describe('Network UUID'),
});

export type IaasMachineListInput = z.infer<typeof IaasMachineListSchema>;
export type IaasMachineGetInput = z.infer<typeof IaasMachineGetSchema>;
export type IaasNetworkListInput = z.infer<typeof IaasNetworkListSchema>;
export type IaasNetworkGetInput = z.infer<typeof IaasNetworkGetSchema>;
