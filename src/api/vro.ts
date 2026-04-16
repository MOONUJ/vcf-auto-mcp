/**
 * src/api/vro.ts — VCF Orchestrator (vRO) API calls
 *
 * NOTE: On VCD-based VCF Automation instances the Orchestrator API is served
 * at /vco/api/ (not /vro/api/). The list endpoint returns a VCO-style envelope:
 *   { link: [{attributes: [{name, value}, ...]}, ...], total: N, last-item-token: ... }
 * rather than the Spring pageable format used by other VCF services.
 * The helpers below normalise this into VcfPage<T> for consistency.
 */

import { vcfGet, vcfPost } from './client.js';
import type { VcfPage, VcfVroWorkflow, VcfVroExecution } from '../types/vcf.js';
import type {
  VroWorkflowListInput,
  VroWorkflowGetInput,
  VroWorkflowExecuteInput,
  VroExecutionGetInput,
  VroExecutionListInput,
} from '../schemas/vro.js';

// ── VCO response shapes ──────────────────────────────────────────────────────

interface VcoAttribute {
  name: string;
  value?: string;
}

interface VcoLinkItem {
  attributes: VcoAttribute[];
  href?: string;
  rel?: string;
}

interface VcoListResponse {
  link: VcoLinkItem[];
  total?: number;
  'last-item-token'?: string;
}

/**
 * Extract a named attribute value from a VCO link item's attributes array.
 * @param attrs - Array of VCO attributes
 * @param name  - Attribute name to look up
 * @returns The attribute value or empty string if not found
 */
function vcoAttr(attrs: VcoAttribute[], name: string): string {
  return attrs.find((a) => a.name === name)?.value ?? '';
}

/**
 * Normalise a VCO link-list response into a Spring-style VcfPage.
 * Each link item's attributes are projected onto VcfVroWorkflow fields.
 * @param raw - Raw VCO list envelope from /vco/api/workflows
 * @returns Normalised VcfPage<VcfVroWorkflow>
 */
function normaliseVcoWorkflowList(raw: VcoListResponse): VcfPage<VcfVroWorkflow> {
  const links = Array.isArray(raw.link) ? raw.link : [];
  const content: VcfVroWorkflow[] = links.map((item) => {
    const attrs = item.attributes ?? [];
    const href = vcoAttr(attrs, 'itemHref');
    // Extract ID from the href: .../workflows/<id>/
    const idMatch = href.match(/workflows\/([^/]+)/);
    const descValue = vcoAttr(attrs, 'description');
    const entry: VcfVroWorkflow = {
      id: idMatch?.[1] ?? href,
      name: vcoAttr(attrs, 'name'),
      version: vcoAttr(attrs, 'version'),
      categoryName: vcoAttr(attrs, 'categoryName'),
      inputParameters: [],
      outputParameters: [],
    };
    if (descValue) (entry as { description?: string }).description = descValue;
    return entry;
  });
  const total = raw.total ?? content.length;
  return {
    content,
    totalElements: total,
    totalPages: 1,
    pageable: { pageNumber: 0, pageSize: content.length },
  };
}

/**
 * Normalise a raw VCO single-workflow response into VcfVroWorkflow.
 * The /vco/api/workflows/{id} response has top-level fields directly.
 */
function normaliseVcoWorkflow(raw: Record<string, unknown>): VcfVroWorkflow {
  const result: VcfVroWorkflow = {
    id: String(raw['id'] ?? ''),
    name: String(raw['name'] ?? ''),
    version: String(raw['version'] ?? ''),
    categoryName: String(raw['category-name'] ?? raw['categoryName'] ?? ''),
    inputParameters: Array.isArray(raw['input-parameters'])
      ? (raw['input-parameters'] as VcfVroWorkflow['inputParameters'])
      : [],
    outputParameters: Array.isArray(raw['output-parameters'])
      ? (raw['output-parameters'] as VcfVroWorkflow['outputParameters'])
      : [],
  };
  if (raw['description']) {
    (result as { description?: string }).description = String(raw['description']);
  }
  return result;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function apiListVroWorkflows(
  input: VroWorkflowListInput,
): Promise<VcfPage<VcfVroWorkflow>> {
  const { categoryName, nameFilter, $top, $skip } = input;
  const params: Record<string, unknown> = {};
  if (categoryName) params['categoryName'] = categoryName;
  if (nameFilter) params['name'] = nameFilter;
  // VCO uses maxResult/startIndex instead of $top/$skip
  if ($top !== undefined) params['maxResult'] = $top;
  if ($skip !== undefined) params['startIndex'] = $skip;

  const raw = await vcfGet<VcoListResponse>('/vco/api/workflows', params);
  return normaliseVcoWorkflowList(raw);
}

export async function apiGetVroWorkflow(input: VroWorkflowGetInput): Promise<VcfVroWorkflow> {
  const raw = await vcfGet<Record<string, unknown>>(`/vco/api/workflows/${input.workflowId}`);
  return normaliseVcoWorkflow(raw);
}

export async function apiExecuteVroWorkflow(
  input: VroWorkflowExecuteInput,
): Promise<{ executionId: string; state: string }> {
  const body: Record<string, unknown> = {};
  if (input.inputParameters) body['parameters'] = input.inputParameters;
  return vcfPost(`/vco/api/workflows/${input.workflowId}/executions`, body);
}

export async function apiGetVroExecution(
  input: VroExecutionGetInput,
): Promise<VcfVroExecution> {
  return vcfGet(
    `/vco/api/workflows/${input.workflowId}/executions/${input.executionId}`,
  );
}

export async function apiListVroExecutions(
  input: VroExecutionListInput,
): Promise<VcfPage<VcfVroExecution>> {
  const { workflowId, $top, $skip } = input;
  const params: Record<string, unknown> = {};
  if ($top !== undefined) params['maxResult'] = $top;
  if ($skip !== undefined) params['startIndex'] = $skip;
  return vcfGet(`/vco/api/workflows/${workflowId}/executions`, params);
}
