import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

import { adminMiddleware, authMiddleware } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'conexao-influenzza-dev';

export const uploadAvatar = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(
        z.object({
            fileBase64: z.string(),
            fileName: z.string(),
            contentType: z.string(),
            email: z.email()
        })
    )
    .handler(async ({ data }) => {
        const ext = data.fileName.split('.').pop()?.toLowerCase();
        const path = `avatars/${data.email}.${ext}`;
        const buffer = Buffer.from(data.fileBase64, 'base64');

        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(path, buffer, { contentType: data.contentType, upsert: true });

        if (error) throw new Error(`Erro ao enviar imagem: ${error.message}`);

        return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    });

/**
 * Upload de avatar pelo próprio usuário logado.
 */
export const uploadOwnAvatar = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(
        z.object({
            fileBase64: z.string(),
            fileName: z.string(),
            contentType: z.string()
        })
    )
    .handler(async ({ data, context }) => {
        const email = context.session.user.email;
        const ext = data.fileName.split('.').pop()?.toLowerCase();
        const path = `avatars/${email}.${ext}`;
        const buffer = Buffer.from(data.fileBase64, 'base64');

        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(path, buffer, { contentType: data.contentType, upsert: true });

        if (error) throw new Error(`Erro ao enviar imagem: ${error.message}`);

        return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    });
