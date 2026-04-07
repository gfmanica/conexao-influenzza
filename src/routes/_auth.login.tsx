import { createFileRoute } from '@tanstack/react-router';

import { useLoginStore } from '@/store/useLoginStore';
import { cn } from '@/lib/utils';

import { LoginForm } from '@/components/login/LoginForm';
import { OtpForm } from '@/components/login/OtpForm';

export const Route = createFileRoute('/_auth/login')({
    component: Login
});

function Login() {
    const step = useLoginStore((state) => state.step);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/placeholder.svg"
                    alt="Logo"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>

            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs relative grid">
                        <div
                            className={cn(
                                "col-start-1 row-start-1 transition-all duration-300 ease-out",
                                step === 'email'
                                    ? "opacity-100 scale-100 blur-none pointer-events-auto z-10"
                                    : "opacity-0 scale-95 blur-[2px] pointer-events-none z-0"
                            )}
                        >
                            <LoginForm />
                        </div>
                        <div
                            className={cn(
                                "col-start-1 row-start-1 transition-all duration-300 ease-out",
                                step === 'otp'
                                    ? "opacity-100 scale-100 blur-none pointer-events-auto z-10"
                                    : "opacity-0 scale-95 blur-[2px] pointer-events-none z-0"
                            )}
                        >
                            <OtpForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
