/**
 * src/api/vroVco.ts — Direct vRO API calls via /vco/api/
 *
 * Uses the same Bearer token auth as all other API modules (injected by the
 * Axios interceptor in api/client.ts).  The /vco/api/ responses follow a
 * HAL-like "link" envelope that differs from the Spring pageable envelope used
 * by the OrchestratorGateway /vro/ paths.
 *
 * Response normalisation helpers:
 *   parseVcoAttrs   — flattens the attributes array into a plain key→value map
 *   normalizeVcoList — maps a raw VCO link-list into a consistent { items, total } shape
 */

import { vcfGet, vcfPost } from './client.js';
import type {
  VcoWorkflowListInput,
  VcoWorkflowGetInput,
  VcoWorkflowExecuteInput,
  VcoExecutionListInput,
  VcoExecutionGetInput,
  VcoExecutionLogsInput,
  VcoCategoryListInput,
  VcoCategoryGetInput,
  VcoActionListInput,
  VcoActionGetInput,
  VcoPackageListInput,
  VcoPackageGetInput,
} from '../schemas/vroVco.js';

// ─── VCO response types ───────────────────────────────────────────────────────

/** A single attribute in a VCO link item's attributes array */
interface VcoAttribute {
  name: string;
  value?: string;
}

/** A single item inside the VCO "link" envelope */
interface VcoLinkItem {
  href?: string;
  rel?: string;
  attributes?: VcoAttribute[];
}

/** Raw VCO list response envelope */
interface VcoListResponse {
  link?: VcoLinkItem[];
  total?: number;
  'last-item-token'?: string;
}

// ─── Normalisation helpers ────────────────────────────────────────────────────

/**
 * Flattens a VCO link item's attributes array into a plain key → value map.
 * Attributes with a missing value are mapped to an empty string.
 *
 * @param link - A single item from the VCO "link" envelope
 * @returns A flat record of attribute name → string value
 *
 * @example
 * parseVcoAttrs({ attributes: [{ name: "id", value: "abc" }, { name: "name" }] })
 * // => { id: "abc", name: "" }
 */
function parseVcoAttrs(link: VcoLinkItem): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of link.attributes ?? []) {
    out[attr.name] = attr.value ?? '';
  }
  if (link.href !== undefined) out['href'] = link.href;
  return out;
}

/**
 * Maps a raw VCO list response into a normalised shape:
 * { items: T[], total: number, lastItemToken?: string }
 *
 * @param raw - The raw VCO list response (link + total + last-item-token)
 * @param mapper - Function that converts a flattened attribute map into T
 * @returns Normalised page object
 */
function normalizeVcoList<T>(
  raw: VcoListResponse,
  mapper: (attrs: Record<string, string>) => T,
): { items: T[]; total: number; lastItemToken?: string } {
  const items = (raw.link ?? []).map((l) => mapper(parseVcoAttrs(l)));
  return {
    items,
    total: raw.total ?? items.length,
    ...(raw['last-item-token'] !== undefined
      ? { lastItemToken: raw['last-item-token'] }
      : {}),
  };
}

// ─── Workflow API ─────────────────────────────────────────────────────────────

/**
 * Lists vRO workflows from GET /vco/api/workflows.
 * Supports pagination (maxResult/startIndex) and optional filters.
 *
 * @param input - Validated VcoWorkflowListInput
 * @returns Normalised page of workflow summaries
 */
export async function apiVcoListWorkflows(input: VcoWorkflowListInput): Promise<unknown> {
  const params: Record<string, unknown> = {
    maxResult: input.maxResult,
    startIndex: input.startIndex,
  };
  if (input.categoryId !== undefined) params['categoryId'] = input.categoryId;
  if (input.name !== undefined) params['name'] = input.name;

  const raw = await vcfGet<VcoListResponse>('/vco/api/workflows', params);
  return normalizeVcoList(raw, (attrs) => attrs);
}

/**
 * Gets a single vRO workflow definition from GET /vco/api/workflows/{id}.
 *
 * @param input - Validated VcoWorkflowGetInput
 * @returns Raw workflow detail object including input-parameters
 */
export async function apiVcoGetWorkflow(input: VcoWorkflowGetInput): Promise<unknown> {
  return vcfGet<unknown>(`/vco/api/workflows/${input.id}`);
}

/**
 * Executes a vRO workflow via POST /vco/api/workflows/{id}/executions.
 * Returns the execution record including the execution ID for polling.
 *
 * @param input - Validated VcoWorkflowExecuteInput (id, parameters)
 * @returns Raw execution response containing the execution URL/ID
 */
export async function apiVcoExecuteWorkflow(input: VcoWorkflowExecuteInput): Promise<unknown> {
  const body: Record<string, unknown> = {};
  if (input.parameters !== undefined) {
    body['parameters'] = input.parameters;
  }
  return vcfPost<unknown>(`/vco/api/workflows/${input.id}/executions`, body);
}

