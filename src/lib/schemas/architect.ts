import { z } from 'zod/v4';

export const createArchitectSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    office_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    office_address: z.string().optional(),
    birthdate: z.string().optional(),
    cau_register: z.string().optional(),
    observation: z.string().optional()
});

export const updateArchitectSchema = createArchitectSchema
    .omit({ email: true })
    .extend({
        id: z.string().uuid(),
        email: z.string().email('E-mail inválido').optional(),
        photo_url: z.string().nullable().optional()
    });

export type CreateArchitectInput = z.infer<typeof createArchitectSchema>;
export type UpdateArchitectInput = z.infer<typeof updateArchitectSchema>;
