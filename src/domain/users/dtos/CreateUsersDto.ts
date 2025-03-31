import { z } from 'zod';

export const createUsersSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  roleId: z.number().min(1, { message: 'Role must be valid' })
});

export type CreateUsersDto = z.infer<typeof createUsersSchema>;