// ─── Execution API ────────────────────────────────────────────────────────────

/**
 * Lists executions for a workflow from GET /vco/api/workflows/{id}/executions.
 *
 * @param input - Validated VcoExecutionListInput (id, maxResult, startIndex)
 * @returns Normalised page of execution summaries
 */
export async function apiVcoListExecutions(input: VcoExecutionListInput): Promise<unknown> {
  const raw = await vcfGet<VcoListResponse>(
    `/vco/api/workflows/${input.id}/executions`,
    { maxResult: input.maxResult, startIndex: input.startIndex },
  );
  return normalizeVcoList(raw, (attrs) => attrs);
}

/**
 * Gets a single workflow execution from GET /vco/api/workflows/{id}/executions/{execId}.
 *
 * @param input - Validated VcoExecutionGetInput (id, execId)
 * @returns Raw execution detail object including state and output parameters
 */
export async function apiVcoGetExecution(input: VcoExecutionGetInput): Promise<unknown> {
  return vcfGet<unknown>(`/vco/api/workflows/${input.id}/executions/${input.execId}`);
}

/**
 * Retrieves logs for a workflow execution from
 * GET /vco/api/workflows/{id}/executions/{execId}/logs.
 *
 * @param input - Validated VcoExecutionLogsInput (id, execId, maxResult)
 * @returns Raw log entries response
 */
export async function apiVcoGetExecutionLogs(input: VcoExecutionLogsInput): Promise<unknown> {
  return vcfGet<unknown>(
    `/vco/api/workflows/${input.id}/executions/${input.execId}/logs`,
    { maxResult: input.maxResult },
  );
}

// ─── Category API ─────────────────────────────────────────────────────────────

/**
 * Lists vRO categories from GET /vco/api/categories.
 * Pass isRoot=true to retrieve only top-level categories.
 *
 * @param input - Validated VcoCategoryListInput (maxResult, isRoot)
 * @returns Normalised page of category summaries
 */
export async function apiVcoListCategories(input: VcoCategoryListInput): Promise<unknown> {
  const params: Record<string, unknown> = { maxResult: input.maxResult };
  if (input.isRoot !== undefined) params['isRoot'] = input.isRoot;

  const raw = await vcfGet<VcoListResponse>('/vco/api/categories', params);
  return normalizeVcoList(raw, (attrs) => attrs);
}

/**
 * Gets a single vRO category from GET /vco/api/categories/{id}.
 *
 * @param input - Validated VcoCategoryGetInput (id)
 * @returns Raw category detail object
 */
export async function apiVcoGetCategory(input: VcoCategoryGetInput): Promise<unknown> {
  return vcfGet<unknown>(`/vco/api/categories/${input.id}`);
}

// ─── Action API ───────────────────────────────────────────────────────────────

/**
 * Lists vRO actions from GET /vco/api/actions.
 *
 * @param input - Validated VcoActionListInput (maxResult, startIndex)
 * @returns Normalised page of action summaries
 */
export async function apiVcoListActions(input: VcoActionListInput): Promise<unknown> {
  const raw = await vcfGet<VcoListResponse>(
    '/vco/api/actions',
    { maxResult: input.maxResult, startIndex: input.startIndex },
  );
  return normalizeVcoList(raw, (attrs) => attrs);
}

/**
 * Gets a single vRO action from GET /vco/api/actions/{id}.
 * The id is the qualified name, e.g. "com.example.module/actionName".
 *
 * @param input - Validated VcoActionGetInput (id)
 * @returns Raw action detail object
 */
export async function apiVcoGetAction(input: VcoActionGetInput): Promise<unknown> {
  return vcfGet<unknown>(`/vco/api/actions/${input.id}`);
}

// ─── Package API ──────────────────────────────────────────────────────────────

/**
 * Lists vRO packages from GET /vco/api/packages.
 *
 * @param input - Validated VcoPackageListInput (maxResult, startIndex)
 * @returns Normalised page of package summaries
 */
export async function apiVcoListPackages(input: VcoPackageListInput): Promise<unknown> {
  const raw = await vcfGet<VcoListResponse>(
    '/vco/api/packages',
    { maxResult: input.maxResult, startIndex: input.startIndex },
  );
  return normalizeVcoList(raw, (attrs) => attrs);
}

/**
 * Gets a single vRO package from GET /vco/api/packages/{name}.
 * The name is the package's dotted identifier, e.g. "com.example.mypackage".
 *
 * @param input - Validated VcoPackageGetInput (name)
 * @returns Raw package detail object
 */
export async function apiVcoGetPackage(input: VcoPackageGetInput): Promise<unknown> {
  return vcfGet<unknown>(`/vco/api/packages/${input.name}`);
}
