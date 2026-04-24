import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';

/**
 * Faz logout do usuário.
 */
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
    await auth.api.signOut({ headers: getRequest().headers });

    return { success: true };
});
