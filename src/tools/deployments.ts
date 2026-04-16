/**
 * src/tools/deployments.ts — MCP tool definitions and handlers for the Deployments domain
 *
 * Each exported entry in DEPLOYMENT_TOOLS is a { definition, handler } pair.
 * server.ts calls registerTools(server, DEPLOYMENT_TOOLS) to mount them.
 *
 * Handler 3-step pattern:
 *   1. Validate — Zod .parse() throws McpError on invalid input
 *   2. Call API  — domain API function
 *   3. Format    — shape the response into MCP content array
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  DeploymentListSchema,
  DeploymentGetSchema,
  DeploymentCreateSchema,
  DeploymentUpdateSchema,
  DeploymentDeleteSchema,
  DeploymentGetStatusSchema,
  DeploymentRunActionSchema,
} from '../schemas/deployments.js';
import {
  apiListDeployments,
  apiGetDeployment,
  apiCreateDeployment,
  apiUpdateDeployment,
  apiDeleteDeployment,
  apiGetDeploymentStatus,
  apiRunDeploymentAction,
} from '../api/deployments.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolEntry {
  definition: Tool;
  handler: (args: unknown) => Promise<CallToolResult>;
}

// ─── Helper: wrap response as MCP text content ───────────────────────────────

function ok(data: unknown): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

function parseError(err: unknown): McpError {
  if (err instanceof McpError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  return new McpError(ErrorCode.InvalidParams, `Input validation failed: ${msg}`);
}

// ─── Tool: vcf_deployment_list ────────────────────────────────────────────────

const deploymentListTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_list',
    description:
      'List VCF Automation deployments. Supports filtering by project, status, and OData pagination ($top, $skip, $filter, $orderby).',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Filter by project UUID',
        },
        status: {
          type: 'string',
          enum: [
            'CREATE_SUCCESSFUL', 'CREATE_INPROGRESS', 'CREATE_FAILED',
            'UPDATE_SUCCESSFUL', 'UPDATE_INPROGRESS', 'UPDATE_FAILED',
            'DELETE_INPROGRESS', 'DELETE_FAILED',
            'ACTION_INPROGRESS', 'ACTION_SUCCESSFUL', 'ACTION_FAILED',
          ],
          description: 'Filter by deployment status',
        },
        $top: { type: 'number', description: 'Max items to return (default 20, max 1000)' },
        $skip: { type: 'number', description: 'Items to skip for pagination' },
        $filter: { type: 'string', description: "OData filter, e.g. \"name eq 'my-deploy'\"" },
        $orderby: { type: 'string', description: "Sort field, e.g. 'createdAt desc'" },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    // Step 1 — Validate
    let input;
    try {
      input = DeploymentListSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    // Step 2 — Call API
    const result = await apiListDeployments(input);
    // Step 3 — Format
    return ok(result);
  },
};

// ─── Tool: vcf_deployment_get ─────────────────────────────────────────────────

const deploymentGetTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_get',
    description:
      'Get full details of a single VCF Automation deployment, including status, inputs, last action, and optionally its provisioned resources.',
    inputSchema: {
      type: 'object',
      required: ['deploymentId'],
      properties: {
        deploymentId: { type: 'string', description: 'Deployment UUID' },
        expandResources: {
          type: 'boolean',
          description: 'Include provisioned resource list in response (default false)',
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = DeploymentGetSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiGetDeployment(input);
    return ok(result);
  },
};

// ─── Tool: vcf_deployment_create ──────────────────────────────────────────────

const deploymentCreateTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_create',
    description:
      'Create a new VCF Automation deployment from a blueprint. This is an async operation — ' +
      'the tool returns immediately with a deploymentId and requestId. ' +
      'Use vcf_deployment_get_status to poll until status is SUCCESSFUL or FAILED.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'deploymentName', 'blueprintId'],
      properties: {
        projectId: { type: 'string', description: 'Target project UUID' },
        deploymentName: {
          type: 'string',
          description: 'Unique deployment name (alphanumeric, hyphens, underscores, spaces)',
          minLength: 1,
          maxLength: 256,
        },
        description: { type: 'string', maxLength: 1024 },
        blueprintId: { type: 'string', description: 'Blueprint UUID' },
        blueprintVersion: { type: 'string', description: 'Blueprint version (omit for latest released)' },
        inputs: {
          type: 'object',
          description: 'Blueprint input parameter key-value map',
          additionalProperties: true,
        },
        reason: { type: 'string', maxLength: 512, description: 'Request reason for approval workflow' },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = DeploymentCreateSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiCreateDeployment(input);
    return ok({
      ...result,
      _hint: 'Poll with vcf_deployment_get_status until status is SUCCESSFUL or FAILED',
    });
  },
};

// ─── Tool: vcf_deployment_update ──────────────────────────────────────────────

const deploymentUpdateTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_update',
    description:
      'Update a deployment name, description, or input parameters. ' +
      'Changing inputs triggers a Day-2 Update action (async). Returns requestId for polling.',
    inputSchema: {
      type: 'object',
      required: ['deploymentId'],
      properties: {
        deploymentId: { type: 'string', description: 'Deployment UUID' },
        name: { type: 'string', minLength: 1, maxLength: 256 },
        description: { type: 'string', maxLength: 1024 },
        inputs: { type: 'object', additionalProperties: true },
        reason: { type: 'string', maxLength: 512 },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = DeploymentUpdateSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiUpdateDeployment(input);
    return ok(result);
  },
};

// ─── Tool: vcf_deployment_delete ──────────────────────────────────────────────

const deploymentDeleteTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_delete',
    description:
      'Delete a VCF Automation deployment and all its provisioned resources. ' +
      'DESTRUCTIVE — irreversible. Run with dryRun=true first to see affected resources. ' +
      'Set dryRun=false explicitly to execute the deletion.',
    inputSchema: {
      type: 'object',
      required: ['deploymentId', 'dryRun'],
      properties: {
        deploymentId: { type: 'string', description: 'Deployment UUID to delete' },
        dryRun: {
          type: 'boolean',
          description: 'true = show affected resources only; false = actually delete',
          default: true,
        },
        forceDelete: {
          type: 'boolean',
          description: 'Remove deployment record even if resource cleanup fails (orphan risk)',
          default: false,
        },
        reason: { type: 'string', minLength: 5, maxLength: 512 },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = DeploymentDeleteSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiDeleteDeployment(input);
    return ok(result);
  },
};

// ─── Tool: vcf_deployment_get_status ─────────────────────────────────────────

const deploymentGetStatusTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_get_status',
    description:
      'Poll the status of an async deployment operation (create / update / delete / day-2 action). ' +
      'Call repeatedly until status is SUCCESSFUL or FAILED.',
    inputSchema: {
      type: 'object',
      required: ['deploymentId', 'requestId'],
      properties: {
        deploymentId: { type: 'string', description: 'Deployment UUID' },
        requestId: {
          type: 'string',
          description: 'Request UUID returned by the async operation',
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = DeploymentGetStatusSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiGetDeploymentStatus(input);
    return ok(result);
  },
};

// ─── Tool: vcf_deployment_run_action ─────────────────────────────────────────

const deploymentRunActionTool: ToolEntry = {
  definition: {
    name: 'vcf_deployment_run_action',
    description:
      'Execute a Day-2 action (e.g. PowerOff, Resize, ChangeOwner) on a deployment. ' +
      'Available actions depend on the current deployment state. Async — returns requestId for polling.',
    inputSchema: {
      type: 'object',
      required: ['deploymentId', 'actionId'],
      properties: {
        deploymentId: { type: 'string', description: 'Deployment UUID' },
        actionId: {
          type: 'string',
          description: 'Action ID, e.g. "Deployment.PowerOff"',
        },
        inputs: { type: 'object', additionalProperties: true },
        reason: { type: 'string', maxLength: 512 },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = DeploymentRunActionSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiRunDeploymentAction(input);
    return ok({
      ...result,
      _hint: 'Poll with vcf_deployment_get_status to track action progress',
    });
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const DEPLOYMENT_TOOLS: ToolEntry[] = [
  deploymentListTool,
  deploymentGetTool,
  deploymentCreateTool,
  deploymentUpdateTool,
  deploymentDeleteTool,
  deploymentGetStatusTool,
  deploymentRunActionTool,
];
