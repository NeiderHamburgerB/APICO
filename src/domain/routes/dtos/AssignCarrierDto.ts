import { z } from 'zod';

export const AssignCarrierSchema = z.object({
  carrierId: z.number()
});

export type AssignCarrierDto = z.infer<typeof AssignCarrierSchema>;
