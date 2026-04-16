/**
 * src/api/auth.ts — VCF Automation token endpoint
 *
 * This module is intentionally thin: the real token lifecycle is managed
 * by auth/tokenProvider.ts. This file exposes a direct fetch used by the
 * vcf_auth_get_token tool when the caller wants to explicitly verify or
 * obtain a token outside of the automatic refresh cycle.
 */

import axios from 'axios';
import { config } from '../config.js';
import { httpsAgent } from '../auth/tokenProvider.js';
import type { VcfTokenResponse } from '../types/vcf.js';

export async function apiFetchToken(
  refreshToken: string,
): Promise<{ accessToken: string; tokenType: string; expiresIn: number }> {
  const url = `${config.VCF_BASE_URL}/oauth/tenant/${config.VCF_ORG}/token`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await axios.post<VcfTokenResponse>(url, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: config.API_TIMEOUT_MS,
    httpsAgent,
  });

  return {
    accessToken: response.data.access_token,
    tokenType: response.data.token_type,
    expiresIn: response.data.expires_in,
  };
}
