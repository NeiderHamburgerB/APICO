import { z } from 'zod';

export const UpdateOrderStatusSchema = z.object({
  deliveredAt: z.date().optional()
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
