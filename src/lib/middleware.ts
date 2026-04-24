import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';

export const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequest().headers });

    if (!session) throw new Error('Não autenticado.');

    return next({ context: { session } });
});

export const adminMiddleware = createMiddleware({ type: 'function' })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
        if (context.session.user.role !== 'admin') throw new Error('Acesso negado.');

        return next();
    });
