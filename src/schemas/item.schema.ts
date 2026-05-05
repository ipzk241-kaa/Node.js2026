import { z } from 'zod';

export const categoryEnum = z.enum(['Basic', 'Upgraded', 'Neutral']);

export const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cost: z.number().min(0),
  category: categoryEnum,
});

export const updateSchema = createSchema.partial();

export type ItemInput = z.infer<typeof createSchema>;

export type Item = ItemInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};