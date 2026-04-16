/**
 * src/schemas/projects.ts — Zod schemas for the Projects domain
 */

import { z } from 'zod';
import { PaginationSchema, UUIDSchema, ProjectIdSchema } from './common.js';

const MemberSchema = z.object({
  email: z.string().email(),
  type: z.enum(['user', 'group']),
});

export const ProjectListSchema = PaginationSchema;

export const ProjectGetSchema = ProjectIdSchema;

export const ProjectCreateSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(1024).optional(),
  administrators: z.array(MemberSchema).min(1).describe('At least one admin required'),
  members: z.array(MemberSchema).default([]),
  viewers: z.array(MemberSchema).default([]),
  zoneAssignmentConfigs: z
    .array(z.object({ zoneId: UUIDSchema, priority: z.number().int().min(0) }))
    .optional(),
});

export const ProjectUpdateSchema = ProjectIdSchema.extend({
  name: z.string().min(1).max(256).optional(),
  description: z.string().max(1024).optional(),
  administrators: z.array(MemberSchema).optional(),
  members: z.array(MemberSchema).optional(),
  viewers: z.array(MemberSchema).optional(),
});

export const ProjectDeleteSchema = ProjectIdSchema;

export type ProjectListInput = z.infer<typeof ProjectListSchema>;
export type ProjectGetInput = z.infer<typeof ProjectGetSchema>;
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
export type ProjectDeleteInput = z.infer<typeof ProjectDeleteSchema>;
