/**
 * src/auth/tokenProvider.ts — In-memory token cache with race-free proactive refresh
 *
 * VCF Automation Auth Strategy:
 *  This instance uses VCF (VCD-based) authentication. Two modes are supported:
 *
 *  Mode A — Refresh Token (preferred, if VCF_REFRESH_TOKEN is set):
 *    POST /oauth/tenant/{org}/token with grant_type=refresh_token
 *    Returns access_token + expires_in.
 *
 *  Mode B — Username/Password session (fallback):
 *    POST /cloudapi/1.0.0/sessions with Basic auth (user@org:password)
 *    Returns x-vmware-vcloud-access-token header as a short-lived JWT.
 *    Session-based tokens expire in ~60 minutes. The server re-authenticates
 *    automatically when the token nears expiry.
 *
 * Design constraints:
 *  - No file I/O — tokens live only in process memory
 *  - Single in-flight refresh promise prevents thundering-herd on expiry
 *  - Proactive refresh fires BUFFER_SECONDS before actual expiry
 *  - Tokens are NEVER written to logs or stdout
 */

import axios from 'axios';
import https from 'https';
import { config } from '../config.js';

// Shared HTTPS agent that disables certificate verification for self-signed certs
export const httpsAgent = new https.Agent({ rejectUnauthorized: false });

interface TokenCache {
  accessToken: string;
  /** Unix timestamp (ms) when the token actually expires */
  expiresAt: number;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
}

class TokenProvider {
  private cache: TokenCache | null = null;
  /** Deduplication lock: while a refresh is in-flight, all callers await the same promise */
  private refreshPromise: Promise<string> | null = null;

  /**
   * Returns a valid access token, refreshing proactively if the cached token
   * is within BUFFER_SECONDS of expiry or has already expired.
   */
  async getToken(): Promise<string> {
    const bufferMs = config.TOKEN_REFRESH_BUFFER_SECONDS * 1_000;

    if (this.cache && Date.now() < this.cache.expiresAt - bufferMs) {
      return this.cache.accessToken;
    }

    // Deduplicate: if a refresh is already in-flight, wait for it
    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchNewToken().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  /**
   * Forces a token refresh regardless of the current cache state.
   * Use this when a 401 is returned by any downstream API call.
   */
  async forceRefresh(): Promise<string> {
    this.cache = null;
    return this.getToken();
  }

  /** Clears the in-memory cache (useful for testing) */
  clearCache(): void {
    this.cache = null;
    this.refreshPromise = null;
  }

  private async fetchNewToken(): Promise<string> {
    // Try Mode A first: OAuth2 refresh_token grant
    if (config.VCF_REFRESH_TOKEN && config.VCF_REFRESH_TOKEN.length >= 10) {
      try {
        return await this.fetchViaRefreshToken();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(
          `[vcf-auto-mcp] Refresh token grant failed (${msg}), falling back to session auth\n`,
        );
      }
    }

    // Mode B: VCD session-based authentication
    return this.fetchViaSession();
  }

  /** Mode A: POST /oauth/tenant/{org}/token with grant_type=refresh_token */
  private async fetchViaRefreshToken(): Promise<string> {
    const url = `${config.VCF_BASE_URL}/oauth/tenant/${config.VCF_ORG}/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.VCF_REFRESH_TOKEN ?? '',
    });

    const response = await axios.post<OAuthTokenResponse>(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: config.API_TIMEOUT_MS,
      httpsAgent,
    });

    const { access_token, expires_in } = response.data;
    if (!access_token) throw new Error('Token endpoint returned empty access_token');

    this.cache = {
      accessToken: access_token,
      expiresAt: Date.now() + expires_in * 1_000,
    };

    process.stderr.write(
      `[vcf-auto-mcp] Token refreshed via refresh_token — expires in ${expires_in}s\n`,
    );

    return this.cache.accessToken;
  }

  /**
   * Mode B: Authenticate using username/password via VCD cloudapi sessions endpoint.
   * Returns the x-vmware-vcloud-access-token JWT header value.
   * Session tokens have a fixed lifetime (typically 3600s = 1 hour).
   */
  private async fetchViaSession(): Promise<string> {
    const url = `${config.VCF_BASE_URL}/cloudapi/1.0.0/sessions`;
    if (!config.VCF_USERNAME || !config.VCF_PASSWORD) {
      throw new Error(
        'VCF_USERNAME and VCF_PASSWORD must be set when VCF_REFRESH_TOKEN is not provided',
      );
    }

    const credentials = Buffer.from(
      `${config.VCF_USERNAME}@${config.VCF_ORG}:${config.VCF_PASSWORD}`,
    ).toString('base64');

    const response = await axios.post(url, null, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json;version=41.0.0-alpha',
        'Content-Type': 'application/json',
      },
      timeout: config.API_TIMEOUT_MS,
      httpsAgent,
    });

    const accessToken = response.headers['x-vmware-vcloud-access-token'] as string | undefined;
    if (!accessToken) {
      throw new Error('Session endpoint did not return x-vmware-vcloud-access-token header');
    }

    // Session tokens expire in 3600s by default; use 3500s as a safe estimate
    const expiresIn = 3500;
    this.cache = {
      accessToken,
      expiresAt: Date.now() + expiresIn * 1_000,
    };

    process.stderr.write(
      `[vcf-auto-mcp] Token refreshed via session auth — expires in ~${expiresIn}s\n`,
    );

    return this.cache.accessToken;
  }
}

// Singleton — one shared cache per process
export const tokenProvider = new TokenProvider();
