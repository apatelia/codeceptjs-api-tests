import * as z from 'zod';

const starWarsResultItemSchema = z.object({
  uid: z.string().trim(),
  name: z.string().trim(),
  url: z.url()
});

const socialSchema = z.object({
  discord: z.url().optional(),
  reddit: z.url().optional(),
  github: z.url().optional(),
});

const supportSchema = z.record(
  z.string().trim(),
  z.union([ z.string().trim(), z.object() ])
);

export const starWarsSchema = z.object({
  message: z.string().trim(),
  /* eslint-disable @typescript-eslint/naming-convention */
  total_records: z.number(),
  total_pages: z.number(),
  /* eslint-enable @typescript-eslint/naming-convention */
  previous: z.string().trim().nullable().optional(),
  next: z.string().trim().nullable().optional(),
  results: z.array(starWarsResultItemSchema),
  social: socialSchema,
  apiVersion: z.string().trim().optional(),
  timestamp: z.iso.datetime().optional(),
  support: supportSchema.optional()
});
