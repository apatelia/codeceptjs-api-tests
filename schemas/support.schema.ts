import { z } from 'zod';

export const supportSchema = z.object({
  url: z.url(),
  text: z.string()
});
