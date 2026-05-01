import { z } from 'zod/v4';

import type { listPointEntries } from '@/routes/(app)/points/-server';

export type PointEntry = Awaited<ReturnType<typeof listPointEntries>>['data'][number];

export type PointEntryArchitect = NonNullable<PointEntry['architect']>;

export const createPointEntrySchema = z.object({
    architect: z.nullable(z.object({ id: z.uuid() })),
    pointType: z.string().min(1, 'Tipo de ponto é obrigatório'),
    amount: z.number().int().positive('Quantidade deve ser maior que zero'),
    entryDate: z.string().min(1, 'Data é obrigatória')
});

export const updatePointEntrySchema = createPointEntrySchema.extend({ id: z.uuid() });

export type CreatePointEntryInput = z.infer<typeof createPointEntrySchema>;
export type UpdatePointEntryInput = z.infer<typeof updatePointEntrySchema>;
