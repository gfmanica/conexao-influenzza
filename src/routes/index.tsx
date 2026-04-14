// routes/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

import { getSession } from '@/server/fn/auth';

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const user = await getSession();

        if (!user) throw redirect({ to: '/login' });

        throw redirect({ to: '/dashboard' });
    }
});
