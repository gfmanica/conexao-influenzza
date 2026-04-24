import { createFileRoute, redirect } from '@tanstack/react-router';

import { LoginForm } from '@/components/login/login-form';
import { getSession } from '@/server/auth';

export const Route = createFileRoute('/_auth/login')({
    beforeLoad: async () => {
        const data = await getSession();

        if (data) throw redirect({ to: '/dashboard' });
    },
    component: Login
});

function Login() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-foreground hidden items-center justify-center lg:flex">
                <img
                    src="/logo/logomarca-vertical-white.png"
                    alt="Logo"
                    className="h-84 object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>

            <div className="relative flex flex-col items-center justify-center gap-12 p-6 sm:gap-12 md:p-10">
                <img
                    src="/logo/logomarca-vertical-black.png"
                    alt="Logo"
                    className="-mt-16 block h-22 object-cover [image-rendering:-webkit-optimize-contrast] lg:hidden dark:brightness-[0.2] dark:grayscale"
                />

                <div className="w-full max-w-xs">
                    <LoginForm />
                </div>

                <div className="text-muted-foreground absolute right-0 bottom-6 left-0 text-center text-xs">
                    &copy; {new Date().getFullYear()} Influenzza Caza. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}
