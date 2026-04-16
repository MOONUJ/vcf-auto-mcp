/**
 * src/schemas/auth.ts — Zod schemas for the Auth domain
 */

import { z } from 'zod';

export const AuthGetTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(10)
    .describe(
      'VCF Automation API Refresh Token. NEVER logged. ' +
      'If omitted, the server uses VCF_REFRESH_TOKEN from environment.',
    )
    .optional(),
});

export type AuthGetTokenInput = z.infer<typeof AuthGetTokenSchema>;
