import { z } from 'zod';

export const AssignRouteSchema = z.object({
  orderId: z.number()
});

export type AssignRouteDto = z.infer<typeof AssignRouteSchema>;
