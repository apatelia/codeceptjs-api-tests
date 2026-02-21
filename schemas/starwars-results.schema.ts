import { z } from 'zod';

const starWarsResultItemSchema = z.object({
  uid: z.string(),
  name: z.string(),
  url: z.url()
});

const socialSchema = z.object({
  discord: z.url().optional(),
  reddit: z.url().optional(),
  github: z.url().optional(),
});

export const schema = z.object({
  message: z.string(),
  /* eslint-disable @typescript-eslint/naming-convention */
  total_records: z.number(),
  total_pages: z.number(),
  /* eslint-enable @typescript-eslint/naming-convention */
  previous: z.string().nullable().optional(),
  next: z.string().nullable().optional(),
  results: z.array(starWarsResultItemSchema),
  social: socialSchema,
  apiVersion: z.string().optional(),
  timestamp: z.iso.datetime().optional(),
  support: z.record(z.string(), z.any()).optional()
});
