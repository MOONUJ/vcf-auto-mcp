/**
 * src/schemas/iaas.ts — Zod schemas for the Cloud Assembly (IaaS) domain
 */

import { z } from 'zod';
import { IaasODataPaginationSchema, UUIDSchema } from './common.js';

// IaaS uses OData pagination ($top/$skip) — NOT Spring Pageable

export const IaasMachineListSchema = IaasODataPaginationSchema.extend({
  projectId: UUIDSchema.optional().describe('Filter by project UUID (added as $filter)'),
  deploymentId: UUIDSchema.optional().describe('Filter by deployment UUID'),
});

export const IaasMachineGetSchema = z.object({
  machineId: UUIDSchema.describe('Machine UUID'),
});

export const IaasNetworkListSchema = IaasODataPaginationSchema.extend({
  projectId: UUIDSchema.optional().describe('Filter by project UUID (added as $filter)'),
});

export const IaasNetworkGetSchema = z.object({
  networkId: UUIDSchema.describe('Network UUID'),
});

export type IaasMachineListInput = z.infer<typeof IaasMachineListSchema>;
export type IaasMachineGetInput = z.infer<typeof IaasMachineGetSchema>;
export type IaasNetworkListInput = z.infer<typeof IaasNetworkListSchema>;
export type IaasNetworkGetInput = z.infer<typeof IaasNetworkGetSchema>;
