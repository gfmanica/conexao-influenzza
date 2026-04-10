import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '@/components/login/LoginForm';
import { OtpForm } from '@/components/login/OtpForm';
import { cn } from '@/lib/utils';
import { useLoginStore } from '@/store/useLoginStore';

export const Route = createFileRoute('/_auth/login')({
    component: Login
});

function Login() {
    const step = useLoginStore((state) => state.step);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-foreground hidden items-center justify-center lg:flex">
                <img
                    src="/logo/logomarca-white.svg"
                    alt="Logo"
                    className="h-84 object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>

            <div className="relative flex flex-col items-center justify-center gap-8 p-6 sm:gap-12 md:p-10">
                <img
                    src="/logo/logomarca-black.svg"
                    alt="Logo"
                    className="-mt-38 block h-34 object-cover lg:hidden dark:brightness-[0.2] dark:grayscale"
                />

                <div className="grid w-full max-w-xs">
                    <div
                        className={cn(
                            'col-start-1 row-start-1 transition-all duration-300 ease-out',
                            step === 'email'
                                ? 'pointer-events-auto z-10 scale-100 opacity-100 blur-none'
                                : 'pointer-events-none z-0 scale-95 opacity-0 blur-[2px]'
                        )}
                    >
                        <LoginForm />
                    </div>

                    <div
                        className={cn(
                            'col-start-1 row-start-1 transition-all duration-300 ease-out',
                            step === 'otp'
                                ? 'pointer-events-auto z-10 scale-100 opacity-100 blur-none'
                                : 'pointer-events-none z-0 scale-95 opacity-0 blur-[2px]'
                        )}
                    >
                        <OtpForm />
                    </div>
                </div>

                <div className="text-muted-foreground absolute right-0 bottom-10 left-0 text-center text-xs">
                    &copy; {new Date().getFullYear()} Influenzza Cazza. Todos os
                    direitos reservados.
                </div>
            </div>
        </div>
    );
}
