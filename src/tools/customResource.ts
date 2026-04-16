/**
 * src/tools/customResource.ts — MCP tool definitions and handlers for the Custom Resource domain
 *
 * Covers two sub-domains:
 *   - Custom Resource Types  (vcf_custom_resource_type_*)
 *   - Resource Actions       (vcf_custom_resource_action_*)
 *
 * Each tool follows the 3-step pattern: validate → call API → format response.
 *
 * Security classification:
 *   READ        — list, get, get_form_data
 *   WRITE       — create
 *   DESTRUCTIVE — delete (guarded by dryRun flag)
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolEntry } from './deployments.js';
import {
  CustomResourceTypeListSchema,
  CustomResourceTypeIdSchema,
  CustomResourceTypeCreateSchema,
  CustomResourceActionListSchema,
  CustomResourceActionIdSchema,
  CustomResourceActionFormDataSchema,
} from '../schemas/customResource.js';
import {
  apiListCustomResourceTypes,
  apiGetCustomResourceType,
  apiCreateCustomResourceType,
  apiDeleteCustomResourceType,
  apiListResourceActions,
  apiGetResourceAction,
  apiGetResourceActionFormData,
} from '../api/customResource.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Tool: vcf_custom_resource_type_list ─────────────────────────────────────

const customResourceTypeListTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_type_list',
    description:
      'List VCF Automation custom resource types. ' +
      'Supports filtering by propertiesFormat and runnableId. ' +
      'Pagination uses zero-based page/size (Spring Pageable style).',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Zero-based page number (default 0)',
        },
        size: {
          type: 'number',
          description: 'Page size (default 20, max 200)',
        },
        sort: {
          type: 'string',
          description: "Sort expression, e.g. 'displayName,asc'",
        },
        propertiesFormat: {
          type: 'string',
          enum: ['YAML', 'JSON'],
          description: "Format of the propertiesYaml field in the response",
        },
        runnableId: {
          type: 'string',
          description: 'Filter by associated runnable item ID (ABX action or vRO workflow)',
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = CustomResourceTypeListSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiListCustomResourceTypes(input);
    return ok(result);
  },
};

// ─── Tool: vcf_custom_resource_type_get ──────────────────────────────────────

const customResourceTypeGetTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_type_get',
    description: 'Get full details of a single VCF Automation custom resource type by UUID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Custom Resource Type UUID',
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = CustomResourceTypeIdSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiGetCustomResourceType(input);
    return ok(result);
  },
};

// ─── Tool: vcf_custom_resource_type_create ────────────────────────────────────

const customResourceTypeCreateTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_type_create',
    description:
      'Create a new custom resource type in VCF Automation. ' +
      'Provide a displayName and optionally a propertiesYaml string defining the resource property schema.',
    inputSchema: {
      type: 'object',
      required: ['displayName'],
      properties: {
        displayName: {
          type: 'string',
          description: 'Human-readable display name for the resource type',
          minLength: 1,
          maxLength: 256,
        },
        description: {
          type: 'string',
          description: 'Optional description',
          maxLength: 1024,
        },
        resourceType: {
          type: 'string',
          description: "Internal resource type identifier used in blueprints (e.g. 'Custom.MyType')",
          maxLength: 256,
        },
        externalType: {
          type: 'string',
          description: 'External system type identifier',
          maxLength: 256,
        },
        projectId: {
          type: 'string',
          description: 'Project UUID to scope this resource type',
        },
        propertiesYaml: {
          type: 'string',
          description: 'YAML string defining the resource property schema',
        },
        schemaType: {
          type: 'string',
          description: 'Schema type descriptor',
          maxLength: 128,
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = CustomResourceTypeCreateSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiCreateCustomResourceType(input);
    return ok(result);
  },
};

// ─── Tool: vcf_custom_resource_type_delete ────────────────────────────────────

const customResourceTypeDeleteTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_type_delete',
    description:
      'Delete a VCF Automation custom resource type by UUID. ' +
      'DESTRUCTIVE — irreversible. ' +
      'Set dryRun=true to confirm the target before actually deleting.',
    inputSchema: {
      type: 'object',
      required: ['id', 'dryRun'],
      properties: {
        id: {
          type: 'string',
          description: 'Custom Resource Type UUID to delete',
        },
        dryRun: {
          type: 'boolean',
          description: 'true = show what would be deleted without executing; false = actually delete',
          default: true,
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let id: string;
    let dryRun: boolean;
    try {
      const raw = args as Record<string, unknown>;
      // Validate id via existing schema
      const parsed = CustomResourceTypeIdSchema.parse({ id: raw['id'] });
      id = parsed.id;
      // dryRun defaults to true for safety
      dryRun = raw['dryRun'] === false ? false : true;
    } catch (err) {
      throw parseError(err);
    }

    if (dryRun) {
      // Dry-run: fetch the resource to confirm it exists, then return what would be deleted
      const target = await apiGetCustomResourceType({ id });
      return ok({
        dryRun: true,
        _message: 'DRY RUN — no deletion performed. Set dryRun=false to execute.',
        wouldDelete: target,
      });
    }

    const result = await apiDeleteCustomResourceType({ id });
    return ok({
      deleted: true,
      id,
      result,
    });
  },
};

// ─── Tool: vcf_custom_resource_action_list ────────────────────────────────────

const customResourceActionListTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_action_list',
    description:
      'List VCF Automation custom resource actions. ' +
      'Supports filtering by runnableId. ' +
      'Pagination uses zero-based page/size (Spring Pageable style).',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Zero-based page number (default 0)',
        },
        size: {
          type: 'number',
          description: 'Page size (default 20, max 200)',
        },
        sort: {
          type: 'string',
          description: "Sort expression, e.g. 'displayName,asc'",
        },
        runnableId: {
          type: 'string',
          description: 'Filter by associated runnable item ID',
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = CustomResourceActionListSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiListResourceActions(input);
    return ok(result);
  },
};

// ─── Tool: vcf_custom_resource_action_get ─────────────────────────────────────

const customResourceActionGetTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_action_get',
    description: 'Get full details of a single VCF Automation resource action by UUID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Resource Action UUID',
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = CustomResourceActionIdSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiGetResourceAction(input);
    return ok(result);
  },
};

// ─── Tool: vcf_custom_resource_action_get_form_data ──────────────────────────

const customResourceActionGetFormDataTool: ToolEntry = {
  definition: {
    name: 'vcf_custom_resource_action_get_form_data',
    description:
      'Get resolved form data for a VCF Automation resource action. ' +
      'Sends a POST to /form-data with an optional body payload to resolve dynamic form fields. ' +
      'Optionally scoped to a project via projectId.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Resource Action UUID',
        },
        projectId: {
          type: 'string',
          description: 'Project UUID for scoping the form data resolution',
        },
        body: {
          type: 'object',
          description: 'Request body payload for form data resolution',
          additionalProperties: true,
        },
      },
      additionalProperties: false,
    },
  },
  handler: async (args: unknown): Promise<CallToolResult> => {
    let input;
    try {
      input = CustomResourceActionFormDataSchema.parse(args);
    } catch (err) {
      throw parseError(err);
    }
    const result = await apiGetResourceActionFormData(input);
    return ok(result);
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const CUSTOM_RESOURCE_TOOLS: ToolEntry[] = [
  customResourceTypeListTool,
  customResourceTypeGetTool,
  customResourceTypeCreateTool,
  customResourceTypeDeleteTool,
  customResourceActionListTool,
  customResourceActionGetTool,
  customResourceActionGetFormDataTool,
];
