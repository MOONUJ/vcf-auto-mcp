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
  const { projectId, deploymentId, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (projectId) params['$filter'] = `(projectId eq '${projectId}')`;
  if (deploymentId) params['deploymentId'] = deploymentId;
  return vcfGet('/iaas/api/machines', params);
}

export async function apiGetMachine(input: IaasMachineGetInput): Promise<VcfMachine> {
  return vcfGet(`/iaas/api/machines/${input.machineId}`);
}

export async function apiListNetworks(input: IaasNetworkListInput): Promise<VcfPage<VcfNetwork>> {
  const { projectId, ...pagination } = input;
  const params: Record<string, unknown> = { ...pagination };
  if (projectId) params['$filter'] = `(projectId eq '${projectId}')`;
  return vcfGet('/iaas/api/networks', params);
}

export async function apiGetNetwork(input: IaasNetworkGetInput): Promise<VcfNetwork> {
  return vcfGet(`/iaas/api/networks/${input.networkId}`);
}
