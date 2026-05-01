import { createFileRoute, redirect } from '@tanstack/react-router';

import { LoginForm } from '@/components/login/login-form';
import { getSession } from '@/server/auth';

export const Route = createFileRoute('/(auth)/login/')({
    beforeLoad: async () => {
        const data = await getSession();

        if (data) throw redirect({ to: '/dashboard' });
    },
    component: LoginForm
});
