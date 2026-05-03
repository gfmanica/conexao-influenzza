import { z } from 'zod/v4';

import type { listPoints } from '@/routes/(app)/points/-server';

export type Point = Awaited<ReturnType<typeof listPoints>>['data'][number];

export type PointArchitect = NonNullable<Point['architect']>;

export const createPointSchema = z.object({
    architect: z.object({ id: z.uuid() }),
    pointType: z.string().min(1, 'Tipo de ponto é obrigatório'),
    amount: z.number().int().positive('Quantidade deve ser maior que zero'),
    entryDate: z.string().min(1, 'Data é obrigatória')
});

export const updatePointSchema = createPointSchema.extend({ id: z.uuid() });

export type CreatePointInput = z.infer<typeof createPointSchema>;
export type UpdatePointInput = z.infer<typeof updatePointSchema>;
