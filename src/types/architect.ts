import { z } from 'zod/v4';

export const createArchitectSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.email('E-mail inválido'),
    office_email: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.email('E-mail inválido').optional()),
    phone: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    office_address: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    birthdate: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    cau_register: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    observation: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    photo_url: z.string()
});

export const updateArchitectSchema = createArchitectSchema.extend({ id: z.uuid() });

export type CreateArchitectInput = z.infer<typeof createArchitectSchema>;
export type UpdateArchitectInput = z.infer<typeof updateArchitectSchema>;
