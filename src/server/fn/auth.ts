import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

import {
    getSupabaseAdminClient,
    getSupabaseServerClient
} from '@/lib/supabase/server';

/**
 * Solicita envio de OTP para o e-mail informado.
 * Valida se o e-mail existe como architect ou admin antes de enviar.
 */
export const requestOtp = createServerFn({ method: 'POST' })
    .inputValidator(z.object({ email: z.string().email() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        // Verificar se é arquiteto
        const { data: architect } = await supabase
            .from('architects')
            .select('id')
            .eq('email', data.email)
            .maybeSingle();

        // Se não for arquiteto, verificar se é admin
        if (!architect) {
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const authUser = authUsers?.users.find(
                (u: { email?: string }) => u.email === data.email
            );
            if (!authUser) {
                throw new Error('E-mail não cadastrado no sistema.');
            }
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('auth_user_id', authUser.id)
                .eq('role', 'admin')
                .maybeSingle();
            if (!profile) {
                throw new Error('E-mail não cadastrado no sistema.');
            }
        }

        const { error } = await supabase.auth.signInWithOtp({
            email: data.email
        });
        if (error) throw new Error(error.message);

        return { message: 'OTP enviado com sucesso' };
    });

/**
 * Verifica o código OTP e retorna JWT + role.
 * No primeiro login do arquiteto, cria user_profile e vincula.
 */
export const verifyOtp = createServerFn({ method: 'POST' })
    .inputValidator(
        z.object({ email: z.string().email(), token: z.string().length(6) })
    )
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const admin = getSupabaseAdminClient();

        const { data: session, error } = await supabase.auth.verifyOtp({
            email: data.email,
            token: data.token,
            type: 'email'
        });

        if (error || !session.user) throw new Error('Código OTP inválido.');

        const authUserId = session.user.id;

        // Verificar se já existe user_profile
        const { data: profile } = await admin
            .from('user_profiles')
            .select('id, role')
            .eq('auth_user_id', authUserId)
            .maybeSingle();

        if (profile) {
            const architectId =
                profile.role === 'architect'
                    ? (
                          await admin
                              .from('architects')
                              .select('id')
                              .eq('user_id', profile.id)
                              .single()
                      ).data?.id
                    : undefined;

            return {
                access_token: session.session!.access_token,
                refresh_token: session.session!.refresh_token,
                role: profile.role,
                architect_id: architectId
            };
        }

        // Primeiro login — verificar se é arquiteto
        const { data: architect } = await admin
            .from('architects')
            .select('id')
            .eq('email', data.email)
            .maybeSingle();

        if (architect) {
            const { data: newProfile } = await admin
                .from('user_profiles')
                .insert({ auth_user_id: authUserId, role: 'architect' })
                .select('id')
                .single();

            await admin
                .from('architects')
                .update({ user_id: newProfile!.id })
                .eq('id', architect.id);

            return {
                access_token: session.session!.access_token,
                refresh_token: session.session!.refresh_token,
                role: 'architect' as const,
                architect_id: architect.id
            };
        }

        throw new Error('E-mail não cadastrado no sistema.');
    });

/**
 * Encerra a sessão do usuário.
 */
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
    return { success: true };
});

export type SessionUser = {
    email: string;
    role: 'admin' | 'architect';
    name: string;
    photo_url: string | null;
    architect_id?: string;
};

/**
 * Retorna o usuário logado ou null se não autenticado.
 */
export const getSession = createServerFn({ method: 'GET' }).handler(
    async (): Promise<SessionUser | null> => {
        const supabase = getSupabaseServerClient();

        const {
            data: { user }
        } = await supabase.auth.getUser();
        if (!user) return null;

        const admin = getSupabaseAdminClient();

        const { data: profile } = await admin
            .from('user_profiles')
            .select('id, role')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (!profile) return null;

        if (profile.role === 'architect') {
            const { data: architect } = await admin
                .from('architects')
                .select('id, name, photo_url')
                .eq('user_id', profile.id)
                .maybeSingle();

            return {
                email: user.email!,
                role: 'architect',
                name: architect?.name ?? user.email!,
                photo_url: architect?.photo_url ?? null,
                architect_id: architect?.id
            };
        }

        return {
            email: user.email!,
            role: 'admin',
            name: 'Administrador',
            photo_url: null
        };
    }
);
