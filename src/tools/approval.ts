/**
 * src/tools/approval.ts — MCP tools for the Approval domain
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  ApprovalListPoliciesSchema, ApprovalGetRequestSchema, ApprovalDecideSchema,
} from '../schemas/approval.js';
import {
  apiListApprovalPolicies, apiGetApprovalRequest, apiDecideApprovalRequest,
} from '../api/approval.js';
import type { ToolEntry } from './deployments.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function ve(err: unknown): McpError {
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

export const APPROVAL_TOOLS: ToolEntry[] = [
  {
    definition: {
      name: 'vcf_approval_list_policies',
      description: 'List approval policies, optionally filtered by project or enabled state.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string' }, enabled: { type: 'boolean' },
          $top: { type: 'number' }, $skip: { type: 'number' },
          $filter: { type: 'string' }, $orderby: { type: 'string' },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListApprovalPolicies(ApprovalListPoliciesSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_approval_get_request',
      description: 'Get details of a pending approval request.',
      inputSchema: {
        type: 'object', required: ['approvalRequestId'],
        properties: { approvalRequestId: { type: 'string' } },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiGetApprovalRequest(ApprovalGetRequestSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_approval_decide',
      description: 'Approve or reject a pending approval request. A justification is required.',
      inputSchema: {
        type: 'object', required: ['approvalRequestId', 'decision', 'justification'],
        properties: {
          approvalRequestId: { type: 'string' },
          decision: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
          justification: { type: 'string', minLength: 5, maxLength: 1024 },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiDecideApprovalRequest(ApprovalDecideSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
];
