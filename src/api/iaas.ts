/**
 * src/api/iaas.ts — VCF Cloud Assembly (IaaS) API calls
 */

import { vcfGet } from './client.js';
import type { VcfPage, VcfMachine, VcfNetwork } from '../types/vcf.js';
import type {
  IaasMachineListInput,
  IaasMachineGetInput,
  IaasNetworkListInput,
  IaasNetworkGetInput,
} from '../schemas/iaas.js';

export async function apiListMachines(input: IaasMachineListInput): Promise<VcfPage<VcfMachine>> {
  const { projectId, deploymentId, $top, $skip, $filter, $orderby } = input;
  const params: Record<string, unknown> = {};
  if ($top !== undefined) params['$top'] = $top;
  if ($skip !== undefined) params['$skip'] = $skip;
  if ($orderby) params['$orderby'] = $orderby;
  // Build $filter: combine user-provided filter with projectId shortcut
  const filters: string[] = [];
  if (projectId) filters.push(`(projectId eq '${projectId}')`);
  if ($filter) filters.push($filter);
  if (filters.length > 0) params['$filter'] = filters.join(' and ');
  if (deploymentId) params['deploymentId'] = deploymentId;
  return vcfGet('/iaas/api/machines', params);
}

export async function apiGetMachine(input: IaasMachineGetInput): Promise<VcfMachine> {
  return vcfGet(`/iaas/api/machines/${input.machineId}`);
}

export async function apiListNetworks(input: IaasNetworkListInput): Promise<VcfPage<VcfNetwork>> {
  const { projectId, $top, $skip, $filter, $orderby } = input;
  const params: Record<string, unknown> = {};
  if ($top !== undefined) params['$top'] = $top;
  if ($skip !== undefined) params['$skip'] = $skip;
  if ($orderby) params['$orderby'] = $orderby;
  const filters: string[] = [];
  if (projectId) filters.push(`(projectId eq '${projectId}')`);
  if ($filter) filters.push($filter);
  if (filters.length > 0) params['$filter'] = filters.join(' and ');
  return vcfGet('/iaas/api/networks', params);
}

export async function apiGetNetwork(input: IaasNetworkGetInput): Promise<VcfNetwork> {
  return vcfGet(`/iaas/api/networks/${input.networkId}`);
}
