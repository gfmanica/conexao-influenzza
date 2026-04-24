import { z } from 'zod/v4';

export const createPointEntrySchema = z.object({
    user_id: z.uuid('Arquiteto é obrigatório'),
    point_type: z.string().min(1, 'Tipo de ponto é obrigatório'),
    amount: z.number().int().positive('Quantidade deve ser maior que zero'),
    entry_date: z.string().min(1, 'Data é obrigatória')
});

export const updatePointEntrySchema = createPointEntrySchema.extend({ id: z.uuid() });

export type CreatePointEntryInput = z.infer<typeof createPointEntrySchema>;
export type UpdatePointEntryInput = z.infer<typeof updatePointEntrySchema>;
