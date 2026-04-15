import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { verifyOtp } from '@/server/auth';
import { useLoginStore } from '@/store/use-login-store';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

export function OtpForm({ className }: React.ComponentProps<'form'>) {
    const email = useLoginStore((state) => state.email);
    const setStep = useLoginStore((state) => state.setStep);
    const reset = useLoginStore((state) => state.reset);
    const router = useRouter();

    const form = useForm({
        defaultValues: { otp: '' },
        onSubmit: async ({ value }) => {
            try {
                await verifyOtp({ data: { email, token: value.otp } });
                reset();
                await router.invalidate();
                router.navigate({ to: '/dashboard' });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Código inválido ou expirado.');
            }
        }
    });

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="font-heading text-3xl">Código de verificação</h1>

                    <p className="text-muted-foreground text-sm text-balance">
                        Digite o código de 6 dígitos enviado para <br />
                        <strong className="text-foreground">{email}</strong> para continuar.
                    </p>
                </div>

                <form.Field
                    name="otp"
                    validators={{
                        onChange: ({ value }) => (value.length === 6 ? undefined : undefined),
                        onSubmit: ({ value }) =>
                            value.length !== 6 ? 'Código deve ter 6 dígitos' : undefined
                    }}
                >
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && field.state.meta.errors.length > 0;

                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Código</FieldLabel>

                                <InputOTP
                                    maxLength={6}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    data-invalid={isInvalid}
                                    value={field.state.value}
                                    onChange={(value) => field.handleChange(value)}
                                    onBlur={field.handleBlur}
                                >
                                    <InputOTPGroup className="w-full [&>div]:flex-1">
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>

                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors.map((e) => ({
                                            message: String(e)
                                        }))}
                                    />
                                )}
                            </Field>
                        );
                    }}
                </form.Field>

                <div className="flex flex-col gap-3">
                    <Field>
                        <form.Subscribe selector={(s) => s.isSubmitting}>
                            {(isSubmitting) => (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="transition-transform duration-160 ease-out active:scale-[0.97]"
                                >
                                    {isSubmitting ? 'Validando...' : 'Validar código'}
                                </Button>
                            )}
                        </form.Subscribe>
                    </Field>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep('email')}
                        className="transition-transform duration-160 ease-out active:scale-[0.97]"
                    >
                        Voltar
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}
