/**
 * src/api/vro.ts — VCF OrchestratorGateway API calls
 *
 * All endpoints use the /vro/ path prefix as defined in the OrchestratorGateway
 * API specification. The /vco/api/ legacy path is no longer used.
 *
 * Pagination: list endpoints use a 0-based `page` query parameter and return
 * a Spring-style { content: T[], totalElements, totalPages, ... } envelope.
 */

import { vcfGet, vcfPost } from './client.js';
import type {
  VcfVroWorkflow,
  VcfVroRun,
  VcfVroRunLog,
  VcfVroAggregatedWorkflow,
} from '../types/vcf.js';
import type {
  VroWorkflowListInput,
  VroWorkflowGetInput,
  VroRunListInput,
  VroRunStartInput,
  VroRunGetInput,
  VroRunGetLogsInput,
  VroAggregatedWorkflowListInput,
  VroAggregatedWorkflowGetInput,
} from '../schemas/vro.js';

// ─── Workflow API ─────────────────────────────────────────────────────────────

/**
 * Lists vRO workflows from GET /vro/workflows.
 * Returns the raw Spring pageable envelope from the API.
 *
 * @param input - Validated VroWorkflowListInput (page, expand)
 * @returns Promise resolving to the raw paginated workflow list response
 */
export async function apiListVroWorkflows(input: VroWorkflowListInput): Promise<unknown> {
  const params: Record<string, unknown> = { page: input.page };
  if (input.expand !== undefined) params['expand'] = input.expand;
  return vcfGet('/vro/workflows', params);
}

/**
 * Gets a single vRO workflow definition from GET /vro/workflows/{workflowId}.
 *
 * @param input - Validated VroWorkflowGetInput (workflowId, expand, endpointConfigurationLink)
 * @returns Promise resolving to the workflow definition
 */
export async function apiGetVroWorkflow(input: VroWorkflowGetInput): Promise<VcfVroWorkflow> {
  const params: Record<string, unknown> = {};
  if (input.expand !== undefined) params['expand'] = input.expand;
  if (input.endpointConfigurationLink !== undefined) {
    params['endpointConfigurationLink'] = input.endpointConfigurationLink;
  }
  return vcfGet<VcfVroWorkflow>(`/vro/workflows/${input.workflowId}`, params);
}

// ─── Run API ──────────────────────────────────────────────────────────────────

/**
 * Lists workflow runs from GET /vro/runs.
 * Returns the raw Spring pageable envelope from the API.
 *
 * @param input - Validated VroRunListInput (page)
 * @returns Promise resolving to the raw paginated run list response
 */
export async function apiListVroRuns(input: VroRunListInput): Promise<unknown> {
  return vcfGet('/vro/runs', { page: input.page });
}

/**
 * Starts a new workflow run via POST /vro/runs.
 * Maps to the execution-context request body schema.
 *
 * @param input - Validated VroRunStartInput (workflowId, parameters, projectId, actionName)
 * @returns Promise resolving to the created run, including the run ID
 */
export async function apiStartVroRun(input: VroRunStartInput): Promise<VcfVroRun> {
  const body: Record<string, unknown> = {
    workflowId: input.workflowId,
  };
  if (input.parameters !== undefined) body['parameters'] = input.parameters;
  if (input.projectId !== undefined) body['projectId'] = input.projectId;
  if (input.actionName !== undefined) body['actionName'] = input.actionName;
  return vcfPost<VcfVroRun>('/vro/runs', body);
}

/**
 * Gets a single workflow run by ID from GET /vro/runs/{runId}.
 *
 * @param input - Validated VroRunGetInput (runId)
 * @returns Promise resolving to the workflow run details
 */
export async function apiGetVroRun(input: VroRunGetInput): Promise<VcfVroRun> {
  return vcfGet<VcfVroRun>(`/vro/runs/${input.runId}`);
}

/**
 * Retrieves logs for a workflow run from GET /vro/runs/{runId}/logs.
 *
 * @param input - Validated VroRunGetLogsInput (runId, olderThan, severity, localOnly)
 * @returns Promise resolving to the raw logs response
 */
export async function apiGetVroRunLogs(input: VroRunGetLogsInput): Promise<unknown> {
  const params: Record<string, unknown> = {};
  if (input.olderThan !== undefined) params['olderThan'] = input.olderThan;
  if (input.severity !== undefined) params['severity'] = input.severity;
  if (input.localOnly !== undefined) params['localOnly'] = input.localOnly;
  return vcfGet(`/vro/runs/${input.runId}/logs`, params);
}

// ─── Aggregated Workflow API ──────────────────────────────────────────────────

/**
 * Lists aggregated workflows from GET /vro/aggregated-workflows.
 * Returns the raw Spring pageable envelope from the API.
 *
 * @param input - Validated VroAggregatedWorkflowListInput (page)
 * @returns Promise resolving to the raw paginated aggregated workflow list response
 */
export async function apiListVroAggregatedWorkflows(
  input: VroAggregatedWorkflowListInput,
): Promise<unknown> {
  return vcfGet('/vro/aggregated-workflows', { page: input.page });
}

/**
 * Gets a single aggregated workflow from GET /vro/aggregated-workflows/{id}.
 *
 * @param input - Validated VroAggregatedWorkflowGetInput (id)
 * @returns Promise resolving to the aggregated workflow details
 */
export async function apiGetVroAggregatedWorkflow(
  input: VroAggregatedWorkflowGetInput,
): Promise<VcfVroAggregatedWorkflow> {
  return vcfGet<VcfVroAggregatedWorkflow>(`/vro/aggregated-workflows/${input.id}`);
}
