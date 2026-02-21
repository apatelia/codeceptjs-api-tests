import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.email(),
  /* eslint-disable @typescript-eslint/naming-convention */
  first_name: z.string(),
  last_name: z.string(),
  /* eslint-enable @typescript-eslint/naming-convention */
  avatar: z.url()
});
