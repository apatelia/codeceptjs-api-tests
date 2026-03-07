import * as z from 'zod';

export const metaSchema = z.record(
  z.string().trim(),
  z.union([ z.string().trim(), z.object() ])
);
