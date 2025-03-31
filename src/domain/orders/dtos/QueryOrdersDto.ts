import { z } from 'zod';

export const QueryOrdersSchema = z.object({
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "startDate debe ser una fecha válida"
  }).transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "endDate debe ser una fecha válida"
  }).transform(val => val ? new Date(val) : undefined),
  status: z.string().optional(),
  assignedCarrierId: z.string().optional().refine(val => !val || !isNaN(Number(val)), {
    message: "assignedCarrierId debe ser un número"
  }).transform(val => val ? Number(val) : undefined),
  code: z.string().optional(),
});

export type QueryOrdersDto = z.infer<typeof QueryOrdersSchema>;
