import { z } from 'zod';

export const GetOrdersStatusSchema = z.object({});

export type GetOrdersStatusDto = z.infer<typeof GetOrdersStatusSchema>;
