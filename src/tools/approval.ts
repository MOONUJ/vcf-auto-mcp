/**
 * src/tools/approval.ts — MCP tools for the Approval domain
 *
 * Tools:
 *   vcf_approval_list_requests  — GET /approval/api/approvals
 *   vcf_approval_get_request    — GET /approval/api/approvals/{id}
 *   vcf_approval_decide         — POST /approval/api/approvals/action
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  ApprovalListRequestsSchema, ApprovalGetRequestSchema, ApprovalDecideSchema,
} from '../schemas/approval.js';
import {
  apiListApprovalRequests, apiGetApprovalRequest, apiDecideApprovalRequest,
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
      name: 'vcf_approval_list_requests',
      description:
        'List pending (or historical) approval requests for deployments. ' +
        'Spec: GET /approval/api/approvals. Uses Spring Pageable pagination.',
      inputSchema: {
        type: 'object',
        properties: {
          requestState: {
            type: 'string',
            enum: ['APPROVED', 'REJECTED', 'PENDING', 'EXPIRED', 'CANCELLED'],
            description: 'Filter by approval request state',
          },
          search: {
            type: 'string',
            description: 'Search across deploymentId, deploymentName, projectId, requestedBy or action',
          },
          page: { type: 'number', description: 'Zero-based page index (default 0)' },
          size: { type: 'number', description: 'Items per page (default 20)' },
          sort: { type: 'string', description: "Sort criteria, e.g. 'createdAt,DESC'" },
        },
        additionalProperties: false,
      } satisfies Tool['inputSchema'],
    },
    handler: async (args) => {
      try { return ok(await apiListApprovalRequests(ApprovalListRequestsSchema.parse(args))); }
      catch (e) { if (e instanceof McpError) throw e; throw ve(e); }
    },
  },
  {
    definition: {
      name: 'vcf_approval_get_request',
      description: 'Get details of a single approval request. Spec: GET /approval/api/approvals/{id}.',
      inputSchema: {
        type: 'object', required: ['approvalRequestId'],
        properties: { approvalRequestId: { type: 'string', description: 'Approval request UUID' } },
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
      description:
        'Approve, reject, or cancel a pending approval request. ' +
        'Spec: POST /approval/api/approvals/action. ' +
        'Body fields: action (APPROVE/REJECT/CANCEL), comment, itemId (approval request UUID).',
      inputSchema: {
        type: 'object', required: ['approvalRequestId', 'action'],
        properties: {
          approvalRequestId: { type: 'string', description: 'Approval request UUID' },
          action: {
            type: 'string',
            enum: ['APPROVE', 'REJECT', 'CANCEL'],
            description: 'Action to take on the approval request',
          },
          comment: { type: 'string', maxLength: 2048, description: 'Approver comment / justification' },
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
