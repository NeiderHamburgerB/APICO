import { z } from 'zod';

export const createOrdersSchema = z.object({
  code: z.string().optional(),
  userId: z.number().optional(),
  packageWeight: z.number(),
  packageDimensionWidth: z.number(),
  packageDimensionHeight: z.number(),
  packageDimensionLength: z.number(),
  typeProduct: z.string(),
  originCityId: z.number().min(1),
  destinationCityId: z.number().min(1),
  destinationAddress: z.string(),
  status: z.string().default('En espera'),
  estimatedDeliveryTime: z.string().optional(),
  deliveredAt: z.string().optional()
});

export type CreateOrdersDto = z.infer<typeof createOrdersSchema>;
