import { createServerFn } from '@tanstack/react-start';

import { getSupabaseAdminClient } from '@/lib/supabase/server';

export const uploadAvatar = createServerFn({ method: 'POST' })
    .inputValidator((data: FormData) => data)
    .handler(async ({ data }) => {
        const file = data.get('file') as File;
        const architectId = data.get('architect_id') as string;

        if (!file || !architectId)
            throw new Error('Arquivo e ID do arquiteto são obrigatórios.');

        const supabase = getSupabaseAdminClient();
        const ext = file.name.split('.').pop();
        const path = `${architectId}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const {
            data: { publicUrl }
        } = supabase.storage.from('avatars').getPublicUrl(path);

        await supabase
            .from('architects')
            .update({ photo_url: publicUrl })
            .eq('id', architectId);

        return { photo_url: publicUrl };
    });
