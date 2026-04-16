/**
 * src/config.ts — Environment variable validation (fail-fast with Zod)
 *
 * Any missing or malformed variable causes an immediate process exit with
 * a clear error message. This prevents the server from starting in a broken
 * state and silently failing on the first API call.
 *
 * Auth modes (in priority order):
 *  1. VCF_REFRESH_TOKEN: OAuth2 refresh_token grant via /oauth/tenant/{org}/token
 *  2. VCF_USERNAME + VCF_PASSWORD: VCD session auth via /cloudapi/1.0.0/sessions
 */

import { z } from 'zod';

const ConfigSchema = z
  .object({
    /** VCF Automation base URL — no trailing slash */
    VCF_BASE_URL: z
      .string()
      .url('VCF_BASE_URL must be a valid URL (e.g. https://auto.gooddi.lab)')
      .transform((v) => v.replace(/\/$/, '')),

    /** OAuth2 tenant/organization name (used in token endpoint path) */
    VCF_ORG: z.string().min(1, 'VCF_ORG must not be empty'),

    /**
     * Long-lived Refresh Token / API Token from VCF Automation UI.
     * Optional — if absent or empty, the server falls back to VCF_USERNAME + VCF_PASSWORD.
     */
    VCF_REFRESH_TOKEN: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),

    /**
     * VCF Automation username (without @org suffix).
     * Required when VCF_REFRESH_TOKEN is not provided.
     */
    VCF_USERNAME: z.string().min(1).optional().default(''),

    /**
     * VCF Automation password.
     * Required when VCF_REFRESH_TOKEN is not provided.
     */
    VCF_PASSWORD: z.string().min(1).optional().default(''),

    /** Seconds before expiry to proactively refresh the access token */
    TOKEN_REFRESH_BUFFER_SECONDS: z.coerce
      .number()
      .int()
      .min(30)
      .max(3600)
      .default(300),

    /** HTTP request timeout in milliseconds */
    API_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120_000).default(30_000),

    /** Maximum retry attempts for transient errors */
    API_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),

    /** Log level */
    LOG_LEVEL: z
      .enum(['error', 'warn', 'info', 'debug'])
      .default('info'),
  })
  .superRefine((data, ctx) => {
    // Require either refresh token OR username+password
    const hasRefreshToken = data.VCF_REFRESH_TOKEN !== undefined && data.VCF_REFRESH_TOKEN.length >= 10;
    const hasCredentials =
      data.VCF_USERNAME !== undefined && data.VCF_USERNAME.length > 0 &&
      data.VCF_PASSWORD !== undefined && data.VCF_PASSWORD.length > 0;

    if (!hasRefreshToken && !hasCredentials) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VCF_REFRESH_TOKEN'],
        message:
          'Either VCF_REFRESH_TOKEN or both VCF_USERNAME and VCF_PASSWORD must be provided',
      });
    }
  });

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    process.stderr.write(
      `[vcf-auto-mcp] Configuration error — server cannot start:\n${issues}\n`,
    );
    process.exit(1);
  }
  return result.data;
}

export const config: Config = loadConfig();
