/**
 * src/api/client.ts — Axios instance with auth interceptor and retry logic
 *
 * Interceptor pipeline:
 *  Request  → injects Authorization: Bearer <token>
 *  Response → on 401: force-refreshes token and retries once
 *             on 5xx/network: exponential backoff up to API_MAX_RETRIES
 *
 * All errors are translated to a VcfApiError with a sanitized message.
 * Tokens are never written to error messages or logs.
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { tokenProvider, httpsAgent } from '../auth/tokenProvider.js';
import { config } from '../config.js';

// ─── Retry metadata attached to request config ───────────────────────────────

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _isRetry?: boolean;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.VCF_BASE_URL,
  timeout: config.API_TIMEOUT_MS,
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor: inject Bearer token ────────────────────────────────

apiClient.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig) => {
    try {
      const token = await tokenProvider.getToken();
      reqConfig.headers.set('Authorization', `Bearer ${token}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Token acquisition failed';
      // Do NOT include the token value or refresh_token in the thrown error
      throw new McpError(ErrorCode.InternalError, `Auth error: ${msg}`);
    }
    return reqConfig;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response interceptor: 401 retry + 5xx exponential backoff ───────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const reqConfig = error.config as RetryConfig | undefined;

    if (!reqConfig) {
      return Promise.reject(toMcpError(error));
    }

    const status = error.response?.status;

    // ── 401: force token refresh and retry once ────────────────────────────
    if (status === 401 && !reqConfig._isRetry) {
      reqConfig._isRetry = true;
      try {
        const freshToken = await tokenProvider.forceRefresh();
        reqConfig.headers?.set('Authorization', `Bearer ${freshToken}`);
        return apiClient(reqConfig);
      } catch {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Authentication failed — check VCF_REFRESH_TOKEN',
        );
      }
    }

    // ── 5xx / network errors: exponential backoff retry ───────────────────
    const isTransient =
      !status || (status >= 500 && status < 600) || error.code === 'ECONNRESET';

    if (isTransient) {
      const retryCount = reqConfig._retryCount ?? 0;
      if (retryCount < config.API_MAX_RETRIES) {
        reqConfig._retryCount = retryCount + 1;
        const backoffMs = Math.min(1_000 * 2 ** retryCount, 16_000);
        await sleep(backoffMs);
        return apiClient(reqConfig);
      }
    }

    return Promise.reject(toMcpError(error));
  },
);

// ─── Error translation ────────────────────────────────────────────────────────

function toMcpError(error: AxiosError): McpError {
  const status = error.response?.status;
  const serverMessage = extractServerMessage(error);

  if (status === 400) {
    return new McpError(ErrorCode.InvalidParams, `Bad request: ${serverMessage}`);
  }
  if (status === 401 || status === 403) {
    return new McpError(
      ErrorCode.InvalidRequest,
      `Authorization error (${status}): ${serverMessage}`,
    );
  }
  if (status === 404) {
    return new McpError(ErrorCode.InvalidParams, `Resource not found: ${serverMessage}`);
  }
  if (status === 409) {
    return new McpError(
      ErrorCode.InvalidRequest,
      `Conflict — resource already exists or another operation is in progress: ${serverMessage}`,
    );
  }
  if (status === 422) {
    return new McpError(
      ErrorCode.InvalidParams,
      `Validation failed: ${serverMessage}`,
    );
  }
  if (status === 429) {
    const retryAfter = error.response?.headers?.['retry-after'] as string | undefined;
    const hint = retryAfter ? ` — retry after ${retryAfter}s` : '';
    return new McpError(ErrorCode.InternalError, `Rate limited${hint}`);
  }
  if (status && status >= 500) {
    return new McpError(
      ErrorCode.InternalError,
      `VCF server error (${status}): ${serverMessage}`,
    );
  }

  // Network / timeout
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new McpError(
      ErrorCode.InternalError,
      `Request timed out after ${config.API_TIMEOUT_MS}ms`,
    );
  }

  return new McpError(ErrorCode.InternalError, `Network error: ${error.message}`);
}

function extractServerMessage(error: AxiosError): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = error.response?.data as Record<string, any> | undefined;
  if (!data) return 'No response body';
  return (
    (typeof data['message'] === 'string' ? data['message'] : undefined) ??
    (typeof data['errorMessage'] === 'string' ? data['errorMessage'] : undefined) ??
    JSON.stringify(data).slice(0, 256)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Typed helper used by domain API modules ──────────────────────────────────

export async function vcfGet<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.get<T>(path, { params });
  return response.data;
}

export async function vcfPost<T>(
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.post<T>(path, body, { params });
  return response.data;
}

export async function vcfPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await apiClient.patch<T>(path, body);
  return response.data;
}

export async function vcfPut<T>(path: string, body: unknown): Promise<T> {
  const response = await apiClient.put<T>(path, body);
  return response.data;
}

export async function vcfDelete<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.delete<T>(path, { params });
  return response.data;
}

// Used by domain API modules that need custom Axios config (e.g. specific timeout)
export { type AxiosRequestConfig };
