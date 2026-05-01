import { createFileRoute } from '@tanstack/react-router';

import { RegisterForm } from '@/components/architects/register-form';

export const Route = createFileRoute('/(auth)/register/')({
    component: RegisterForm
});
