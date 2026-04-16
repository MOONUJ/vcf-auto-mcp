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
      'Obtain a VCF Automation Access Token from a Refresh Token. ' +
      'Uses VCF_REFRESH_TOKEN from environment if refreshToken argument is omitted. ' +
      'The token value is masked in the response — only metadata is returned.',
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

    const refreshToken = input.refreshToken ?? config.VCF_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'No refresh token provided and VCF_REFRESH_TOKEN is not set in environment',
      );
    }
    const result = await apiFetchToken(refreshToken);

    // Force the provider cache to update if we used the env token
    if (!input.refreshToken) {
      await tokenProvider.forceRefresh();
    }

    return ok({
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
      // Return only a prefix — never expose the full token in chat
      accessTokenPrefix: result.accessToken.slice(0, 8) + '…[redacted]',
      _note: 'Token cached in-process. Subsequent API calls will use this token automatically.',
    });
  },
};

export const AUTH_TOOLS: ToolEntry[] = [authGetTokenTool];
