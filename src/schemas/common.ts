/**
 * src/schemas/common.ts — Shared Zod schemas re-used across all domains
 *
 * Usage pattern in domain schemas:
 *   import { PaginationSchema, UUIDSchema } from '../schemas/common.js';
 *   const MySchema = PaginationSchema.extend({ ... });
 */

import { z } from 'zod';

// ─── Primitive building blocks ────────────────────────────────────────────────

/** RFC 4122 UUID — lowercase hex with hyphens */
export const UUIDSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    'Must be a valid RFC 4122 UUID (lowercase)',
  );

/** ISO 8601 date-time string */
export const ISO8601Schema = z.string().datetime({ message: 'Must be ISO 8601 date-time' });

/** Non-empty string up to maxLength */
export const NonEmptyStringSchema = (maxLength: number) =>
  z.string().min(1).max(maxLength);

// ─── Pagination (OData-style) ─────────────────────────────────────────────────

/**
 * PaginationSchema — extend this for any list tool that accepts OData params.
 *
 * @example
 * const DeploymentListSchema = PaginationSchema.extend({
 *   projectId: UUIDSchema.optional(),
 * });
 */
export const PaginationSchema = z.object({
  $top: z.coerce
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(20)
    .describe('Maximum number of items to return (page size)'),

  $skip: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Number of items to skip (offset-based pagination)'),

  $filter: z
    .string()
    .max(512)
    .optional()
    .describe("OData filter expression, e.g. \"status eq 'CREATE_SUCCESSFUL'\""),

  $orderby: z
    .string()
    .max(128)
    .optional()
    .describe("Sort field and direction, e.g. 'createdAt desc'"),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// ─── Deployment status enum ───────────────────────────────────────────────────

export const DeploymentStatusSchema = z.enum([
  'CREATE_SUCCESSFUL',
  'CREATE_INPROGRESS',
  'CREATE_FAILED',
  'UPDATE_SUCCESSFUL',
  'UPDATE_INPROGRESS',
  'UPDATE_FAILED',
  'DELETE_INPROGRESS',
  'DELETE_FAILED',
  'ACTION_INPROGRESS',
  'ACTION_SUCCESSFUL',
  'ACTION_FAILED',
]);

// ─── Async status enum ────────────────────────────────────────────────────────

export const AsyncStatusSchema = z.enum([
  'PENDING',
  'INPROGRESS',
  'SUCCESSFUL',
  'FAILED',
  'CANCELLED',
]);

// ─── Single-resource ID schemas (by domain) ───────────────────────────────────

export const DeploymentIdSchema = z.object({
  deploymentId: UUIDSchema.describe('Deployment UUID'),
});

export const ProjectIdSchema = z.object({
  projectId: UUIDSchema.describe('Project UUID'),
});

export const BlueprintIdSchema = z.object({
  blueprintId: UUIDSchema.describe('Blueprint UUID'),
});

export const ResourceIdSchema = z.object({
  resourceId: UUIDSchema.describe('Resource UUID'),
});

export const RequestIdSchema = z.object({
  requestId: UUIDSchema.describe('Async request UUID'),
});

// ─── Helpers for converting Zod schema to MCP inputSchema (JSON Schema) ───────

/**
 * Converts a Zod object schema to a plain JSON Schema object compatible
 * with MCP tool inputSchema field.
 *
 * This is a lightweight projection — it does NOT recurse deeply.
 * For complex nested schemas use zodToJsonSchema from a dedicated library.
 */
export function toInputSchema(
  schema: z.ZodObject<z.ZodRawShape>,
): Record<string, unknown> {
  // We rely on Zod's built-in _def for minimal projection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape = schema.shape as Record<string, any>;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, field] of Object.entries(shape)) {
    const isOptional =
      field instanceof z.ZodOptional || field instanceof z.ZodDefault;
    if (!isOptional) {
      required.push(key);
    }
    properties[key] = {
      description:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (field._def?.description as string | undefined) ?? key,
    };
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  };
}
