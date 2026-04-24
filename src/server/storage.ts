import { createServerFn } from '@tanstack/react-start';

export const uploadAvatar = createServerFn({ method: 'POST' })
    .inputValidator((data: FormData) => data)
    .handler(async () => {
        // const file = data.get('file') as File;
        // const architectId = data.get('architect_id') as string;
        // if (!file || !architectId) {
        //     throw new Error('Arquivo e ID do arquiteto são obrigatórios.');
        // }
        // const r2 = getR2();
        // const ext = file.name.split('.').pop();
        // const key = `${architectId}/avatar.${ext}`;
        // await r2.put(key, file.stream(), {
        //     httpMetadata: { contentType: file.type }
        // });
        // // R2_PUBLIC_URL: URL pública do bucket R2 (configurar após criar bucket)
        // const publicUrl = `${getCloudflareEnv().R2_PUBLIC_URL}/${key}`;
        // const db = getDb();
        // await db
        //     .update(architects)
        //     .set({ photoUrl: publicUrl })
        //     .where(eq(architects.id, architectId));
        // return { photo_url: publicUrl };
    });
