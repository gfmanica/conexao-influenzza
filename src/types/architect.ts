import { z } from 'zod/v4';

import type { listArchitects } from '@/server/architects';

export type Architect = Awaited<ReturnType<typeof listArchitects>>['data'][number];

export const createArchitectSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.email('E-mail inválido'),
    officeEmail: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.email('E-mail inválido').optional()),
    phone: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    officeAddress: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    birthdate: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    cauRegister: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    observation: z
        .string()
        .transform((v) => v || undefined)
        .pipe(z.string().optional()),
    photoUrl: z.string()
});

export const updateArchitectSchema = createArchitectSchema.extend({ id: z.uuid() });

export type CreateArchitectInput = z.infer<typeof createArchitectSchema>;
export type UpdateArchitectInput = z.infer<typeof updateArchitectSchema>;
