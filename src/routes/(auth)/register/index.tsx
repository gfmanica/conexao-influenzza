import { createFileRoute } from '@tanstack/react-router';

import { RegisterForm } from '@/routes/(auth)/register/-components/register-form';

export const Route = createFileRoute('/(auth)/register/')({
    component: RegisterForm
});
