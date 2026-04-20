/**
 * src/tools/auth.ts — MCP tool for Auth domain
 *
 * vcf_auth_get_token: Exchanges a Refresh Token for an Access Token.
 * The tool can use an explicit refreshToken argument, or falls back to
 * the VCF_REFRESH_TOKEN environment variable. The returned accessToken
 * is truncated in the response to avoid exposing it in conversation history.
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AuthGetTokenSchema } from '../schemas/auth.js';
import { apiFetchToken } from '../api/auth.js';
import { tokenProvider } from '../auth/tokenProvider.js';
import { config } from '../config.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

const authGetTokenTool: ToolEntry = {
  definition: {
    name: 'vcf_auth_get_token',
    description:
      'Verify VCF Automation authentication. Forces a fresh token acquisition and returns metadata. ' +
      'Supports both OAuth2 Refresh Token mode (if VCF_REFRESH_TOKEN is set or provided explicitly) ' +
      'and VCD Session mode (username/password). Token value is masked — only metadata is returned.',
    inputSchema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description:
            'Override Refresh Token. If omitted, the server uses VCF_REFRESH_TOKEN env var.',
          minLength: 10,
        },
      },
      additionalProperties: false,
    } satisfies Tool['inputSchema'],
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = AuthGetTokenSchema.parse(args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
    }

    const explicitRefreshToken = input.refreshToken;
    const envRefreshToken = config.VCF_REFRESH_TOKEN;

    // If an explicit refresh token is provided, use the OAuth2 flow directly
    if (explicitRefreshToken) {
      const result = await apiFetchToken(explicitRefreshToken);
      return ok({
        authMode: 'refresh_token',
        tokenType: result.tokenType,
        expiresIn: result.expiresIn,
        accessTokenPrefix: result.accessToken.slice(0, 8) + '…[redacted]',
        _note: 'Token fetched via explicit refresh token. Not cached in-process.',
      });
    }

    // No explicit token supplied — use the tokenProvider (handles both Mode A and Mode B)
    const accessToken = await tokenProvider.forceRefresh();
    const authMode = envRefreshToken ? 'refresh_token (env)' : 'session (username/password)';

    return ok({
      authMode,
      accessTokenPrefix: accessToken.slice(0, 8) + '…[redacted]',
      _note: 'Token refreshed and cached in-process. Subsequent API calls will use this token automatically.',
    });
  },
};

export const AUTH_TOOLS: ToolEntry[] = [authGetTokenTool];
