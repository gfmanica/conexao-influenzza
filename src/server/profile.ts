import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { authMiddleware } from '@/lib/middleware';

const updateProfileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
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

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Atualiza o perfil do próprio usuário logado.
 */
export const updateProfile = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(updateProfileSchema)
    .handler(async ({ data, context }) => {
        const userId = context.session.user.id;
        const role = context.session.user.role;

        const updateData: Record<string, unknown> = {
            name: data.name,
            photoUrl: data.photoUrl,
            updatedAt: new Date()
        };

        // Arquitetos podem atualizar campos adicionais
        if (role === 'architect') {
            updateData.officeEmail = data.officeEmail;
            updateData.phone = data.phone;
            updateData.officeAddress = data.officeAddress;
            updateData.birthdate = data.birthdate;
            updateData.cauRegister = data.cauRegister;
            updateData.observation = data.observation;
        }

        const [updated] = await db
            .update(user)
            .set(updateData)
            .where(eq(user.id, userId))
            .returning({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl
            });

        if (!updated) throw new Error('Usuário não encontrado.');

        return updated;
    });
