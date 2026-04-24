import { createFileRoute, redirect } from '@tanstack/react-router';

import { getSession } from '@/server/auth';

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const data = await getSession();

        if (!data) throw redirect({ to: '/login' });

        throw redirect({ to: '/dashboard' });
    }
});
